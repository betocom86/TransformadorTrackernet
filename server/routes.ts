import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { 
  insertPersonnelSchema, insertDocumentSchema, insertProjectSchema, 
  insertProjectAssignmentSchema, insertSafetyEquipmentSchema, 
  insertTrainingSchema, insertAlertSchema 
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
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
      };
      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: "Invalid document data", error });
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

  const httpServer = createServer(app);
  return httpServer;
}
