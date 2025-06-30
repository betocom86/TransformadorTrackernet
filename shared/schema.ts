import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
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
