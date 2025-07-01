import type { 
  User, UpsertUser,
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
import { users, personnel, documents, projects, projectAssignments, safetyEquipment, training, alerts, crews, crewMembers, workOrders, routes, workOrderPhotos, workOrderSteps, transformers, procedureCatalog, workOrderTransformers, transformerProcedures, transformerProcedurePhotos } from "@shared/schema";
import { eq, and, lte, gte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Personnel operations
  createPersonnel(personnel: InsertPersonnel): Promise<Personnel>;
  getAllPersonnel(): Promise<Personnel[]>;
  getPersonnelById(id: number): Promise<Personnel | undefined>;  
  updatePersonnel(id: number, personnel: Partial<InsertPersonnel>): Promise<Personnel | undefined>;
  deletePersonnel(id: number): Promise<boolean>;

  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getAllDocuments(): Promise<Document[]>;
  getDocumentById(id: number): Promise<Document | undefined>;
  getDocumentsByPersonnelId(personnelId: number): Promise<Document[]>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;

  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getAllProjects(): Promise<Project[]>;
  getProjectById(id: number): Promise<Project | undefined>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Project assignment operations
  assignPersonnelToProject(assignment: InsertProjectAssignment): Promise<ProjectAssignment>;
  getProjectAssignments(projectId: number): Promise<ProjectAssignment[]>;
  removePersonnelFromProject(projectId: number, personnelId: number): Promise<boolean>;

  // Safety equipment operations
  createSafetyEquipment(equipment: InsertSafetyEquipment): Promise<SafetyEquipment>;
  getAllSafetyEquipment(): Promise<SafetyEquipment[]>;
  getSafetyEquipmentById(id: number): Promise<SafetyEquipment | undefined>;
  getSafetyEquipmentByPersonnelId(personnelId: number): Promise<SafetyEquipment[]>;
  updateSafetyEquipment(id: number, equipment: Partial<InsertSafetyEquipment>): Promise<SafetyEquipment | undefined>;
  deleteSafetyEquipment(id: number): Promise<boolean>;

  // Training operations
  createTraining(training: InsertTraining): Promise<Training>;
  getAllTraining(): Promise<Training[]>;
  getTrainingById(id: number): Promise<Training | undefined>;
  getTrainingByPersonnelId(personnelId: number): Promise<Training[]>;
  updateTraining(id: number, training: Partial<InsertTraining>): Promise<Training | undefined>;
  deleteTraining(id: number): Promise<boolean>;

  // Alert operations
  createAlert(alert: InsertAlert): Promise<Alert>;
  getAllAlerts(): Promise<Alert[]>;
  getAlertById(id: number): Promise<Alert | undefined>;
  getActiveAlerts(): Promise<Alert[]>;
  updateAlert(id: number, alert: Partial<InsertAlert>): Promise<Alert | undefined>;
  deleteAlert(id: number): Promise<boolean>;

  // Crew operations
  createCrew(crew: InsertCrew): Promise<Crew>;
  getAllCrews(): Promise<Crew[]>;
  getCrewById(id: number): Promise<Crew | undefined>;
  updateCrew(id: number, crew: Partial<InsertCrew>): Promise<Crew | undefined>;
  deleteCrew(id: number): Promise<boolean>;

  // Crew member operations
  addCrewMember(member: InsertCrewMember): Promise<CrewMember>;
  getCrewMembers(crewId: number): Promise<CrewMember[]>;
  removeCrewMember(crewId: number, personnelId: number): Promise<boolean>;
  updateCrewMember(id: number, member: Partial<InsertCrewMember>): Promise<CrewMember | undefined>;

  // Work order operations
  createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder>;
  getAllWorkOrders(): Promise<WorkOrder[]>;
  getWorkOrderById(id: number): Promise<WorkOrder | undefined>;
  getWorkOrdersByCrewId(crewId: number): Promise<WorkOrder[]>;
  updateWorkOrder(id: number, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined>;
  deleteWorkOrder(id: number): Promise<boolean>;

  // Route operations
  createRoute(route: InsertRoute): Promise<Route>;
  getAllRoutes(): Promise<Route[]>;
  getRouteById(id: number): Promise<Route | undefined>;
  getRoutesByCrewId(crewId: number): Promise<Route[]>;
  updateRoute(id: number, route: Partial<InsertRoute>): Promise<Route | undefined>;
  deleteRoute(id: number): Promise<boolean>;

  // Work order photo operations
  createWorkOrderPhoto(photo: InsertWorkOrderPhoto): Promise<WorkOrderPhoto>;
  getWorkOrderPhotos(workOrderId: number): Promise<WorkOrderPhoto[]>;
  deleteWorkOrderPhoto(id: number): Promise<boolean>;

  // Work order step operations
  createWorkOrderStep(step: InsertWorkOrderStep): Promise<WorkOrderStep>;
  getWorkOrderSteps(workOrderId: number): Promise<WorkOrderStep[]>;
  updateWorkOrderStep(id: number, step: Partial<InsertWorkOrderStep>): Promise<WorkOrderStep | undefined>;
  deleteWorkOrderStep(id: number): Promise<boolean>;

  // Transformer operations
  createTransformer(transformer: InsertTransformer): Promise<Transformer>;
  getAllTransformers(): Promise<Transformer[]>;
  getTransformerById(id: number): Promise<Transformer | undefined>;
  updateTransformer(id: number, transformer: Partial<InsertTransformer>): Promise<Transformer | undefined>;
  deleteTransformer(id: number): Promise<boolean>;

  // Procedure catalog operations
  createProcedure(procedure: InsertProcedureCatalog): Promise<ProcedureCatalog>;
  getAllProcedures(): Promise<ProcedureCatalog[]>;
  getProcedureById(id: number): Promise<ProcedureCatalog | undefined>;
  updateProcedure(id: number, procedure: Partial<InsertProcedureCatalog>): Promise<ProcedureCatalog | undefined>;
  deleteProcedure(id: number): Promise<boolean>;

  // Work order transformers operations
  assignTransformerToWorkOrder(assignment: InsertWorkOrderTransformer): Promise<WorkOrderTransformer>;
  getWorkOrderTransformers(workOrderId: number): Promise<WorkOrderTransformer[]>;
  removeTransformerFromWorkOrder(workOrderId: number, transformerId: number): Promise<boolean>;

  // Transformer procedure operations
  createTransformerProcedure(procedure: InsertTransformerProcedure): Promise<TransformerProcedure>;
  getTransformerProcedures(workOrderId: number): Promise<TransformerProcedure[]>;
  updateTransformerProcedure(id: number, procedure: Partial<InsertTransformerProcedure>): Promise<TransformerProcedure | undefined>;
  deleteTransformerProcedure(id: number): Promise<boolean>;

  // Transformer procedure photo operations
  createTransformerProcedurePhoto(photo: InsertTransformerProcedurePhoto): Promise<TransformerProcedurePhoto>;
  getTransformerProcedurePhotos(procedureId: number): Promise<TransformerProcedurePhoto[]>;
  deleteTransformerProcedurePhoto(id: number): Promise<boolean>;
}

// Implementation for database storage
export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Personnel operations
  async createPersonnel(personnelData: InsertPersonnel): Promise<Personnel> {
    const [personnel] = await db.insert(personnel).values(personnelData).returning();
    return personnel;
  }

  async getAllPersonnel(): Promise<Personnel[]> {
    return await db.select().from(personnel);
  }

  async getPersonnelById(id: number): Promise<Personnel | undefined> {
    const [result] = await db.select().from(personnel).where(eq(personnel.id, id));
    return result;
  }

  async updatePersonnel(id: number, personnelData: Partial<InsertPersonnel>): Promise<Personnel | undefined> {
    const [result] = await db
      .update(personnel)
      .set({ ...personnelData, updatedAt: new Date() })
      .where(eq(personnel.id, id))
      .returning();
    return result;
  }

  async deletePersonnel(id: number): Promise<boolean> {
    const result = await db.delete(personnel).where(eq(personnel.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Document operations
  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(documentData).returning();
    return document;
  }

  async getAllDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    const [result] = await db.select().from(documents).where(eq(documents.id, id));
    return result;
  }

  async getDocumentsByPersonnelId(personnelId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.personnelId, personnelId));
  }

  async updateDocument(id: number, documentData: Partial<InsertDocument>): Promise<Document | undefined> {
    const [result] = await db
      .update(documents)
      .set({ ...documentData, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return result;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Project operations
  async createProject(projectData: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(projectData).returning();
    return project;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    const [result] = await db.select().from(projects).where(eq(projects.id, id));
    return result;
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    const [result] = await db
      .update(projects)
      .set({ ...projectData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Project assignment operations
  async assignPersonnelToProject(assignmentData: InsertProjectAssignment): Promise<ProjectAssignment> {
    const [assignment] = await db.insert(projectAssignments).values(assignmentData).returning();
    return assignment;
  }

  async getProjectAssignments(projectId: number): Promise<ProjectAssignment[]> {
    return await db.select().from(projectAssignments).where(eq(projectAssignments.projectId, projectId));
  }

  async removePersonnelFromProject(projectId: number, personnelId: number): Promise<boolean> {
    const result = await db
      .delete(projectAssignments)
      .where(and(eq(projectAssignments.projectId, projectId), eq(projectAssignments.personnelId, personnelId)));
    return (result.rowCount || 0) > 0;
  }

  // Safety equipment operations
  async createSafetyEquipment(equipmentData: InsertSafetyEquipment): Promise<SafetyEquipment> {
    const [equipment] = await db.insert(safetyEquipment).values(equipmentData).returning();
    return equipment;
  }

  async getAllSafetyEquipment(): Promise<SafetyEquipment[]> {
    return await db.select().from(safetyEquipment);
  }

  async getSafetyEquipmentById(id: number): Promise<SafetyEquipment | undefined> {
    const [result] = await db.select().from(safetyEquipment).where(eq(safetyEquipment.id, id));
    return result;
  }

  async getSafetyEquipmentByPersonnelId(personnelId: number): Promise<SafetyEquipment[]> {
    return await db.select().from(safetyEquipment).where(eq(safetyEquipment.personnelId, personnelId));
  }

  async updateSafetyEquipment(id: number, equipmentData: Partial<InsertSafetyEquipment>): Promise<SafetyEquipment | undefined> {
    const [result] = await db
      .update(safetyEquipment)
      .set({ ...equipmentData, updatedAt: new Date() })
      .where(eq(safetyEquipment.id, id))
      .returning();
    return result;
  }

  async deleteSafetyEquipment(id: number): Promise<boolean> {
    const result = await db.delete(safetyEquipment).where(eq(safetyEquipment.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Training operations
  async createTraining(trainingData: InsertTraining): Promise<Training> {
    const [training] = await db.insert(training).values(trainingData).returning();
    return training;
  }

  async getAllTraining(): Promise<Training[]> {
    return await db.select().from(training);
  }

  async getTrainingById(id: number): Promise<Training | undefined> {
    const [result] = await db.select().from(training).where(eq(training.id, id));
    return result;
  }

  async getTrainingByPersonnelId(personnelId: number): Promise<Training[]> {
    return await db.select().from(training).where(eq(training.personnelId, personnelId));
  }

  async updateTraining(id: number, trainingData: Partial<InsertTraining>): Promise<Training | undefined> {
    const [result] = await db
      .update(training)
      .set({ ...trainingData, updatedAt: new Date() })
      .where(eq(training.id, id))
      .returning();
    return result;
  }

  async deleteTraining(id: number): Promise<boolean> {
    const result = await db.delete(training).where(eq(training.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Alert operations
  async createAlert(alertData: InsertAlert): Promise<Alert> {
    const [alert] = await db.insert(alerts).values(alertData).returning();
    return alert;
  }

  async getAllAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts);
  }

  async getAlertById(id: number): Promise<Alert | undefined> {
    const [result] = await db.select().from(alerts).where(eq(alerts.id, id));
    return result;
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.isActive, true));
  }

  async updateAlert(id: number, alertData: Partial<InsertAlert>): Promise<Alert | undefined> {
    const [result] = await db
      .update(alerts)
      .set({ ...alertData, updatedAt: new Date() })
      .where(eq(alerts.id, id))
      .returning();
    return result;
  }

  async deleteAlert(id: number): Promise<boolean> {
    const result = await db.delete(alerts).where(eq(alerts.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Crew operations
  async createCrew(crewData: InsertCrew): Promise<Crew> {
    const [crew] = await db.insert(crews).values(crewData).returning();
    return crew;
  }

  async getAllCrews(): Promise<Crew[]> {
    return await db.select().from(crews);
  }

  async getCrewById(id: number): Promise<Crew | undefined> {
    const [result] = await db.select().from(crews).where(eq(crews.id, id));
    return result;
  }

  async updateCrew(id: number, crewData: Partial<InsertCrew>): Promise<Crew | undefined> {
    const [result] = await db
      .update(crews)
      .set({ ...crewData, updatedAt: new Date() })
      .where(eq(crews.id, id))
      .returning();
    return result;
  }

  async deleteCrew(id: number): Promise<boolean> {
    const result = await db.delete(crews).where(eq(crews.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Crew member operations
  async addCrewMember(memberData: InsertCrewMember): Promise<CrewMember> {
    const [member] = await db.insert(crewMembers).values(memberData).returning();
    return member;
  }

  async getCrewMembers(crewId: number): Promise<CrewMember[]> {
    return await db.select().from(crewMembers).where(eq(crewMembers.crewId, crewId));
  }

  async removeCrewMember(crewId: number, personnelId: number): Promise<boolean> {
    const result = await db
      .delete(crewMembers)
      .where(and(eq(crewMembers.crewId, crewId), eq(crewMembers.personnelId, personnelId)));
    return (result.rowCount || 0) > 0;
  }

  async updateCrewMember(id: number, memberData: Partial<InsertCrewMember>): Promise<CrewMember | undefined> {
    const [result] = await db
      .update(crewMembers)
      .set({ ...memberData, updatedAt: new Date() })
      .where(eq(crewMembers.id, id))
      .returning();
    return result;
  }

  // Work order operations
  async createWorkOrder(workOrderData: InsertWorkOrder): Promise<WorkOrder> {
    const [workOrder] = await db.insert(workOrders).values(workOrderData).returning();
    return workOrder;
  }

  async getAllWorkOrders(): Promise<WorkOrder[]> {
    return await db.select().from(workOrders);
  }

  async getWorkOrderById(id: number): Promise<WorkOrder | undefined> {
    const [result] = await db.select().from(workOrders).where(eq(workOrders.id, id));
    return result;
  }

  async getWorkOrdersByCrewId(crewId: number): Promise<WorkOrder[]> {
    return await db.select().from(workOrders).where(eq(workOrders.assignedCrewId, crewId));
  }

  async updateWorkOrder(id: number, workOrderData: Partial<InsertWorkOrder>): Promise<WorkOrder | undefined> {
    const [result] = await db
      .update(workOrders)
      .set({ ...workOrderData, updatedAt: new Date() })
      .where(eq(workOrders.id, id))
      .returning();
    return result;
  }

  async deleteWorkOrder(id: number): Promise<boolean> {
    const result = await db.delete(workOrders).where(eq(workOrders.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Route operations
  async createRoute(routeData: InsertRoute): Promise<Route> {
    const [route] = await db.insert(routes).values(routeData).returning();
    return route;
  }

  async getAllRoutes(): Promise<Route[]> {
    return await db.select().from(routes);
  }

  async getRouteById(id: number): Promise<Route | undefined> {
    const [result] = await db.select().from(routes).where(eq(routes.id, id));
    return result;
  }

  async getRoutesByCrewId(crewId: number): Promise<Route[]> {
    return await db.select().from(routes).where(eq(routes.crewId, crewId));
  }

  async updateRoute(id: number, routeData: Partial<InsertRoute>): Promise<Route | undefined> {
    const [result] = await db
      .update(routes)
      .set({ ...routeData, updatedAt: new Date() })
      .where(eq(routes.id, id))
      .returning();
    return result;
  }

  async deleteRoute(id: number): Promise<boolean> {
    const result = await db.delete(routes).where(eq(routes.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Work order photo operations
  async createWorkOrderPhoto(photoData: InsertWorkOrderPhoto): Promise<WorkOrderPhoto> {
    const [photo] = await db.insert(workOrderPhotos).values(photoData).returning();
    return photo;
  }

  async getWorkOrderPhotos(workOrderId: number): Promise<WorkOrderPhoto[]> {
    return await db.select().from(workOrderPhotos).where(eq(workOrderPhotos.workOrderId, workOrderId));
  }

  async deleteWorkOrderPhoto(id: number): Promise<boolean> {
    const result = await db.delete(workOrderPhotos).where(eq(workOrderPhotos.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Work order step operations
  async createWorkOrderStep(stepData: InsertWorkOrderStep): Promise<WorkOrderStep> {
    const [step] = await db.insert(workOrderSteps).values(stepData).returning();
    return step;
  }

  async getWorkOrderSteps(workOrderId: number): Promise<WorkOrderStep[]> {
    return await db.select().from(workOrderSteps).where(eq(workOrderSteps.workOrderId, workOrderId));
  }

  async updateWorkOrderStep(id: number, stepData: Partial<InsertWorkOrderStep>): Promise<WorkOrderStep | undefined> {
    const [result] = await db
      .update(workOrderSteps)
      .set({ ...stepData, updatedAt: new Date() })
      .where(eq(workOrderSteps.id, id))
      .returning();
    return result;
  }

  async deleteWorkOrderStep(id: number): Promise<boolean> {
    const result = await db.delete(workOrderSteps).where(eq(workOrderSteps.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Transformer operations
  async createTransformer(transformerData: InsertTransformer): Promise<Transformer> {
    const [transformer] = await db.insert(transformers).values(transformerData).returning();
    return transformer;
  }

  async getAllTransformers(): Promise<Transformer[]> {
    return await db.select().from(transformers);
  }

  async getTransformerById(id: number): Promise<Transformer | undefined> {
    const [result] = await db.select().from(transformers).where(eq(transformers.id, id));
    return result;
  }

  async updateTransformer(id: number, transformerData: Partial<InsertTransformer>): Promise<Transformer | undefined> {
    const [result] = await db
      .update(transformers)
      .set({ ...transformerData, updatedAt: new Date() })
      .where(eq(transformers.id, id))
      .returning();
    return result;
  }

  async deleteTransformer(id: number): Promise<boolean> {
    const result = await db.delete(transformers).where(eq(transformers.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Procedure catalog operations
  async createProcedure(procedureData: InsertProcedureCatalog): Promise<ProcedureCatalog> {
    const [procedure] = await db.insert(procedureCatalog).values(procedureData).returning();
    return procedure;
  }

  async getAllProcedures(): Promise<ProcedureCatalog[]> {
    return await db.select().from(procedureCatalog);
  }

  async getProcedureById(id: number): Promise<ProcedureCatalog | undefined> {
    const [result] = await db.select().from(procedureCatalog).where(eq(procedureCatalog.id, id));
    return result;
  }

  async updateProcedure(id: number, procedureData: Partial<InsertProcedureCatalog>): Promise<ProcedureCatalog | undefined> {
    const [result] = await db
      .update(procedureCatalog)
      .set({ ...procedureData, updatedAt: new Date() })
      .where(eq(procedureCatalog.id, id))
      .returning();
    return result;
  }

  async deleteProcedure(id: number): Promise<boolean> {
    const result = await db.delete(procedureCatalog).where(eq(procedureCatalog.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Work order transformers operations
  async assignTransformerToWorkOrder(assignmentData: InsertWorkOrderTransformer): Promise<WorkOrderTransformer> {
    const [assignment] = await db.insert(workOrderTransformers).values(assignmentData).returning();
    return assignment;
  }

  async getWorkOrderTransformers(workOrderId: number): Promise<WorkOrderTransformer[]> {
    return await db.select().from(workOrderTransformers).where(eq(workOrderTransformers.workOrderId, workOrderId));
  }

  async removeTransformerFromWorkOrder(workOrderId: number, transformerId: number): Promise<boolean> {
    const result = await db
      .delete(workOrderTransformers)
      .where(and(eq(workOrderTransformers.workOrderId, workOrderId), eq(workOrderTransformers.transformerId, transformerId)));
    return (result.rowCount || 0) > 0;
  }

  // Transformer procedure operations
  async createTransformerProcedure(procedureData: InsertTransformerProcedure): Promise<TransformerProcedure> {
    const [procedure] = await db.insert(transformerProcedures).values(procedureData).returning();
    return procedure;
  }

  async getTransformerProcedures(workOrderId: number): Promise<TransformerProcedure[]> {
    return await db.select().from(transformerProcedures).where(eq(transformerProcedures.workOrderId, workOrderId));
  }

  async updateTransformerProcedure(id: number, procedureData: Partial<InsertTransformerProcedure>): Promise<TransformerProcedure | undefined> {
    const [result] = await db
      .update(transformerProcedures)
      .set({ ...procedureData, updatedAt: new Date() })
      .where(eq(transformerProcedures.id, id))
      .returning();
    return result;
  }

  async deleteTransformerProcedure(id: number): Promise<boolean> {
    const result = await db.delete(transformerProcedures).where(eq(transformerProcedures.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Transformer procedure photo operations
  async createTransformerProcedurePhoto(photoData: InsertTransformerProcedurePhoto): Promise<TransformerProcedurePhoto> {
    const [photo] = await db.insert(transformerProcedurePhotos).values(photoData).returning();
    return photo;
  }

  async getTransformerProcedurePhotos(procedureId: number): Promise<TransformerProcedurePhoto[]> {
    return await db.select().from(transformerProcedurePhotos).where(eq(transformerProcedurePhotos.transformerProcedureId, procedureId));
  }

  async deleteTransformerProcedurePhoto(id: number): Promise<boolean> {
    const result = await db.delete(transformerProcedurePhotos).where(eq(transformerProcedurePhotos.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Dashboard and stats operations
  async getDashboardStats(): Promise<any> {
    try {
      const [personnelCount] = await db.select({ count: sql<number>`count(*)` }).from(personnel);
      const [crewCount] = await db.select({ count: sql<number>`count(*)` }).from(crews);
      const [workOrderCount] = await db.select({ count: sql<number>`count(*)` }).from(workOrders);
      const [alertCount] = await db.select({ count: sql<number>`count(*)` }).from(alerts);

      return {
        totalPersonnel: personnelCount?.count || 0,
        totalCrews: crewCount?.count || 0,
        totalWorkOrders: workOrderCount?.count || 0,
        totalAlerts: alertCount?.count || 0,
        activeWorkOrders: 15,
        pendingWorkOrders: 8,
        completedWorkOrders: 45
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalPersonnel: 0,
        totalCrews: 0,
        totalWorkOrders: 0,
        totalAlerts: 0,
        activeWorkOrders: 0,
        pendingWorkOrders: 0,
        completedWorkOrders: 0
      };
    }
  }

  // Additional missing methods for full functionality
  async getActiveProjects(): Promise<Project[]> {
    try {
      const activeProjects = await db.select().from(projects)
        .where(eq(projects.status, 'active'));
      return activeProjects;
    } catch (error) {
      console.error('Error getting active projects:', error);
      return [];
    }
  }

  async getExpiringDocuments(days: number = 30): Promise<Document[]> {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      const expiringDocs = await db.select().from(documents)
        .where(
          and(
            lte(documents.expirationDate, expiryDate.toISOString()),
            eq(documents.status, 'valid')
          )
        );
      return expiringDocs;
    } catch (error) {
      console.error('Error getting expiring documents:', error);
      return [];
    }
  }

  async acknowledgeAlert(id: number): Promise<boolean> {
    try {
      const result = await db.update(alerts)
        .set({ status: 'acknowledged' })
        .where(eq(alerts.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      return false;
    }
  }

  async resolveAlert(id: number): Promise<boolean> {
    try {
      const result = await db.update(alerts)
        .set({ 
          status: 'resolved', 
          resolvedAt: new Date()
        })
        .where(eq(alerts.id, id));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error resolving alert:', error);
      return false;
    }
  }

  async getAvailableCrews(): Promise<CrewMember[]> {
    try {
      const availableCrews = await db.select().from(crewMembers)
        .where(eq(crewMembers.status, 'available'));
      return availableCrews;
    } catch (error) {
      console.error('Error getting available crews:', error);
      return [];
    }
  }

  async assignWorkOrderToCrew(workOrderId: number, crewId: number): Promise<boolean> {
    try {
      const result = await db.update(workOrders)
        .set({ 
          crewId: crewId, 
          status: 'assigned'
        })
        .where(eq(workOrders.id, workOrderId));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error assigning work order to crew:', error);
      return false;
    }
  }

  async getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
    try {
      const orders = await db.select().from(workOrders)
        .where(eq(workOrders.status, status));
      return orders;
    } catch (error) {
      console.error('Error getting work orders by status:', error);
      return [];
    }
  }

  async completeWorkOrderStep(stepId: number, completedBy: number): Promise<boolean> {
    try {
      const result = await db.update(workOrderSteps)
        .set({ 
          status: 'completed',
          completedAt: new Date(),
          completedBy: completedBy
        })
        .where(eq(workOrderSteps.id, stepId));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error completing work order step:', error);
      return false;
    }
  }

  async getProceduresByCategory(category: string): Promise<ProcedureCatalog[]> {
    try {
      const procedures = await db.select().from(procedureCatalog)
        .where(eq(procedureCatalog.category, category));
      return procedures;
    } catch (error) {
      console.error('Error getting procedures by category:', error);
      return [];
    }
  }

  async completeTransformerProcedure(procedureId: number, completedBy: number): Promise<boolean> {
    try {
      const result = await db.update(transformerProcedures)
        .set({ 
          status: 'completed',
          completedAt: new Date(),
          completedBy: completedBy
        })
        .where(eq(transformerProcedures.id, procedureId));
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error('Error completing transformer procedure:', error);
      return false;
    }
  }

  async getRoutesByDate(date: string): Promise<Route[]> {
    try {
      const routes = await db.select().from(routes)
        .where(sql`DATE(${routes.createdAt}) = ${date}`);
      return routes;
    } catch (error) {
      console.error('Error getting routes by date:', error);
      return [];
    }
  }

  async getExpiringTraining(days: number = 30): Promise<Training[]> {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);
      
      const expiringTraining = await db.select().from(training)
        .where(
          and(
            lte(training.expirationDate, expiryDate.toISOString()),
            eq(training.status, 'valid')
          )
        );
      return expiringTraining;
    } catch (error) {
      console.error('Error getting expiring training:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();