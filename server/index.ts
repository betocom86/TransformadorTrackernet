import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { seedUsers } from "./seed-users";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Server readiness flag for health checks
let serverReady = false;

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Error handling middleware - must be after routes
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  const environment = process.env.NODE_ENV || "development";
  
    server.listen(port, host, () => {
      serverReady = true;
      log(`serving on ${host}:${port}`);
      log(`Environment: ${environment}`);
      log('Server is ready for health checks');
      
      // Initialize database with seed data after server is running (non-blocking)
      setTimeout(() => {
        seedDatabase().then(() => {
          log("Database seeding completed");
        }).catch(err => {
          log(`Seed warning: ${err.message}`);
        });
        
        seedUsers().then(() => {
          log("User seeding completed");
        }).catch(err => {
          log(`Users warning: ${err.message}`);
        });
      }, 100); // Minimal delay for seeding to allow immediate health check responses
    });
    
    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        log('Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      log('SIGINT received, shutting down gracefully');
      server.close(() => {
        log('Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
