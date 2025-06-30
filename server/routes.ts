import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { 
  insertPersonnelSchema, insertDocumentSchema, insertProjectSchema, 
  insertProjectAssignmentSchema, insertSafetyEquipmentSchema, 
  insertTrainingSchema, insertAlertSchema, insertUserSchema,
  insertCrewSchema, insertCrewMemberSchema, insertWorkOrderSchema,
  insertRouteSchema, insertWorkOrderPhotoSchema, insertWorkOrderStepSchema
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { processWorkOrderPhoto } from "./utils/watermark";
import fs from "fs/promises";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Session configuration
const PgSession = connectPg(session);
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Middleware para verificar autenticación
function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'No autorizado' });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoints - must be registered before other middleware
  // These respond immediately without database operations for deployment health checks
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      },
      timestamp: new Date().toISOString() 
    });
  });

  // Readiness check endpoint for deployments
  app.get('/api/ready', (req, res) => {
    res.status(200).json({ 
      status: 'ready',
      service: 'PROSECU Personnel Management',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      pid: process.pid,
      timestamp: new Date().toISOString()
    });
  });

  // Root endpoint for deployment health checks (production only)
  if (process.env.NODE_ENV === 'production') {
    app.get('/', (req, res) => {
      res.status(200).json({ 
        status: 'ok', 
        service: 'PROSECU Personnel Management',
        version: '1.0.0',
        environment: 'production',
        timestamp: new Date().toISOString() 
      });
    });
  }

  // Configurar sesiones
  app.use(session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Cambiar a true en producción con HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    }
  }));

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Usuario y contraseña requeridos" });
      }

      const user = await storage.validateUserCredentials(username, password);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Crear sesión
      req.session.userId = user.id;
      req.session.userRole = user.role;
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role,
          fullName: user.fullName 
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error al cerrar sesión" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Sesión cerrada exitosamente" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "No autenticado" });
    }
    
    storage.getUser(req.session.userId).then(user => {
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        fullName: user.fullName 
      });
    }).catch(error => {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Verificar si el usuario ya existe
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }

      const user = await storage.createUser(validatedData);
      res.status(201).json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role,
          fullName: user.fullName 
        } 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Error en el registro", error });
    }
  });

  // Personnel routes
  app.get("/api/personnel", async (req, res) => {
    try {
      const personnel = await storage.getAllPersonnel();
      res.json(personnel);
    } catch (error) {
      res.status(500).json({ message: "Error fetching personnel" });
    }
  });

  app.get("/api/personnel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const person = await storage.getPersonnel(id);
      if (!person) {
        return res.status(404).json({ message: "Personnel not found" });
      }
      res.json(person);
    } catch (error) {
      res.status(500).json({ message: "Error fetching personnel" });
    }
  });

  app.post("/api/personnel", async (req, res) => {
    try {
      const validatedData = insertPersonnelSchema.parse(req.body);
      const person = await storage.createPersonnel(validatedData);
      res.status(201).json(person);
    } catch (error) {
      res.status(400).json({ message: "Invalid personnel data", error });
    }
  });

  app.put("/api/personnel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPersonnelSchema.partial().parse(req.body);
      const person = await storage.updatePersonnel(id, validatedData);
      if (!person) {
        return res.status(404).json({ message: "Personnel not found" });
      }
      res.json(person);
    } catch (error) {
      res.status(400).json({ message: "Invalid personnel data", error });
    }
  });

  app.delete("/api/personnel/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePersonnel(id);
      if (!deleted) {
        return res.status(404).json({ message: "Personnel not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting personnel" });
    }
  });

  // Documents routes
  app.get("/api/documents", async (req, res) => {
    try {
      const personnelId = req.query.personnelId ? parseInt(req.query.personnelId as string) : undefined;
      const documents = personnelId 
        ? await storage.getDocumentsByPersonnel(personnelId)
        : await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching documents" });
    }
  });

  app.post("/api/documents", upload.single('file'), async (req, res) => {
    try {
      const documentData = {
        ...req.body,
        personnelId: parseInt(req.body.personnelId),
        filePath: req.file?.path || null,
        fileName: req.file?.originalname || null,
        fileSize: req.file?.size || null,
        mimeType: req.file?.mimetype || null,
      };
      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: "Invalid document data", error });
    }
  });

  app.put("/api/documents/:id/upload", upload.single('file'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = {
        filePath: req.file?.path || null,
        fileName: req.file?.originalname || null,
        fileSize: req.file?.size || null,
        mimeType: req.file?.mimetype || null,
      };
      const document = await storage.updateDocument(id, updateData);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(400).json({ message: "Error uploading file", error });
    }
  });

  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document || !document.filePath) {
        return res.status(404).json({ message: "Document or file not found" });
      }
      
      res.download(document.filePath, document.fileName || 'document');
    } catch (error) {
      res.status(500).json({ message: "Error downloading file" });
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDocumentSchema.partial().parse(req.body);
      const document = await storage.updateDocument(id, validatedData);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(400).json({ message: "Invalid document data", error });
    }
  });

  app.get("/api/documents/expiring/:days", async (req, res) => {
    try {
      const days = parseInt(req.params.days);
      const documents = await storage.getExpiringDocuments(days);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching expiring documents" });
    }
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const projects = activeOnly 
        ? await storage.getActiveProjects()
        : await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data", error });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, validatedData);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data", error });
    }
  });

  // Project assignments routes
  app.get("/api/assignments", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const personnelId = req.query.personnelId ? parseInt(req.query.personnelId as string) : undefined;
      
      let assignments;
      if (projectId) {
        assignments = await storage.getAssignmentsByProject(projectId);
      } else if (personnelId) {
        assignments = await storage.getAssignmentsByPersonnel(personnelId);
      } else {
        return res.status(400).json({ message: "projectId or personnelId required" });
      }
      
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching assignments" });
    }
  });

  app.post("/api/assignments", async (req, res) => {
    try {
      const validatedData = insertProjectAssignmentSchema.parse(req.body);
      const assignment = await storage.createAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      res.status(400).json({ message: "Invalid assignment data", error });
    }
  });

  app.put("/api/assignments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProjectAssignmentSchema.partial().parse(req.body);
      const assignment = await storage.updateAssignment(id, validatedData);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      res.status(400).json({ message: "Invalid assignment data", error });
    }
  });

  app.delete("/api/assignments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAssignment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting assignment" });
    }
  });

  // Safety equipment routes
  app.get("/api/equipment/:personnelId", async (req, res) => {
    try {
      const personnelId = parseInt(req.params.personnelId);
      const equipment = await storage.getEquipmentByPersonnel(personnelId);
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Error fetching equipment" });
    }
  });

  app.post("/api/equipment", async (req, res) => {
    try {
      const validatedData = insertSafetyEquipmentSchema.parse(req.body);
      const equipment = await storage.createEquipment(validatedData);
      res.status(201).json(equipment);
    } catch (error) {
      res.status(400).json({ message: "Invalid equipment data", error });
    }
  });

  app.put("/api/equipment/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSafetyEquipmentSchema.partial().parse(req.body);
      const equipment = await storage.updateEquipment(id, validatedData);
      if (!equipment) {
        return res.status(404).json({ message: "Equipment not found" });
      }
      res.json(equipment);
    } catch (error) {
      res.status(400).json({ message: "Invalid equipment data", error });
    }
  });

  app.get("/api/equipment", async (req, res) => {
    try {
      const personnelId = req.query.personnelId ? parseInt(req.query.personnelId as string) : null;
      if (!personnelId) {
        return res.status(400).json({ message: "personnelId required" });
      }
      const equipment = await storage.getEquipmentByPersonnel(personnelId);
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Error fetching equipment" });
    }
  });

  // Training routes
  app.get("/api/training/:personnelId", async (req, res) => {
    try {
      const personnelId = parseInt(req.params.personnelId);
      const training = await storage.getTrainingByPersonnel(personnelId);
      res.json(training);
    } catch (error) {
      res.status(500).json({ message: "Error fetching training" });
    }
  });

  app.post("/api/training", async (req, res) => {
    try {
      const validatedData = insertTrainingSchema.parse(req.body);
      const training = await storage.createTraining(validatedData);
      res.status(201).json(training);
    } catch (error) {
      res.status(400).json({ message: "Invalid training data", error });
    }
  });

  app.get("/api/training/expiring/:days", async (req, res) => {
    try {
      const days = parseInt(req.params.days);
      const training = await storage.getExpiringTraining(days);
      res.json(training);
    } catch (error) {
      res.status(500).json({ message: "Error fetching expiring training" });
    }
  });

  // Alerts routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const alerts = activeOnly 
        ? await storage.getActiveAlerts()
        : await storage.getAllAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data", error });
    }
  });

  app.put("/api/alerts/:id/acknowledge", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const acknowledged = await storage.acknowledgeAlert(id);
      if (!acknowledged) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json({ message: "Alert acknowledged" });
    } catch (error) {
      res.status(500).json({ message: "Error acknowledging alert" });
    }
  });

  app.put("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const resolved = await storage.resolveAlert(id);
      if (!resolved) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json({ message: "Alert resolved" });
    } catch (error) {
      res.status(500).json({ message: "Error resolving alert" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  // Compliance routes
  app.get("/api/compliance/overview", async (req, res) => {
    try {
      const personnel = await storage.getAllPersonnel();
      const documents = await storage.getAllDocuments();
      
      const totalRequirements = 45;
      const criticalRequirements = 8;
      const completedRequirements = Math.floor(totalRequirements * 0.7);
      const criticalCompliant = Math.floor(criticalRequirements * 0.6);
      
      const overview = {
        totalPersonnel: personnel.length,
        totalRequirements,
        criticalRequirements,
        completedRequirements,
        criticalCompliant,
        complianceRate: Math.round((completedRequirements / totalRequirements) * 100),
        criticalComplianceRate: Math.round((criticalCompliant / criticalRequirements) * 100),
        expiredDocuments: documents.filter(doc => {
          if (!doc.expirationDate) return false;
          return new Date(doc.expirationDate) < new Date();
        }).length,
        expiringSoon: documents.filter(doc => {
          if (!doc.expirationDate) return false;
          const daysUntilExpiration = Math.ceil(
            (new Date(doc.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysUntilExpiration > 0 && daysUntilExpiration <= 30;
        }).length
      };
      
      res.json(overview);
    } catch (error) {
      console.error("Error getting compliance overview:", error);
      res.status(500).json({ error: "Failed to get compliance overview" });
    }
  });

  // ====== CUADRILLAS (CREWS) ROUTES ======
  app.get("/api/crews", async (req, res) => {
    try {
      const crews = await storage.getAllCrews();
      res.json(crews);
    } catch (error) {
      res.status(500).json({ message: "Error fetching crews" });
    }
  });

  app.get("/api/crews/available", async (req, res) => {
    try {
      const crews = await storage.getAvailableCrews();
      res.json(crews);
    } catch (error) {
      res.status(500).json({ message: "Error fetching available crews" });
    }
  });

  app.get("/api/crews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const crew = await storage.getCrew(id);
      if (!crew) {
        return res.status(404).json({ message: "Crew not found" });
      }
      res.json(crew);
    } catch (error) {
      res.status(500).json({ message: "Error fetching crew" });
    }
  });

  app.post("/api/crews", async (req, res) => {
    try {
      const validatedData = insertCrewSchema.parse(req.body);
      const crew = await storage.createCrew(validatedData);
      res.status(201).json(crew);
    } catch (error) {
      res.status(400).json({ message: "Invalid crew data", error });
    }
  });

  app.put("/api/crews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCrewSchema.partial().parse(req.body);
      const crew = await storage.updateCrew(id, validatedData);
      if (!crew) {
        return res.status(404).json({ message: "Crew not found" });
      }
      res.json(crew);
    } catch (error) {
      res.status(400).json({ message: "Invalid crew data", error });
    }
  });

  app.delete("/api/crews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCrew(id);
      if (!deleted) {
        return res.status(404).json({ message: "Crew not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting crew" });
    }
  });

  // Crew Members routes
  app.get("/api/crews/:id/members", async (req, res) => {
    try {
      const crewId = parseInt(req.params.id);
      const members = await storage.getCrewMembers(crewId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Error fetching crew members" });
    }
  });

  app.post("/api/crew-members", async (req, res) => {
    try {
      const validatedData = insertCrewMemberSchema.parse(req.body);
      const member = await storage.addCrewMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      res.status(400).json({ message: "Invalid crew member data", error });
    }
  });

  app.delete("/api/crew-members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.removeCrewMember(id);
      if (!deleted) {
        return res.status(404).json({ message: "Crew member not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error removing crew member" });
    }
  });

  // ====== ÓRDENES DE TRABAJO (WORK ORDERS) ROUTES ======
  app.get("/api/work-orders", async (req, res) => {
    try {
      const status = req.query.status as string;
      const crewId = req.query.crewId ? parseInt(req.query.crewId as string) : undefined;
      
      let workOrders;
      if (status) {
        workOrders = await storage.getWorkOrdersByStatus(status);
      } else if (crewId) {
        workOrders = await storage.getWorkOrdersByCrew(crewId);
      } else {
        workOrders = await storage.getAllWorkOrders();
      }
      
      res.json(workOrders);
    } catch (error) {
      res.status(500).json({ message: "Error fetching work orders" });
    }
  });

  app.get("/api/work-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workOrder = await storage.getWorkOrder(id);
      if (!workOrder) {
        return res.status(404).json({ message: "Work order not found" });
      }
      res.json(workOrder);
    } catch (error) {
      res.status(500).json({ message: "Error fetching work order" });
    }
  });

  app.post("/api/work-orders", async (req, res) => {
    try {
      const validatedData = insertWorkOrderSchema.parse(req.body);
      const workOrder = await storage.createWorkOrder(validatedData);
      res.status(201).json(workOrder);
    } catch (error) {
      res.status(400).json({ message: "Invalid work order data", error });
    }
  });

  app.put("/api/work-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertWorkOrderSchema.partial().parse(req.body);
      const workOrder = await storage.updateWorkOrder(id, validatedData);
      if (!workOrder) {
        return res.status(404).json({ message: "Work order not found" });
      }
      res.json(workOrder);
    } catch (error) {
      res.status(400).json({ message: "Invalid work order data", error });
    }
  });

  app.put("/api/work-orders/:id/assign/:crewId", async (req, res) => {
    try {
      const workOrderId = parseInt(req.params.id);
      const crewId = parseInt(req.params.crewId);
      const success = await storage.assignWorkOrderToCrew(workOrderId, crewId);
      if (!success) {
        return res.status(404).json({ message: "Work order or crew not found" });
      }
      res.json({ message: "Work order assigned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error assigning work order" });
    }
  });

  // ====== FOTOS DE ÓRDENES DE TRABAJO CON WATERMARKS ======
  app.get("/api/work-orders/:id/photos", async (req, res) => {
    try {
      const workOrderId = parseInt(req.params.id);
      const photos = await storage.getWorkOrderPhotos(workOrderId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching work order photos" });
    }
  });

  // Subida múltiple de fotos con watermarks automáticos
  app.post("/api/work-orders/:id/photos", upload.array('photos', 10), async (req, res) => {
    try {
      const workOrderId = parseInt(req.params.id);
      const files = req.files as Express.Multer.File[];
      const { photoType, description, personnelName, gpsLatitude, gpsLongitude } = req.body;
      const userId = (req.session as any)?.userId;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No photos uploaded" });
      }

      // Get work order to get the order number
      const workOrder = await storage.getWorkOrder(workOrderId);
      if (!workOrder) {
        return res.status(404).json({ message: "Work order not found" });
      }

      const uploadedPhotos = [];

      for (const file of files) {
        try {
          // Process photo with watermark
          const { watermarkedPath, originalPath } = await processWorkOrderPhoto(
            file.path,
            workOrder.orderNumber,
            personnelName || 'Usuario',
            photoType || 'general'
          );

          // Save photo info to database
          const photoData = {
            workOrderId,
            photoType: photoType || 'general',
            filePath: watermarkedPath,
            originalFilePath: originalPath,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            description: description || null,
            gpsLatitude: gpsLatitude ? parseFloat(gpsLatitude) : null,
            gpsLongitude: gpsLongitude ? parseFloat(gpsLongitude) : null,
            takenBy: userId,
            hasWatermark: true,
            watermarkText: `GC Electric - OT: ${workOrder.orderNumber}\\n${personnelName} - ${new Date().toLocaleDateString('es-MX')}`
          };

          const validatedData = insertWorkOrderPhotoSchema.parse(photoData);
          const savedPhoto = await storage.createWorkOrderPhoto(validatedData);
          uploadedPhotos.push(savedPhoto);

        } catch (photoError) {
          console.error('Error processing photo:', photoError);
          // Continue with other photos even if one fails
        }
      }

      res.status(201).json({
        message: `${uploadedPhotos.length} photos uploaded successfully`,
        photos: uploadedPhotos
      });

    } catch (error) {
      console.error('Error uploading work order photos:', error);
      res.status(500).json({ message: "Error uploading photos", error });
    }
  });

  app.get("/api/work-orders/:id/photos/:photoId/download", async (req, res) => {
    try {
      const photoId = parseInt(req.params.photoId);
      const photo = await storage.getWorkOrderPhotos(parseInt(req.params.id));
      const foundPhoto = photo.find(p => p.id === photoId);
      
      if (!foundPhoto || !foundPhoto.filePath) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      res.download(foundPhoto.filePath, foundPhoto.fileName || 'photo.jpg');
    } catch (error) {
      res.status(500).json({ message: "Error downloading photo" });
    }
  });

  app.delete("/api/work-order-photos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWorkOrderPhoto(id);
      if (!deleted) {
        return res.status(404).json({ message: "Photo not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting photo" });
    }
  });

  // ====== RUTAS OPTIMIZADAS ======
  app.get("/api/routes", async (req, res) => {
    try {
      const crewId = req.query.crewId ? parseInt(req.query.crewId as string) : undefined;
      const date = req.query.date as string;
      
      let routes;
      if (crewId) {
        routes = await storage.getRoutesByCrew(crewId);
      } else if (date) {
        routes = await storage.getRoutesByDate(date);
      } else {
        routes = await storage.getAllRoutes();
      }
      
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching routes" });
    }
  });

  app.post("/api/routes", async (req, res) => {
    try {
      const validatedData = insertRouteSchema.parse(req.body);
      const route = await storage.createRoute(validatedData);
      res.status(201).json(route);
    } catch (error) {
      res.status(400).json({ message: "Invalid route data", error });
    }
  });

  app.put("/api/routes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRouteSchema.partial().parse(req.body);
      const route = await storage.updateRoute(id, validatedData);
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      res.json(route);
    } catch (error) {
      res.status(400).json({ message: "Invalid route data", error });
    }
  });

  // Optimización de rutas (algoritmo simple)
  app.post("/api/routes/optimize", async (req, res) => {
    try {
      const { crewId, workOrderIds, routeDate, startLocation } = req.body;
      
      // Crear una ruta optimizada simple
      const optimizedRoute = {
        routeName: `Ruta Optimizada ${routeDate}`,
        crewId,
        routeDate,
        workOrderSequence: workOrderIds, // En una implementación real, aquí iría el algoritmo de optimización
        startLocation: startLocation || "Base GC Electric",
        endLocation: startLocation || "Base GC Electric",
        status: 'planned'
      };

      const validatedData = insertRouteSchema.parse(optimizedRoute);
      const route = await storage.createRoute(validatedData);
      res.status(201).json(route);
    } catch (error) {
      res.status(400).json({ message: "Error optimizing route", error });
    }
  });

  // ====== PASOS DE PROCEDIMIENTOS ======
  app.get("/api/work-orders/:id/steps", async (req, res) => {
    try {
      const workOrderId = parseInt(req.params.id);
      const steps = await storage.getWorkOrderSteps(workOrderId);
      res.json(steps);
    } catch (error) {
      res.status(500).json({ message: "Error fetching work order steps" });
    }
  });

  app.post("/api/work-order-steps", async (req, res) => {
    try {
      const validatedData = insertWorkOrderStepSchema.parse(req.body);
      const step = await storage.createWorkOrderStep(validatedData);
      res.status(201).json(step);
    } catch (error) {
      res.status(400).json({ message: "Invalid step data", error });
    }
  });

  app.put("/api/work-order-steps/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req.session as any)?.userId;
      const success = await storage.completeWorkOrderStep(id, userId);
      if (!success) {
        return res.status(404).json({ message: "Step not found" });
      }
      res.json({ message: "Step completed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error completing step" });
    }
  });

  // ====== TRANSFORMADORES ======
  app.get("/api/transformers", async (req, res) => {
    try {
      const transformers = await storage.getAllTransformers();
      res.json(transformers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching transformers" });
    }
  });

  app.get("/api/transformers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transformer = await storage.getTransformer(id);
      if (!transformer) {
        return res.status(404).json({ message: "Transformer not found" });
      }
      res.json(transformer);
    } catch (error) {
      res.status(500).json({ message: "Error fetching transformer" });
    }
  });

  app.post("/api/transformers", async (req, res) => {
    try {
      const transformerData = {
        ...req.body,
        status: req.body.status || 'active'
      };
      const transformer = await storage.createTransformer(transformerData);
      res.status(201).json(transformer);
    } catch (error) {
      res.status(400).json({ message: "Error creating transformer", error });
    }
  });

  app.put("/api/transformers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const transformer = await storage.updateTransformer(id, req.body);
      if (!transformer) {
        return res.status(404).json({ message: "Transformer not found" });
      }
      res.json(transformer);
    } catch (error) {
      res.status(400).json({ message: "Error updating transformer", error });
    }
  });

  app.delete("/api/transformers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTransformer(id);
      if (!deleted) {
        return res.status(404).json({ message: "Transformer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting transformer" });
    }
  });

  // ====== CATÁLOGO DE PROCEDIMIENTOS ======
  app.get("/api/procedures", async (req, res) => {
    try {
      const category = req.query.category as string;
      let procedures;
      
      if (category && category !== 'all') {
        procedures = await storage.getProceduresByCategory(category);
      } else {
        procedures = await storage.getAllProcedures();
      }
      
      res.json(procedures);
    } catch (error) {
      res.status(500).json({ message: "Error fetching procedures" });
    }
  });

  app.get("/api/procedures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const procedure = await storage.getProcedure(id);
      if (!procedure) {
        return res.status(404).json({ message: "Procedure not found" });
      }
      res.json(procedure);
    } catch (error) {
      res.status(500).json({ message: "Error fetching procedure" });
    }
  });

  app.post("/api/procedures", async (req, res) => {
    try {
      const procedure = await storage.createProcedure(req.body);
      res.status(201).json(procedure);
    } catch (error) {
      res.status(400).json({ message: "Error creating procedure", error });
    }
  });

  app.put("/api/procedures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const procedure = await storage.updateProcedure(id, req.body);
      if (!procedure) {
        return res.status(404).json({ message: "Procedure not found" });
      }
      res.json(procedure);
    } catch (error) {
      res.status(400).json({ message: "Error updating procedure", error });
    }
  });

  app.delete("/api/procedures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProcedure(id);
      if (!deleted) {
        return res.status(404).json({ message: "Procedure not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting procedure" });
    }
  });

  // ====== TRANSFORMADORES EN ÓRDENES DE TRABAJO ======
  app.get("/api/work-orders/:id/transformers", async (req, res) => {
    try {
      const workOrderId = parseInt(req.params.id);
      const transformers = await storage.getWorkOrderTransformers(workOrderId);
      res.json(transformers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching work order transformers" });
    }
  });

  app.post("/api/work-orders/:id/transformers", async (req, res) => {
    try {
      const workOrderId = parseInt(req.params.id);
      const { transformerId } = req.body;
      
      const workOrderTransformer = await storage.addTransformerToWorkOrder({
        workOrderId,
        transformerId
      });
      
      res.status(201).json(workOrderTransformer);
    } catch (error) {
      res.status(400).json({ message: "Error adding transformer to work order", error });
    }
  });

  // ====== PROCEDIMIENTOS DE TRANSFORMADOR ======
  app.get("/api/transformers/:id/procedures", async (req, res) => {
    try {
      const transformerId = parseInt(req.params.id);
      const workOrderId = req.query.workOrderId ? parseInt(req.query.workOrderId as string) : undefined;
      
      const procedures = await storage.getTransformerProcedures(transformerId, workOrderId);
      res.json(procedures);
    } catch (error) {
      res.status(500).json({ message: "Error fetching transformer procedures" });
    }
  });

  app.post("/api/transformer-procedures", async (req, res) => {
    try {
      const procedure = await storage.createTransformerProcedure(req.body);
      res.status(201).json(procedure);
    } catch (error) {
      res.status(400).json({ message: "Error creating transformer procedure", error });
    }
  });

  app.put("/api/transformer-procedures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const procedure = await storage.updateTransformerProcedure(id, req.body);
      if (!procedure) {
        return res.status(404).json({ message: "Transformer procedure not found" });
      }
      res.json(procedure);
    } catch (error) {
      res.status(400).json({ message: "Error updating transformer procedure", error });
    }
  });

  app.put("/api/transformer-procedures/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req.session as any)?.userId;
      const success = await storage.completeTransformerProcedure(id, userId);
      if (!success) {
        return res.status(404).json({ message: "Procedure not found" });
      }
      res.json({ message: "Procedure completed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error completing procedure" });
    }
  });

  // ====== FOTOS DE PROCEDIMIENTOS DE TRANSFORMADOR ======
  app.get("/api/transformer-procedures/:id/photos", async (req, res) => {
    try {
      const procedureId = parseInt(req.params.id);
      const photos = await storage.getTransformerProcedurePhotos(procedureId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching procedure photos" });
    }
  });

  app.post("/api/transformer-procedures/:id/photos", upload.array('photos', 10), async (req, res) => {
    try {
      const procedureId = parseInt(req.params.id);
      const files = req.files as Express.Multer.File[];
      const { photoType, description, personnelName } = req.body;
      const userId = (req.session as any)?.userId;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No photos uploaded" });
      }

      const uploadedPhotos = [];

      for (const file of files) {
        try {
          // Process photo with watermark for transformer procedure
          const { watermarkedPath, originalPath } = await processWorkOrderPhoto(
            file.path,
            `PROC-${procedureId}`,
            personnelName || 'Técnico',
            photoType || 'procedure'
          );

          const photoData = {
            transformerProcedureId: procedureId,
            photoType: photoType || 'procedure',
            filePath: watermarkedPath,
            fileName: file.originalname,
            description: description || null,
            takenBy: userId,
            hasWatermark: true
          };

          const savedPhoto = await storage.createTransformerProcedurePhoto(photoData);
          uploadedPhotos.push(savedPhoto);

        } catch (photoError) {
          console.error('Error processing procedure photo:', photoError);
        }
      }

      res.status(201).json({
        message: `${uploadedPhotos.length} photos uploaded successfully`,
        photos: uploadedPhotos
      });

    } catch (error) {
      console.error('Error uploading procedure photos:', error);
      res.status(500).json({ message: "Error uploading photos", error });
    }
  });

  app.delete("/api/transformer-procedure-photos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTransformerProcedurePhoto(id);
      if (!deleted) {
        return res.status(404).json({ message: "Photo not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting photo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
