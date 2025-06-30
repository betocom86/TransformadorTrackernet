import type { 
  User, InsertUser,
  UserSession, InsertUserSession,
  Personnel, InsertPersonnel,
  Document, InsertDocument,
  Project, InsertProject,
  ProjectAssignment, InsertProjectAssignment,
  SafetyEquipment, InsertSafetyEquipment,
  Training, InsertTraining,
  Alert, InsertAlert
} from "@shared/schema";
import { db } from "./db";
import { users, userSessions, personnel, documents, projects, projectAssignments, safetyEquipment, training, alerts } from "@shared/schema";
import { eq, and, lte, gte, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IStorage {
  // Users and Authentication
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  validateUserCredentials(username: string, password: string): Promise<User | null>;
  updateLastLogin(userId: number): Promise<void>;
  
  // User Sessions
  createSession(session: InsertUserSession): Promise<UserSession>;
  getSessionByToken(token: string): Promise<UserSession | undefined>;
  deleteSession(token: string): Promise<boolean>;
  deleteUserSessions(userId: number): Promise<boolean>;

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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllPersonnel(): Promise<Personnel[]> {
    return await db.select().from(personnel);
  }

  async getPersonnel(id: number): Promise<Personnel | undefined> {
    const [person] = await db.select().from(personnel).where(eq(personnel.id, id));
    return person || undefined;
  }

  async createPersonnel(insertPersonnel: InsertPersonnel): Promise<Personnel> {
    const [person] = await db
      .insert(personnel)
      .values(insertPersonnel)
      .returning();
    return person;
  }

  async updatePersonnel(id: number, update: Partial<InsertPersonnel>): Promise<Personnel | undefined> {
    const [person] = await db
      .update(personnel)
      .set(update)
      .where(eq(personnel.id, id))
      .returning();
    return person || undefined;
  }

  async deletePersonnel(id: number): Promise<boolean> {
    const result = await db.delete(personnel).where(eq(personnel.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getDocumentsByPersonnel(personnelId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.personnelId, personnelId));
  }

  async getAllDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc || undefined;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [doc] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return doc;
  }

  async updateDocument(id: number, update: Partial<InsertDocument>): Promise<Document | undefined> {
    const [doc] = await db
      .update(documents)
      .set(update)
      .where(eq(documents.id, id))
      .returning();
    return doc || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getExpiringDocuments(days: number): Promise<Document[]> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    
    return await db.select().from(documents).where(
      and(
        lte(documents.expirationDate, expirationDate.toISOString().split('T')[0]),
        gte(documents.expirationDate, new Date().toISOString().split('T')[0])
      )
    );
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: number, update: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(update)
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getActiveProjects(): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.status, 'active'));
  }

  async getAssignmentsByProject(projectId: number): Promise<ProjectAssignment[]> {
    return await db.select().from(projectAssignments).where(eq(projectAssignments.projectId, projectId));
  }

  async getAssignmentsByPersonnel(personnelId: number): Promise<ProjectAssignment[]> {
    return await db.select().from(projectAssignments).where(eq(projectAssignments.personnelId, personnelId));
  }

  async createAssignment(insertAssignment: InsertProjectAssignment): Promise<ProjectAssignment> {
    const [assignment] = await db
      .insert(projectAssignments)
      .values(insertAssignment)
      .returning();
    return assignment;
  }

  async updateAssignment(id: number, update: Partial<InsertProjectAssignment>): Promise<ProjectAssignment | undefined> {
    const [assignment] = await db
      .update(projectAssignments)
      .set(update)
      .where(eq(projectAssignments.id, id))
      .returning();
    return assignment || undefined;
  }

  async deleteAssignment(id: number): Promise<boolean> {
    const result = await db.delete(projectAssignments).where(eq(projectAssignments.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getEquipmentByPersonnel(personnelId: number): Promise<SafetyEquipment[]> {
    return await db.select().from(safetyEquipment).where(eq(safetyEquipment.personnelId, personnelId));
  }

  async createEquipment(insertEquipment: InsertSafetyEquipment): Promise<SafetyEquipment> {
    const [equipment] = await db
      .insert(safetyEquipment)
      .values(insertEquipment)
      .returning();
    return equipment;
  }

  async updateEquipment(id: number, update: Partial<InsertSafetyEquipment>): Promise<SafetyEquipment | undefined> {
    const [equipment] = await db
      .update(safetyEquipment)
      .set(update)
      .where(eq(safetyEquipment.id, id))
      .returning();
    return equipment || undefined;
  }

  async getTrainingByPersonnel(personnelId: number): Promise<Training[]> {
    return await db.select().from(training).where(eq(training.personnelId, personnelId));
  }

  async createTraining(insertTraining: InsertTraining): Promise<Training> {
    const [train] = await db
      .insert(training)
      .values(insertTraining)
      .returning();
    return train;
  }

  async updateTraining(id: number, update: Partial<InsertTraining>): Promise<Training | undefined> {
    const [train] = await db
      .update(training)
      .set(update)
      .where(eq(training.id, id))
      .returning();
    return train || undefined;
  }

  async getExpiringTraining(days: number): Promise<Training[]> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    
    return await db.select().from(training).where(
      and(
        lte(training.expirationDate, expirationDate.toISOString().split('T')[0]),
        gte(training.expirationDate, new Date().toISOString().split('T')[0])
      )
    );
  }

  async getAllAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts);
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.status, 'active'));
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db
      .insert(alerts)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async updateAlert(id: number, update: Partial<InsertAlert>): Promise<Alert | undefined> {
    const [alert] = await db
      .update(alerts)
      .set(update)
      .where(eq(alerts.id, id))
      .returning();
    return alert || undefined;
  }

  async acknowledgeAlert(id: number): Promise<boolean> {
    const [alert] = await db
      .update(alerts)
      .set({ acknowledgedAt: new Date() })
      .where(eq(alerts.id, id))
      .returning();
    return !!alert;
  }

  async resolveAlert(id: number): Promise<boolean> {
    const [alert] = await db
      .update(alerts)
      .set({ 
        status: 'resolved',
        resolvedAt: new Date() 
      })
      .where(eq(alerts.id, id))
      .returning();
    return !!alert;
  }

  async getDashboardStats(): Promise<{
    expiredDocs: number;
    expiringSoon: number;
    availableStaff: number;
    activeProjects: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysFromNowStr = thirtyDaysFromNow.toISOString().split('T')[0];

    // Count expired documents
    const expiredDocsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(lte(documents.expirationDate, today));
    const expiredDocs = Number(expiredDocsResult[0]?.count) || 0;

    // Count documents expiring soon (within 30 days)
    const expiringSoonResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(
        and(
          gte(documents.expirationDate, today),
          lte(documents.expirationDate, thirtyDaysFromNowStr)
        )
      );
    const expiringSoon = Number(expiringSoonResult[0]?.count) || 0;

    // Count available staff
    const availableStaffResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(personnel)
      .where(eq(personnel.status, 'active'));
    const availableStaff = Number(availableStaffResult[0]?.count) || 0;

    // Count active projects
    const activeProjectsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.status, 'active'));
    const activeProjects = Number(activeProjectsResult[0]?.count) || 0;

    return {
      expiredDocs,
      expiringSoon,
      availableStaff,
      activeProjects,
    };
  }
}

export const storage = new DatabaseStorage();