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

// Initialize server with proper async handling and keep-alive mechanism
async function startServer() {
  try {
    const server = await registerRoutes(app);

    // Error handling middleware - must be after routes
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // Setup Vite in development or serve static files in production
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000 - this serves both API and client
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.HOST || "0.0.0.0";
    const environment = process.env.NODE_ENV || "development";
    
    // Start server with proper error handling
    server.listen(port, host, () => {
      // Set serverReady flag IMMEDIATELY for deployment health checks
      serverReady = true;
      log(`serving on ${host}:${port}`);
      log(`Environment: ${environment}`);
      log('Server is ready for health checks');
      
      // Initialize database with seed data after server is running (non-blocking)
      // Use setImmediate for fastest health check response
      setImmediate(() => {
        seedUsers().then(() => {
          log("User seeding completed");
        }).catch(err => {
          log(`Users warning: ${err.message}`);
        });
        
        seedDatabase().then(() => {
          log("Database seeding completed");
        }).catch(err => {
          log(`Seed warning: ${err.message}`);
        });
      });
    });
    
    // Server event handlers for proper lifecycle management
    server.on('listening', () => {
      log(`Server successfully bound to ${host}:${port}`);
      log('Production server is ready and listening for connections');
    });

    server.on('error', (error: any) => {
      console.error('Server startup error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
      }
      process.exit(1);
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

    // Keep process alive - prevent immediate exit
    setInterval(() => {
      // Empty interval to prevent process from exiting immediately
    }, 30000);
    
    return server;
    
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  console.error("Server initialization failed:", error);
  process.exit(1);
});
