import type { 
  User, InsertUser,
  UserSession, InsertUserSession,
  Personnel, InsertPersonnel,
  Document, InsertDocument,
  Project, InsertProject,
  ProjectAssignment, InsertProjectAssignment,
  SafetyEquipment, InsertSafetyEquipment,
  Training, InsertTraining,
  Alert, InsertAlert,
  Crew, InsertCrew,
  CrewMember, InsertCrewMember,
  WorkOrder, InsertWorkOrder,
  Route, InsertRoute,
  WorkOrderPhoto, InsertWorkOrderPhoto,
  WorkOrderStep, InsertWorkOrderStep,
  Transformer, InsertTransformer,
  ProcedureCatalog, InsertProcedureCatalog,
  WorkOrderTransformer, InsertWorkOrderTransformer,
  TransformerProcedure, InsertTransformerProcedure,
  TransformerProcedurePhoto, InsertTransformerProcedurePhoto
} from "@shared/schema";
import { db } from "./db";
import { users, userSessions, personnel, documents, projects, projectAssignments, safetyEquipment, training, alerts, crews, crewMembers, workOrders, routes, workOrderPhotos, workOrderSteps, transformers, procedureCatalog, workOrderTransformers, transformerProcedures, transformerProcedurePhotos } from "@shared/schema";
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

  // Crews
  getAllCrews(): Promise<Crew[]>;
  getCrew(id: number): Promise<Crew | undefined>;
  createCrew(crew: InsertCrew): Promise<Crew>;
  updateCrew(id: number, crew: Partial<InsertCrew>): Promise<Crew | undefined>;
  deleteCrew(id: number): Promise<boolean>;
  getAvailableCrews(): Promise<Crew[]>;

  // Crew Members
  getCrewMembers(crewId: number): Promise<CrewMember[]>;
  addCrewMember(crewMember: InsertCrewMember): Promise<CrewMember>;
  removeCrewMember(id: number): Promise<boolean>;
  updateCrewMember(id: number, crewMember: Partial<InsertCrewMember>): Promise<CrewMember | undefined>;

  // Work Orders
  getAllWorkOrders(): Promise<WorkOrder[]>;
  getWorkOrder(id: number): Promise<WorkOrder | undefined>;
  createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder>;
  updateWorkOrder(id: number, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined>;
  deleteWorkOrder(id: number): Promise<boolean>;
  getWorkOrdersByStatus(status: string): Promise<WorkOrder[]>;
  getWorkOrdersByCrew(crewId: number): Promise<WorkOrder[]>;
  assignWorkOrderToCrew(workOrderId: number, crewId: number): Promise<boolean>;

  // Routes
  getAllRoutes(): Promise<Route[]>;
  getRoute(id: number): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: number, route: Partial<InsertRoute>): Promise<Route | undefined>;
  deleteRoute(id: number): Promise<boolean>;
  getRoutesByCrew(crewId: number): Promise<Route[]>;
  getRoutesByDate(date: string): Promise<Route[]>;

  // Work Order Photos
  getWorkOrderPhotos(workOrderId: number): Promise<WorkOrderPhoto[]>;
  createWorkOrderPhoto(photo: InsertWorkOrderPhoto): Promise<WorkOrderPhoto>;
  deleteWorkOrderPhoto(id: number): Promise<boolean>;
  updateWorkOrderPhoto(id: number, photo: Partial<InsertWorkOrderPhoto>): Promise<WorkOrderPhoto | undefined>;

  // Work Order Steps
  getWorkOrderSteps(workOrderId: number): Promise<WorkOrderStep[]>;
  createWorkOrderStep(step: InsertWorkOrderStep): Promise<WorkOrderStep>;
  updateWorkOrderStep(id: number, step: Partial<InsertWorkOrderStep>): Promise<WorkOrderStep | undefined>;
  completeWorkOrderStep(id: number, completedBy: number): Promise<boolean>;

  // Transformers
  getAllTransformers(): Promise<Transformer[]>;
  getTransformer(id: number): Promise<Transformer | undefined>;
  createTransformer(transformer: InsertTransformer): Promise<Transformer>;
  updateTransformer(id: number, transformer: Partial<InsertTransformer>): Promise<Transformer | undefined>;
  deleteTransformer(id: number): Promise<boolean>;
  getTransformerBySerial(serialNumber: string): Promise<Transformer | undefined>;

  // Procedure Catalog
  getAllProcedures(): Promise<ProcedureCatalog[]>;
  getProcedure(id: number): Promise<ProcedureCatalog | undefined>;
  createProcedure(procedure: InsertProcedureCatalog): Promise<ProcedureCatalog>;
  updateProcedure(id: number, procedure: Partial<InsertProcedureCatalog>): Promise<ProcedureCatalog | undefined>;
  deleteProcedure(id: number): Promise<boolean>;
  getProceduresByCategory(category: string): Promise<ProcedureCatalog[]>;

  // Work Order Transformers
  getWorkOrderTransformers(workOrderId: number): Promise<WorkOrderTransformer[]>;
  addTransformerToWorkOrder(workOrderTransformer: InsertWorkOrderTransformer): Promise<WorkOrderTransformer>;
  removeTransformerFromWorkOrder(id: number): Promise<boolean>;

  // Transformer Procedures
  getTransformerProcedures(transformerId: number, workOrderId?: number): Promise<TransformerProcedure[]>;
  createTransformerProcedure(procedure: InsertTransformerProcedure): Promise<TransformerProcedure>;
  updateTransformerProcedure(id: number, procedure: Partial<InsertTransformerProcedure>): Promise<TransformerProcedure | undefined>;
  completeTransformerProcedure(id: number, performedBy: number): Promise<boolean>;

  // Transformer Procedure Photos
  getTransformerProcedurePhotos(procedureId: number): Promise<TransformerProcedurePhoto[]>;
  createTransformerProcedurePhoto(photo: InsertTransformerProcedurePhoto): Promise<TransformerProcedurePhoto>;
  deleteTransformerProcedurePhoto(id: number): Promise<boolean>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async updateUser(id: number, update: Partial<InsertUser>): Promise<User | undefined> {
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }
    const [user] = await db
      .update(users)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async validateUserCredentials(username: string, password: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user || !user.isActive) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    await this.updateLastLogin(user.id);
    return user;
  }

  async updateLastLogin(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, userId));
  }

  async createSession(session: any): Promise<any> {
    const [newSession] = await db
      .insert(userSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getSessionByToken(token: string): Promise<any> {
    const [session] = await db.select().from(userSessions).where(eq(userSessions.sessionToken, token));
    return session || undefined;
  }

  async deleteSession(token: string): Promise<boolean> {
    const result = await db.delete(userSessions).where(eq(userSessions.sessionToken, token));
    return result.rowCount > 0;
  }

  async deleteUserSessions(userId: number): Promise<boolean> {
    const result = await db.delete(userSessions).where(eq(userSessions.userId, userId));
    return result.rowCount > 0;
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

  // Crews implementation
  async getAllCrews(): Promise<Crew[]> {
    return await db.select().from(crews);
  }

  async getCrew(id: number): Promise<Crew | undefined> {
    const [crew] = await db.select().from(crews).where(eq(crews.id, id));
    return crew || undefined;
  }

  async createCrew(insertCrew: InsertCrew): Promise<Crew> {
    const [crew] = await db
      .insert(crews)
      .values(insertCrew)
      .returning();
    return crew;
  }

  async updateCrew(id: number, update: Partial<InsertCrew>): Promise<Crew | undefined> {
    const [crew] = await db
      .update(crews)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(crews.id, id))
      .returning();
    return crew || undefined;
  }

  async deleteCrew(id: number): Promise<boolean> {
    const result = await db.delete(crews).where(eq(crews.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAvailableCrews(): Promise<Crew[]> {
    return await db.select().from(crews).where(eq(crews.status, 'available'));
  }

  // Crew Members implementation
  async getCrewMembers(crewId: number): Promise<CrewMember[]> {
    return await db.select().from(crewMembers).where(eq(crewMembers.crewId, crewId));
  }

  async addCrewMember(insertCrewMember: InsertCrewMember): Promise<CrewMember> {
    const [crewMember] = await db
      .insert(crewMembers)
      .values(insertCrewMember)
      .returning();
    return crewMember;
  }

  async removeCrewMember(id: number): Promise<boolean> {
    const result = await db.delete(crewMembers).where(eq(crewMembers.id, id));
    return (result.rowCount || 0) > 0;
  }

  async updateCrewMember(id: number, update: Partial<InsertCrewMember>): Promise<CrewMember | undefined> {
    const [crewMember] = await db
      .update(crewMembers)
      .set(update)
      .where(eq(crewMembers.id, id))
      .returning();
    return crewMember || undefined;
  }

  // Work Orders implementation
  async getAllWorkOrders(): Promise<WorkOrder[]> {
    return await db.select().from(workOrders);
  }

  async getWorkOrder(id: number): Promise<WorkOrder | undefined> {
    const [workOrder] = await db.select().from(workOrders).where(eq(workOrders.id, id));
    return workOrder || undefined;
  }

  async createWorkOrder(insertWorkOrder: InsertWorkOrder): Promise<WorkOrder> {
    const [workOrder] = await db
      .insert(workOrders)
      .values(insertWorkOrder)
      .returning();
    return workOrder;
  }

  async updateWorkOrder(id: number, update: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined> {
    const [workOrder] = await db
      .update(workOrders)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(workOrders.id, id))
      .returning();
    return workOrder || undefined;
  }

  async deleteWorkOrder(id: number): Promise<boolean> {
    const result = await db.delete(workOrders).where(eq(workOrders.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
    return await db.select().from(workOrders).where(eq(workOrders.status, status));
  }

  async getWorkOrdersByCrew(crewId: number): Promise<WorkOrder[]> {
    return await db.select().from(workOrders).where(eq(workOrders.assignedCrewId, crewId));
  }

  async assignWorkOrderToCrew(workOrderId: number, crewId: number): Promise<boolean> {
    const result = await db
      .update(workOrders)
      .set({ 
        assignedCrewId: crewId,
        assignedDate: new Date().toISOString().split('T')[0],
        status: 'assigned',
        updatedAt: new Date()
      })
      .where(eq(workOrders.id, workOrderId));
    return (result.rowCount || 0) > 0;
  }

  // Routes implementation
  async getAllRoutes(): Promise<Route[]> {
    return await db.select().from(routes);
  }

  async getRoute(id: number): Promise<Route | undefined> {
    const [route] = await db.select().from(routes).where(eq(routes.id, id));
    return route || undefined;
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const [route] = await db
      .insert(routes)
      .values(insertRoute)
      .returning();
    return route;
  }

  async updateRoute(id: number, update: Partial<InsertRoute>): Promise<Route | undefined> {
    const [route] = await db
      .update(routes)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(routes.id, id))
      .returning();
    return route || undefined;
  }

  async deleteRoute(id: number): Promise<boolean> {
    const result = await db.delete(routes).where(eq(routes.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getRoutesByCrew(crewId: number): Promise<Route[]> {
    return await db.select().from(routes).where(eq(routes.crewId, crewId));
  }

  async getRoutesByDate(date: string): Promise<Route[]> {
    return await db.select().from(routes).where(eq(routes.routeDate, date));
  }

  // Work Order Photos implementation
  async getWorkOrderPhotos(workOrderId: number): Promise<WorkOrderPhoto[]> {
    return await db.select().from(workOrderPhotos).where(eq(workOrderPhotos.workOrderId, workOrderId));
  }

  async createWorkOrderPhoto(insertPhoto: InsertWorkOrderPhoto): Promise<WorkOrderPhoto> {
    const [photo] = await db
      .insert(workOrderPhotos)
      .values(insertPhoto)
      .returning();
    return photo;
  }

  async deleteWorkOrderPhoto(id: number): Promise<boolean> {
    const result = await db.delete(workOrderPhotos).where(eq(workOrderPhotos.id, id));
    return (result.rowCount || 0) > 0;
  }

  async updateWorkOrderPhoto(id: number, update: Partial<InsertWorkOrderPhoto>): Promise<WorkOrderPhoto | undefined> {
    const [photo] = await db
      .update(workOrderPhotos)
      .set(update)
      .where(eq(workOrderPhotos.id, id))
      .returning();
    return photo || undefined;
  }

  // Work Order Steps implementation
  async getWorkOrderSteps(workOrderId: number): Promise<WorkOrderStep[]> {
    return await db.select().from(workOrderSteps).where(eq(workOrderSteps.workOrderId, workOrderId));
  }

  async createWorkOrderStep(insertStep: InsertWorkOrderStep): Promise<WorkOrderStep> {
    const [step] = await db
      .insert(workOrderSteps)
      .values(insertStep)
      .returning();
    return step;
  }

  async updateWorkOrderStep(id: number, update: Partial<InsertWorkOrderStep>): Promise<WorkOrderStep | undefined> {
    const [step] = await db
      .update(workOrderSteps)
      .set(update)
      .where(eq(workOrderSteps.id, id))
      .returning();
    return step || undefined;
  }

  async completeWorkOrderStep(id: number, completedBy: number): Promise<boolean> {
    const result = await db
      .update(workOrderSteps)
      .set({
        status: 'completed',
        completedAt: new Date(),
        completedBy
      })
      .where(eq(workOrderSteps.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Transformers implementation
  async getAllTransformers(): Promise<Transformer[]> {
    return await db.select().from(transformers).orderBy(transformers.serialNumber);
  }

  async getTransformer(id: number): Promise<Transformer | undefined> {
    const [transformer] = await db.select().from(transformers).where(eq(transformers.id, id));
    return transformer || undefined;
  }

  async createTransformer(insertTransformer: InsertTransformer): Promise<Transformer> {
    const [transformer] = await db
      .insert(transformers)
      .values(insertTransformer)
      .returning();
    return transformer;
  }

  async updateTransformer(id: number, update: Partial<InsertTransformer>): Promise<Transformer | undefined> {
    const [transformer] = await db
      .update(transformers)
      .set(update)
      .where(eq(transformers.id, id))
      .returning();
    return transformer || undefined;
  }

  async deleteTransformer(id: number): Promise<boolean> {
    const result = await db.delete(transformers).where(eq(transformers.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getTransformerBySerial(serialNumber: string): Promise<Transformer | undefined> {
    const [transformer] = await db.select().from(transformers).where(eq(transformers.serialNumber, serialNumber));
    return transformer || undefined;
  }

  // Procedure Catalog implementation
  async getAllProcedures(): Promise<ProcedureCatalog[]> {
    return await db.select().from(procedureCatalog).where(eq(procedureCatalog.isActive, true)).orderBy(procedureCatalog.code);
  }

  async getProcedure(id: number): Promise<ProcedureCatalog | undefined> {
    const [procedure] = await db.select().from(procedureCatalog).where(eq(procedureCatalog.id, id));
    return procedure || undefined;
  }

  async createProcedure(insertProcedure: InsertProcedureCatalog): Promise<ProcedureCatalog> {
    const [procedure] = await db
      .insert(procedureCatalog)
      .values(insertProcedure)
      .returning();
    return procedure;
  }

  async updateProcedure(id: number, update: Partial<InsertProcedureCatalog>): Promise<ProcedureCatalog | undefined> {
    const [procedure] = await db
      .update(procedureCatalog)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(procedureCatalog.id, id))
      .returning();
    return procedure || undefined;
  }

  async deleteProcedure(id: number): Promise<boolean> {
    const result = await db
      .update(procedureCatalog)
      .set({ isActive: false })
      .where(eq(procedureCatalog.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getProceduresByCategory(category: string): Promise<ProcedureCatalog[]> {
    return await db
      .select()
      .from(procedureCatalog)
      .where(and(eq(procedureCatalog.category, category), eq(procedureCatalog.isActive, true)))
      .orderBy(procedureCatalog.code);
  }

  // Work Order Transformers implementation
  async getWorkOrderTransformers(workOrderId: number): Promise<WorkOrderTransformer[]> {
    return await db.select().from(workOrderTransformers).where(eq(workOrderTransformers.workOrderId, workOrderId));
  }

  async addTransformerToWorkOrder(insertWorkOrderTransformer: InsertWorkOrderTransformer): Promise<WorkOrderTransformer> {
    const [workOrderTransformer] = await db
      .insert(workOrderTransformers)
      .values(insertWorkOrderTransformer)
      .returning();
    return workOrderTransformer;
  }

  async removeTransformerFromWorkOrder(id: number): Promise<boolean> {
    const result = await db.delete(workOrderTransformers).where(eq(workOrderTransformers.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Transformer Procedures implementation
  async getTransformerProcedures(transformerId: number, workOrderId?: number): Promise<TransformerProcedure[]> {
    let query = db.select().from(transformerProcedures).where(eq(transformerProcedures.transformerId, transformerId));
    
    if (workOrderId) {
      query = query.where(eq(transformerProcedures.workOrderId, workOrderId));
    }
    
    return await query.orderBy(transformerProcedures.createdAt);
  }

  async createTransformerProcedure(insertProcedure: InsertTransformerProcedure): Promise<TransformerProcedure> {
    const [procedure] = await db
      .insert(transformerProcedures)
      .values(insertProcedure)
      .returning();
    return procedure;
  }

  async updateTransformerProcedure(id: number, update: Partial<InsertTransformerProcedure>): Promise<TransformerProcedure | undefined> {
    const [procedure] = await db
      .update(transformerProcedures)
      .set(update)
      .where(eq(transformerProcedures.id, id))
      .returning();
    return procedure || undefined;
  }

  async completeTransformerProcedure(id: number, performedBy: number): Promise<boolean> {
    const result = await db
      .update(transformerProcedures)
      .set({
        status: 'completed',
        completedAt: new Date(),
        performedBy
      })
      .where(eq(transformerProcedures.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Transformer Procedure Photos implementation
  async getTransformerProcedurePhotos(procedureId: number): Promise<TransformerProcedurePhoto[]> {
    return await db.select().from(transformerProcedurePhotos).where(eq(transformerProcedurePhotos.transformerProcedureId, procedureId));
  }

  async createTransformerProcedurePhoto(insertPhoto: InsertTransformerProcedurePhoto): Promise<TransformerProcedurePhoto> {
    const [photo] = await db
      .insert(transformerProcedurePhotos)
      .values(insertPhoto)
      .returning();
    return photo;
  }

  async deleteTransformerProcedurePhoto(id: number): Promise<boolean> {
    const result = await db.delete(transformerProcedurePhotos).where(eq(transformerProcedurePhotos.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();