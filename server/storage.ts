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
    
    // Initialize with sample data for demonstration
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample personnel for Mexican transformer maintenance company
    const samplePersonnel = [
      {
        employeeId: "PRSCU001",
        fullName: "Carlos Roberto Mendoza García",
        position: "Técnico Senior",
        department: "Mantenimiento",
        phoneNumber: "+52 555 123 4567",
        emergencyContact: "María Elena Mendoza (Esposa)",
        emergencyPhone: "+52 555 987 6543",
        address: "Av. Insurgentes Sur 1234, Col. Del Valle, CDMX 03100",
        dateOfBirth: "1985-03-15",
        hireDate: "2020-01-15",
        status: "active",
        notes: "Especialista en transformadores de alta tensión, certificación IEEE"
      },
      {
        employeeId: "PRSCU002", 
        fullName: "José Luis Hernández Ramírez",
        position: "Técnico Junior",
        department: "Mantenimiento",
        phoneNumber: "+52 555 234 5678",
        emergencyContact: "Ana Sofía Hernández (Madre)",
        emergencyPhone: "+52 555 876 5432",
        address: "Calle Morelos 567, Col. Centro, Guadalajara, JAL 44100",
        dateOfBirth: "1990-07-22",
        hireDate: "2022-06-01",
        status: "active",
        notes: "En entrenamiento para certificación de seguridad en EUA"
      },
      {
        employeeId: "PRSCU003",
        fullName: "Miguel Ángel Torres Vásquez",
        position: "Supervisor",
        department: "Operaciones",
        phoneNumber: "+52 555 345 6789",
        emergencyContact: "Carmen Torres (Esposa)",
        emergencyPhone: "+52 555 765 4321",
        address: "Blvd. Manuel Ávila Camacho 890, Col. Lomas, Monterrey, NL 64710",
        dateOfBirth: "1980-11-08",
        hireDate: "2018-03-10",
        status: "active",
        notes: "Líder de equipo con experiencia en proyectos internacionales"
      },
      {
        employeeId: "PRSCU004",
        fullName: "Roberto Carlos Jiménez López",
        position: "Ingeniero",
        department: "Ingeniería",
        phoneNumber: "+52 555 456 7890",
        emergencyContact: "Laura Jiménez (Hermana)",
        emergencyPhone: "+52 555 654 3210",
        address: "Av. Universidad 123, Col. Copilco, CDMX 04360",
        dateOfBirth: "1987-05-30",
        hireDate: "2019-09-20",
        status: "active",
        notes: "Ingeniero eléctrico especializado en sistemas de potencia"
      }
    ];

    samplePersonnel.forEach(person => {
      const id = this.currentId++;
      const personnel: Personnel = {
        id,
        ...person,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };
      this.personnel.set(id, personnel);
    });

    // Sample projects in Texas
    const sampleProjects = [
      {
        projectName: "Mantenimiento Subestación Houston North",
        projectCode: "PRSCU-TX-2024-001",
        clientName: "CenterPoint Energy",
        location: "Houston",
        state: "TX",
        startDate: "2024-02-01",
        endDate: "2024-02-15",
        estimatedDuration: 14,
        status: "active",
        description: "Mantenimiento preventivo de transformadores de potencia en subestación de 138kV",
        requiredPersonnel: 4,
        priority: "high",
        budget: 15000000, // $150,000 USD in cents
        notes: "Proyecto crítico para infraestructura eléctrica de Houston"
      },
      {
        projectName: "Instalación Transformador Dallas",
        projectCode: "PRSCU-TX-2024-002", 
        clientName: "Oncor Electric Delivery",
        location: "Dallas",
        state: "TX",
        startDate: "2024-03-01",
        endDate: "2024-03-10",
        estimatedDuration: 10,
        status: "planning",
        description: "Instalación de nuevo transformador de distribución 25MVA",
        requiredPersonnel: 3,
        priority: "medium",
        budget: 8500000, // $85,000 USD in cents
        notes: "Requiere coordinación con autoridades locales de Dallas"
      },
      {
        projectName: "Reparación Emergencia San Antonio",
        projectCode: "PRSCU-TX-2024-003",
        clientName: "CPS Energy",
        location: "San Antonio", 
        state: "TX",
        startDate: "2024-01-15",
        endDate: "2024-01-20",
        estimatedDuration: 5,
        status: "completed",
        description: "Reparación de emergencia en transformador dañado por tormenta",
        requiredPersonnel: 5,
        priority: "urgent",
        budget: 12000000, // $120,000 USD in cents
        notes: "Trabajo completado exitosamente bajo condiciones de emergencia"
      }
    ];

    sampleProjects.forEach(project => {
      const id = this.currentId++;
      const proj: Project = {
        id,
        ...project,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };
      this.projects.set(id, proj);
    });

    // Sample documents based on compliance requirements
    const sampleDocuments = [
      // Carlos Mendoza documents
      {
        personnelId: 1,
        documentType: "passport",
        documentNumber: "G12345678",
        issueDate: "2019-05-15",
        expirationDate: "2029-05-15",
        issuingAuthority: "Secretaría de Relaciones Exteriores México",
        status: "valid",
        notes: "Pasaporte vigente para viajes a EUA"
      },
      {
        personnelId: 1,
        documentType: "visa",
        documentNumber: "B1B2-2023-001",
        issueDate: "2023-01-10",
        expirationDate: "2025-01-10",
        issuingAuthority: "US Embassy Mexico City",
        status: "expiring_soon",
        notes: "Visa de trabajo temporal, renovar pronto"
      },
      {
        personnelId: 1,
        documentType: "medical",
        documentNumber: "MED-2024-001",
        issueDate: "2024-01-05",
        expirationDate: "2025-01-05",
        issuingAuthority: "Instituto Mexicano del Seguro Social",
        status: "valid",
        notes: "Examen médico para trabajo en altura"
      },
      {
        personnelId: 1,
        documentType: "safety",
        documentNumber: "OSHA-30HR-2023",
        issueDate: "2023-06-15",
        expirationDate: "2026-06-15",
        issuingAuthority: "OSHA Training Institute",
        status: "valid",
        notes: "Certificación OSHA 30 horas para construcción"
      },
      // José Luis documents  
      {
        personnelId: 2,
        documentType: "passport",
        documentNumber: "G87654321",
        issueDate: "2020-08-20",
        expirationDate: "2030-08-20",
        issuingAuthority: "Secretaría de Relaciones Exteriores México",
        status: "valid",
        notes: "Pasaporte nuevo, válido por 10 años"
      },
      {
        personnelId: 2,
        documentType: "visa",
        documentNumber: "B1B2-2022-002",
        issueDate: "2022-03-15",
        expirationDate: "2024-03-15",
        issuingAuthority: "US Consulate Guadalajara",
        status: "expired",
        notes: "URGENTE: Visa vencida, requiere renovación inmediata"
      },
      // Miguel Torres documents
      {
        personnelId: 3,
        documentType: "passport",
        documentNumber: "G11223344",
        issueDate: "2018-12-01",
        expirationDate: "2028-12-01",
        issuingAuthority: "Secretaría de Relaciones Exteriores México",
        status: "valid",
        notes: "Pasaporte vigente"
      },
      {
        personnelId: 3,
        documentType: "certification",
        documentNumber: "IEEE-STD-C57",
        issueDate: "2023-09-10",
        expirationDate: "2026-09-10",
        issuingAuthority: "IEEE Power & Energy Society",
        status: "valid",
        notes: "Certificación en mantenimiento de transformadores"
      }
    ];

    sampleDocuments.forEach(doc => {
      const id = this.currentId++;
      const document: Document = {
        id,
        ...doc,
        filePath: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };
      this.documents.set(id, document);
    });

    // Sample project assignments
    const sampleAssignments = [
      {
        projectId: 1, // Houston project
        personnelId: 1, // Carlos
        role: "lead",
        assignedDate: "2024-02-01",
        status: "on_site",
        notes: "Líder técnico del proyecto"
      },
      {
        projectId: 1, // Houston project  
        personnelId: 3, // Miguel
        role: "supervisor",
        assignedDate: "2024-02-01",
        status: "on_site",
        notes: "Supervisor de operaciones"
      },
      {
        projectId: 2, // Dallas project
        personnelId: 4, // Roberto
        role: "engineer",
        assignedDate: "2024-03-01",
        status: "assigned",
        notes: "Ingeniero responsable del diseño"
      }
    ];

    sampleAssignments.forEach(assignment => {
      const id = this.currentId++;
      const assign: ProjectAssignment = {
        id,
        ...assignment,
        createdAt: new Date('2024-01-01')
      };
      this.projectAssignments.set(id, assign);
    });

    // Sample safety equipment
    const sampleEquipment = [
      {
        personnelId: 1,
        equipmentType: "helmet",
        brand: "MSA",
        model: "V-Gard",
        serialNumber: "MSA001234",
        purchaseDate: "2023-01-15",
        expirationDate: "2028-01-15",
        condition: "good",
        lastInspection: "2024-01-01",
        nextInspection: "2024-07-01",
        status: "active",
        notes: "Casco certificado para trabajo eléctrico"
      },
      {
        personnelId: 1,
        equipmentType: "boots",
        brand: "Red Wing",
        model: "Electrical Hazard",
        serialNumber: "RW567890",
        purchaseDate: "2023-06-01",
        condition: "fair",
        lastInspection: "2024-01-01",
        nextInspection: "2024-04-01",
        status: "active",
        notes: "Botas dieléctricas para protección eléctrica"
      }
    ];

    sampleEquipment.forEach(equipment => {
      const id = this.currentId++;
      const equip: SafetyEquipment = {
        id,
        ...equipment,
        createdAt: new Date('2024-01-01')
      };
      this.safetyEquipment.set(id, equip);
    });

    // Sample training records
    const sampleTraining = [
      {
        personnelId: 1,
        trainingName: "OSHA 30-Hour Construction Safety",
        trainingType: "safety",
        provider: "OSHA Training Institute",
        completionDate: "2023-06-15",
        expirationDate: "2026-06-15",
        certificateNumber: "OSHA-30-2023-001",
        status: "active",
        notes: "Certificación requerida para trabajo en EUA"
      },
      {
        personnelId: 2,
        trainingName: "Primeros Auxilios y RCP",
        trainingType: "medical",
        provider: "Cruz Roja Mexicana",
        completionDate: "2023-08-20",
        expirationDate: "2025-08-20",
        certificateNumber: "CRM-FA-2023-045",
        status: "active",
        notes: "Certificación en primeros auxilios"
      },
      {
        personnelId: 3,
        trainingName: "Mantenimiento de Transformadores IEEE C57",
        trainingType: "technical",
        provider: "IEEE Power & Energy Society",
        completionDate: "2023-09-10",
        expirationDate: "2026-09-10",
        certificateNumber: "IEEE-C57-2023-078",
        status: "active",
        notes: "Certificación técnica especializada"
      }
    ];

    sampleTraining.forEach(training => {
      const id = this.currentId++;
      const train: Training = {
        id,
        ...training,
        filePath: null,
        createdAt: new Date('2024-01-01')
      };
      this.training.set(id, train);
    });

    // Sample alerts based on document expirations
    const sampleAlerts = [
      {
        personnelId: 2,
        alertType: "document_expiring",
        message: "URGENTE: Visa de José Luis Hernández vencida desde marzo 2024",
        severity: "critical",
        relatedId: 6, // Visa document
        relatedType: "document",
        dueDate: "2024-03-15",
        status: "active"
      },
      {
        personnelId: 1,
        alertType: "document_expiring",
        message: "Visa de Carlos Mendoza vence en 2 meses (enero 2025)",
        severity: "high",
        relatedId: 2, // Visa document
        relatedType: "document",
        dueDate: "2025-01-10",
        status: "active"
      },
      {
        personnelId: 1,
        alertType: "equipment_inspection",
        message: "Inspección de botas de seguridad vence en abril 2024",
        severity: "medium",
        relatedId: 2, // Safety equipment
        relatedType: "equipment",
        dueDate: "2024-04-01",
        status: "active"
      }
    ];

    sampleAlerts.forEach(alert => {
      const id = this.currentId++;
      const alertObj: Alert = {
        id,
        ...alert,
        createdAt: new Date('2024-01-01'),
        acknowledgedAt: null,
        resolvedAt: null
      };
      this.alerts.set(id, alertObj);
    });
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
