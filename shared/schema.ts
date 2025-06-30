import { pgTable, text, serial, integer, boolean, timestamp, json, numeric, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("crew"), // admin, manager, crew, viewer
  fullName: text("full_name").notNull(),
  email: text("email"),
  phoneNumber: text("phone_number"),
  department: text("department"),
  position: text("position"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User sessions for authentication management
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Personnel table - main employee records
export const personnel = pgTable("personnel", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  position: text("position").notNull(),
  department: text("department").notNull(),
  phoneNumber: text("phone_number"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  address: text("address"),
  dateOfBirth: text("date_of_birth"),
  hireDate: text("hire_date"),
  status: text("status").notNull().default("active"), // active, inactive, suspended
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents table - passport, visa, certifications, etc.
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  personnelId: integer("personnel_id").notNull(),
  documentType: text("document_type").notNull(), // passport, visa, certification, medical, insurance, safety
  documentNumber: text("document_number"),
  issueDate: text("issue_date"),
  expirationDate: text("expiration_date"),
  issuingAuthority: text("issuing_authority"),
  status: text("status").notNull().default("valid"), // valid, expired, expiring_soon, pending
  filePath: text("file_path"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  projectName: text("project_name").notNull(),
  projectCode: text("project_code").notNull().unique(),
  clientName: text("client_name").notNull(),
  location: text("location").notNull(),
  state: text("state").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  estimatedDuration: integer("estimated_duration"), // days
  status: text("status").notNull().default("planning"), // planning, active, completed, cancelled, on_hold
  description: text("description"),
  requiredPersonnel: integer("required_personnel").default(0),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  budget: integer("budget"), // in cents
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project assignments
export const projectAssignments = pgTable("project_assignments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  personnelId: integer("personnel_id").notNull(),
  role: text("role").notNull(), // lead, technician, specialist, supervisor
  assignedDate: text("assigned_date"),
  status: text("status").notNull().default("assigned"), // assigned, confirmed, traveling, on_site, completed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Safety equipment tracking
export const safetyEquipment = pgTable("safety_equipment", {
  id: serial("id").primaryKey(),
  personnelId: integer("personnel_id").notNull(),
  equipmentType: text("equipment_type").notNull(), // helmet, boots, harness, gloves, etc.
  brand: text("brand"),
  model: text("model"),
  serialNumber: text("serial_number"),
  purchaseDate: text("purchase_date"),
  expirationDate: text("expiration_date"),
  condition: text("condition").notNull().default("good"), // good, fair, poor, needs_replacement
  lastInspection: text("last_inspection"),
  nextInspection: text("next_inspection"),
  status: text("status").notNull().default("active"), // active, retired, lost, damaged
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Training and certifications
export const training = pgTable("training", {
  id: serial("id").primaryKey(),
  personnelId: integer("personnel_id").notNull(),
  trainingName: text("training_name").notNull(),
  trainingType: text("training_type").notNull(), // safety, technical, compliance, medical
  provider: text("provider"),
  completionDate: text("completion_date"),
  expirationDate: text("expiration_date"),
  certificateNumber: text("certificate_number"),
  status: text("status").notNull().default("active"), // active, expired, pending_renewal
  filePath: text("file_path"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Alerts for expiring documents/certifications
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  personnelId: integer("personnel_id"),
  alertType: text("alert_type").notNull(), // document_expiring, certification_expiring, equipment_inspection, medical_due
  message: text("message").notNull(),
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  relatedId: integer("related_id"), // ID of related document, certification, etc.
  relatedType: text("related_type"), // document, training, equipment
  dueDate: text("due_date"),
  status: text("status").notNull().default("active"), // active, acknowledged, resolved
  createdAt: timestamp("created_at").defaultNow(),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
});

// Cuadrillas (Work Crews)
export const crews = pgTable("crews", {
  id: serial("id").primaryKey(),
  crewName: text("crew_name").notNull(),
  crewCode: text("crew_code").notNull().unique(),
  leaderId: integer("leader_id"), // Personnel ID of crew leader
  specialization: text("specialization").notNull(), // transformer_maintenance, electrical_repair, emergency_response
  maxCapacity: integer("max_capacity").notNull().default(6),
  currentSize: integer("current_size").notNull().default(0),
  status: text("status").notNull().default("available"), // available, assigned, maintenance, inactive
  baseLocation: text("base_location").notNull(),
  contactPhone: text("contact_phone"),
  equipment: text("equipment").array(), // Array of equipment IDs or names
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Crew Members Assignment
export const crewMembers = pgTable("crew_members", {
  id: serial("id").primaryKey(),
  crewId: integer("crew_id").notNull(),
  personnelId: integer("personnel_id").notNull(),
  role: text("role").notNull(), // leader, technician, apprentice, driver, safety_officer
  assignedDate: text("assigned_date").notNull(),
  status: text("status").notNull().default("active"), // active, temporary, inactive
  createdAt: timestamp("created_at").defaultNow(),
});

// Work Orders / Repair Orders
export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  workType: text("work_type").notNull(), // preventive_maintenance, emergency_repair, inspection, installation
  priority: text("priority").notNull().default("medium"), // low, medium, high, emergency
  status: text("status").notNull().default("pending"), // pending, assigned, in_progress, completed, cancelled
  
  // Location details
  facilityName: text("facility_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  
  // Assignment details
  assignedCrewId: integer("assigned_crew_id"),
  assignedDate: text("assigned_date"),
  scheduledDate: text("scheduled_date"),
  estimatedDuration: integer("estimated_duration"), // hours
  
  // Completion details
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  actualDuration: integer("actual_duration"), // hours
  
  // Contact and client info
  clientContact: text("client_contact"),
  clientPhone: text("client_phone"),
  emergencyContact: text("emergency_contact"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Route Optimization and Planning
export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  routeName: text("route_name").notNull(),
  crewId: integer("crew_id").notNull(),
  routeDate: text("route_date").notNull(),
  status: text("status").notNull().default("planned"), // planned, active, completed, cancelled
  
  // Route optimization data
  totalDistance: numeric("total_distance"), // kilometers
  estimatedTravelTime: integer("estimated_travel_time"), // minutes
  actualTravelTime: integer("actual_travel_time"), // minutes
  fuelEstimate: numeric("fuel_estimate"), // liters
  
  // Route waypoints (JSON array of work order IDs in order)
  workOrderSequence: text("work_order_sequence").array(),
  optimizationScore: numeric("optimization_score"), // 0-100 efficiency score
  
  startLocation: text("start_location"), // Starting depot/base
  endLocation: text("end_location"), // Ending location
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Work Order Photos and Documentation
export const workOrderPhotos = pgTable("work_order_photos", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").notNull(),
  photoType: text("photo_type").notNull(), // before, during, after, issue, equipment, safety
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  
  // Photo metadata
  description: text("description"),
  takenAt: timestamp("taken_at").defaultNow(),
  gpsLatitude: numeric("gps_latitude"),
  gpsLongitude: numeric("gps_longitude"),
  takenBy: integer("taken_by"), // Personnel ID
  
  // Watermark info
  hasWatermark: boolean("has_watermark").default(false),
  watermarkText: text("watermark_text"),
  originalFilePath: text("original_file_path"), // Path to original before watermark
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Work Order Progress and Steps
export const workOrderSteps = pgTable("work_order_steps", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").notNull(),
  stepNumber: integer("step_number").notNull(),
  stepTitle: text("step_title").notNull(),
  stepDescription: text("step_description").notNull(),
  
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, skipped
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  completedBy: integer("completed_by"), // Personnel ID
  
  // Requirements and verification
  requiresPhoto: boolean("requires_photo").default(false),
  requiresSignature: boolean("requires_signature").default(false),
  requiresApproval: boolean("requires_approval").default(false),
  
  notes: text("notes"),
  verificationData: text("verification_data"), // JSON for measurements, readings, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPersonnelSchema = createInsertSchema(personnel).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectAssignmentSchema = createInsertSchema(projectAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertSafetyEquipmentSchema = createInsertSchema(safetyEquipment).omit({
  id: true,
  createdAt: true,
});

export const insertTrainingSchema = createInsertSchema(training).omit({
  id: true,
  createdAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
  acknowledgedAt: true,
  resolvedAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export const insertCrewSchema = createInsertSchema(crews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCrewMemberSchema = createInsertSchema(crewMembers).omit({
  id: true,
  createdAt: true,
});

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkOrderPhotoSchema = createInsertSchema(workOrderPhotos).omit({
  id: true,
  createdAt: true,
});

export const insertWorkOrderStepSchema = createInsertSchema(workOrderSteps).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

export type Personnel = typeof personnel.$inferSelect;
export type InsertPersonnel = z.infer<typeof insertPersonnelSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type ProjectAssignment = typeof projectAssignments.$inferSelect;
export type InsertProjectAssignment = z.infer<typeof insertProjectAssignmentSchema>;

export type SafetyEquipment = typeof safetyEquipment.$inferSelect;
export type InsertSafetyEquipment = z.infer<typeof insertSafetyEquipmentSchema>;

export type Training = typeof training.$inferSelect;
export type InsertTraining = z.infer<typeof insertTrainingSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type Crew = typeof crews.$inferSelect;
export type InsertCrew = z.infer<typeof insertCrewSchema>;

export type CrewMember = typeof crewMembers.$inferSelect;
export type InsertCrewMember = z.infer<typeof insertCrewMemberSchema>;

export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;

export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

export type WorkOrderPhoto = typeof workOrderPhotos.$inferSelect;
export type InsertWorkOrderPhoto = z.infer<typeof insertWorkOrderPhotoSchema>;

export type WorkOrderStep = typeof workOrderSteps.$inferSelect;
export type InsertWorkOrderStep = z.infer<typeof insertWorkOrderStepSchema>;

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  personnel: many(personnel),
  sessions: many(userSessions),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const personnelRelations = relations(personnel, ({ many }) => ({
  documents: many(documents),
  projectAssignments: many(projectAssignments),
  safetyEquipment: many(safetyEquipment),
  training: many(training),
  alerts: many(alerts),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  personnel: one(personnel, {
    fields: [documents.personnelId],
    references: [personnel.id],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  projectAssignments: many(projectAssignments),
}));

export const projectAssignmentsRelations = relations(projectAssignments, ({ one }) => ({
  project: one(projects, {
    fields: [projectAssignments.projectId],
    references: [projects.id],
  }),
  personnel: one(personnel, {
    fields: [projectAssignments.personnelId],
    references: [personnel.id],
  }),
}));

export const safetyEquipmentRelations = relations(safetyEquipment, ({ one }) => ({
  personnel: one(personnel, {
    fields: [safetyEquipment.personnelId],
    references: [personnel.id],
  }),
}));

export const trainingRelations = relations(training, ({ one }) => ({
  personnel: one(personnel, {
    fields: [training.personnelId],
    references: [personnel.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  personnel: one(personnel, {
    fields: [alerts.personnelId],
    references: [personnel.id],
  }),
}));
