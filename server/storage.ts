import {
  users, personnel, documents, projects, projectAssignments, 
  safetyEquipment, training, alerts,
  type User, type InsertUser,
  type Personnel, type InsertPersonnel,
  type Document, type InsertDocument,
  type Project, type InsertProject,
  type ProjectAssignment, type InsertProjectAssignment,
  type SafetyEquipment, type InsertSafetyEquipment,
  type Training, type InsertTraining,
  type Alert, type InsertAlert
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Personnel
  getAllPersonnel(): Promise<Personnel[]>;
  getPersonnel(id: number): Promise<Personnel | undefined>;
  createPersonnel(personnel: InsertPersonnel): Promise<Personnel>;
  updatePersonnel(id: number, personnel: Partial<InsertPersonnel>): Promise<Personnel | undefined>;
  deletePersonnel(id: number): Promise<boolean>;

  // Documents
  getDocumentsByPersonnel(personnelId: number): Promise<Document[]>;
  getAllDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  getExpiringDocuments(days: number): Promise<Document[]>;

  // Projects
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  getActiveProjects(): Promise<Project[]>;

  // Project Assignments
  getAssignmentsByProject(projectId: number): Promise<ProjectAssignment[]>;
  getAssignmentsByPersonnel(personnelId: number): Promise<ProjectAssignment[]>;
  createAssignment(assignment: InsertProjectAssignment): Promise<ProjectAssignment>;
  updateAssignment(id: number, assignment: Partial<InsertProjectAssignment>): Promise<ProjectAssignment | undefined>;
  deleteAssignment(id: number): Promise<boolean>;

  // Safety Equipment
  getEquipmentByPersonnel(personnelId: number): Promise<SafetyEquipment[]>;
  createEquipment(equipment: InsertSafetyEquipment): Promise<SafetyEquipment>;
  updateEquipment(id: number, equipment: Partial<InsertSafetyEquipment>): Promise<SafetyEquipment | undefined>;

  // Training
  getTrainingByPersonnel(personnelId: number): Promise<Training[]>;
  createTraining(training: InsertTraining): Promise<Training>;
  updateTraining(id: number, training: Partial<InsertTraining>): Promise<Training | undefined>;
  getExpiringTraining(days: number): Promise<Training[]>;

  // Alerts
  getAllAlerts(): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, alert: Partial<InsertAlert>): Promise<Alert | undefined>;
  acknowledgeAlert(id: number): Promise<boolean>;
  resolveAlert(id: number): Promise<boolean>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    expiredDocs: number;
    expiringSoon: number;
    availableStaff: number;
    activeProjects: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private personnel: Map<number, Personnel>;
  private documents: Map<number, Document>;
  private projects: Map<number, Project>;
  private projectAssignments: Map<number, ProjectAssignment>;
  private safetyEquipment: Map<number, SafetyEquipment>;
  private training: Map<number, Training>;
  private alerts: Map<number, Alert>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.personnel = new Map();
    this.documents = new Map();
    this.projects = new Map();
    this.projectAssignments = new Map();
    this.safetyEquipment = new Map();
    this.training = new Map();
    this.alerts = new Map();
    this.currentId = 1;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Personnel
  async getAllPersonnel(): Promise<Personnel[]> {
    return Array.from(this.personnel.values());
  }

  async getPersonnel(id: number): Promise<Personnel | undefined> {
    return this.personnel.get(id);
  }

  async createPersonnel(insertPersonnel: InsertPersonnel): Promise<Personnel> {
    const id = this.currentId++;
    const person: Personnel = {
      ...insertPersonnel,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.personnel.set(id, person);
    return person;
  }

  async updatePersonnel(id: number, update: Partial<InsertPersonnel>): Promise<Personnel | undefined> {
    const existing = this.personnel.get(id);
    if (!existing) return undefined;

    const updated: Personnel = {
      ...existing,
      ...update,
      updatedAt: new Date(),
    };
    this.personnel.set(id, updated);
    return updated;
  }

  async deletePersonnel(id: number): Promise<boolean> {
    return this.personnel.delete(id);
  }

  // Documents
  async getDocumentsByPersonnel(personnelId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.personnelId === personnelId);
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentId++;
    const document: Document = {
      ...insertDocument,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, update: Partial<InsertDocument>): Promise<Document | undefined> {
    const existing = this.documents.get(id);
    if (!existing) return undefined;

    const updated: Document = {
      ...existing,
      ...update,
      updatedAt: new Date(),
    };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  async getExpiringDocuments(days: number): Promise<Document[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return Array.from(this.documents.values()).filter(doc => {
      if (!doc.expirationDate) return false;
      const expDate = new Date(doc.expirationDate);
      return expDate <= cutoffDate && expDate >= new Date();
    });
  }

  // Projects
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentId++;
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, update: Partial<InsertProject>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;

    const updated: Project = {
      ...existing,
      ...update,
      updatedAt: new Date(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getActiveProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => 
      p.status === 'active' || p.status === 'planning'
    );
  }

  // Project Assignments
  async getAssignmentsByProject(projectId: number): Promise<ProjectAssignment[]> {
    return Array.from(this.projectAssignments.values()).filter(a => a.projectId === projectId);
  }

  async getAssignmentsByPersonnel(personnelId: number): Promise<ProjectAssignment[]> {
    return Array.from(this.projectAssignments.values()).filter(a => a.personnelId === personnelId);
  }

  async createAssignment(insertAssignment: InsertProjectAssignment): Promise<ProjectAssignment> {
    const id = this.currentId++;
    const assignment: ProjectAssignment = {
      ...insertAssignment,
      id,
      createdAt: new Date(),
    };
    this.projectAssignments.set(id, assignment);
    return assignment;
  }

  async updateAssignment(id: number, update: Partial<InsertProjectAssignment>): Promise<ProjectAssignment | undefined> {
    const existing = this.projectAssignments.get(id);
    if (!existing) return undefined;

    const updated: ProjectAssignment = {
      ...existing,
      ...update,
    };
    this.projectAssignments.set(id, updated);
    return updated;
  }

  async deleteAssignment(id: number): Promise<boolean> {
    return this.projectAssignments.delete(id);
  }

  // Safety Equipment
  async getEquipmentByPersonnel(personnelId: number): Promise<SafetyEquipment[]> {
    return Array.from(this.safetyEquipment.values()).filter(e => e.personnelId === personnelId);
  }

  async createEquipment(insertEquipment: InsertSafetyEquipment): Promise<SafetyEquipment> {
    const id = this.currentId++;
    const equipment: SafetyEquipment = {
      ...insertEquipment,
      id,
      createdAt: new Date(),
    };
    this.safetyEquipment.set(id, equipment);
    return equipment;
  }

  async updateEquipment(id: number, update: Partial<InsertSafetyEquipment>): Promise<SafetyEquipment | undefined> {
    const existing = this.safetyEquipment.get(id);
    if (!existing) return undefined;

    const updated: SafetyEquipment = {
      ...existing,
      ...update,
    };
    this.safetyEquipment.set(id, updated);
    return updated;
  }

  // Training
  async getTrainingByPersonnel(personnelId: number): Promise<Training[]> {
    return Array.from(this.training.values()).filter(t => t.personnelId === personnelId);
  }

  async createTraining(insertTraining: InsertTraining): Promise<Training> {
    const id = this.currentId++;
    const train: Training = {
      ...insertTraining,
      id,
      createdAt: new Date(),
    };
    this.training.set(id, train);
    return train;
  }

  async updateTraining(id: number, update: Partial<InsertTraining>): Promise<Training | undefined> {
    const existing = this.training.get(id);
    if (!existing) return undefined;

    const updated: Training = {
      ...existing,
      ...update,
    };
    this.training.set(id, updated);
    return updated;
  }

  async getExpiringTraining(days: number): Promise<Training[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return Array.from(this.training.values()).filter(train => {
      if (!train.expirationDate) return false;
      const expDate = new Date(train.expirationDate);
      return expDate <= cutoffDate && expDate >= new Date();
    });
  }

  // Alerts
  async getAllAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values());
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(a => a.status === 'active');
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentId++;
    const alert: Alert = {
      ...insertAlert,
      id,
      createdAt: new Date(),
      acknowledgedAt: null,
      resolvedAt: null,
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: number, update: Partial<InsertAlert>): Promise<Alert | undefined> {
    const existing = this.alerts.get(id);
    if (!existing) return undefined;

    const updated: Alert = {
      ...existing,
      ...update,
    };
    this.alerts.set(id, updated);
    return updated;
  }

  async acknowledgeAlert(id: number): Promise<boolean> {
    const alert = this.alerts.get(id);
    if (!alert) return false;

    const updated: Alert = {
      ...alert,
      status: 'acknowledged',
      acknowledgedAt: new Date(),
    };
    this.alerts.set(id, updated);
    return true;
  }

  async resolveAlert(id: number): Promise<boolean> {
    const alert = this.alerts.get(id);
    if (!alert) return false;

    const updated: Alert = {
      ...alert,
      status: 'resolved',
      resolvedAt: new Date(),
    };
    this.alerts.set(id, updated);
    return true;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    expiredDocs: number;
    expiringSoon: number;
    availableStaff: number;
    activeProjects: number;
  }> {
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const allDocs = Array.from(this.documents.values());
    const expiredDocs = allDocs.filter(doc => 
      doc.expirationDate && new Date(doc.expirationDate) < now
    ).length;

    const expiringSoon = allDocs.filter(doc => 
      doc.expirationDate && 
      new Date(doc.expirationDate) > now && 
      new Date(doc.expirationDate) <= in30Days
    ).length;

    const activePersonnel = Array.from(this.personnel.values()).filter(p => p.status === 'active');
    const assignedPersonnel = new Set(
      Array.from(this.projectAssignments.values()).map(a => a.personnelId)
    );
    const availableStaff = activePersonnel.filter(p => !assignedPersonnel.has(p.id)).length;

    const activeProjects = Array.from(this.projects.values()).filter(p => 
      p.status === 'active' || p.status === 'planning'
    ).length;

    return {
      expiredDocs,
      expiringSoon,
      availableStaff,
      activeProjects,
    };
  }
}

export const storage = new MemStorage();
