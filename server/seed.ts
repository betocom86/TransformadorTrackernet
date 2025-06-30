import { db } from "./db";
import { users, personnel, documents, projects, projectAssignments, safetyEquipment, training, alerts } from "@shared/schema";

async function seedDatabase() {
  console.log("🌱 Seeding database with sample data...");

  try {
    // Clear existing data
    await db.delete(alerts);
    await db.delete(training);
    await db.delete(safetyEquipment);
    await db.delete(projectAssignments);
    await db.delete(documents);
    await db.delete(projects);
    await db.delete(personnel);
    await db.delete(users);

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

    const insertedPersonnel = await db.insert(personnel).values(samplePersonnel).returning();
    console.log(`✅ Inserted ${insertedPersonnel.length} personnel records`);

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

    const insertedProjects = await db.insert(projects).values(sampleProjects).returning();
    console.log(`✅ Inserted ${insertedProjects.length} project records`);

    // Sample documents based on compliance requirements
    const sampleDocuments = [
      // Carlos Mendoza documents
      {
        personnelId: insertedPersonnel[0].id,
        documentType: "passport",
        documentNumber: "G12345678",
        issueDate: "2019-05-15",
        expirationDate: "2029-05-15",
        issuingAuthority: "Secretaría de Relaciones Exteriores México",
        status: "valid",
        notes: "Pasaporte vigente para viajes a EUA"
      },
      {
        personnelId: insertedPersonnel[0].id,
        documentType: "visa",
        documentNumber: "B1B2-2023-001",
        issueDate: "2023-01-10",
        expirationDate: "2025-01-10",
        issuingAuthority: "US Embassy Mexico City",
        status: "expiring_soon",
        notes: "Visa de trabajo temporal, renovar pronto"
      },
      {
        personnelId: insertedPersonnel[0].id,
        documentType: "medical",
        documentNumber: "MED-2024-001",
        issueDate: "2024-01-05",
        expirationDate: "2025-01-05",
        issuingAuthority: "Instituto Mexicano del Seguro Social",
        status: "valid",
        notes: "Examen médico para trabajo en altura"
      },
      {
        personnelId: insertedPersonnel[0].id,
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
        personnelId: insertedPersonnel[1].id,
        documentType: "passport",
        documentNumber: "G87654321",
        issueDate: "2020-08-20",
        expirationDate: "2030-08-20",
        issuingAuthority: "Secretaría de Relaciones Exteriores México",
        status: "valid",
        notes: "Pasaporte nuevo, válido por 10 años"
      },
      {
        personnelId: insertedPersonnel[1].id,
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
        personnelId: insertedPersonnel[2].id,
        documentType: "passport",
        documentNumber: "G11223344",
        issueDate: "2018-12-01",
        expirationDate: "2028-12-01",
        issuingAuthority: "Secretaría de Relaciones Exteriores México",
        status: "valid",
        notes: "Pasaporte vigente"
      },
      {
        personnelId: insertedPersonnel[2].id,
        documentType: "certification",
        documentNumber: "IEEE-STD-C57",
        issueDate: "2023-09-10",
        expirationDate: "2026-09-10",
        issuingAuthority: "IEEE Power & Energy Society",
        status: "valid",
        notes: "Certificación en mantenimiento de transformadores"
      }
    ];

    const insertedDocuments = await db.insert(documents).values(sampleDocuments).returning();
    console.log(`✅ Inserted ${insertedDocuments.length} document records`);

    // Sample project assignments
    const sampleAssignments = [
      {
        projectId: insertedProjects[0].id, // Houston project
        personnelId: insertedPersonnel[0].id, // Carlos
        role: "lead",
        assignedDate: "2024-02-01",
        status: "on_site",
        notes: "Líder técnico del proyecto"
      },
      {
        projectId: insertedProjects[0].id, // Houston project  
        personnelId: insertedPersonnel[2].id, // Miguel
        role: "supervisor",
        assignedDate: "2024-02-01",
        status: "on_site",
        notes: "Supervisor de operaciones"
      },
      {
        projectId: insertedProjects[1].id, // Dallas project
        personnelId: insertedPersonnel[3].id, // Roberto
        role: "engineer",
        assignedDate: "2024-03-01",
        status: "assigned",
        notes: "Ingeniero responsable del diseño"
      }
    ];

    const insertedAssignments = await db.insert(projectAssignments).values(sampleAssignments).returning();
    console.log(`✅ Inserted ${insertedAssignments.length} project assignment records`);

    // Sample safety equipment
    const sampleEquipment = [
      {
        personnelId: insertedPersonnel[0].id,
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
        personnelId: insertedPersonnel[0].id,
        equipmentType: "boots",
        brand: "Red Wing",
        model: "Electrical Hazard",
        serialNumber: "RW567890",
        purchaseDate: "2023-06-01",
        expirationDate: null,
        condition: "fair",
        lastInspection: "2024-01-01",
        nextInspection: "2024-04-01",
        status: "active",
        notes: "Botas dieléctricas para protección eléctrica"
      }
    ];

    const insertedEquipment = await db.insert(safetyEquipment).values(sampleEquipment).returning();
    console.log(`✅ Inserted ${insertedEquipment.length} safety equipment records`);

    // Sample training records
    const sampleTraining = [
      {
        personnelId: insertedPersonnel[0].id,
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
        personnelId: insertedPersonnel[1].id,
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
        personnelId: insertedPersonnel[2].id,
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

    const insertedTraining = await db.insert(training).values(sampleTraining).returning();
    console.log(`✅ Inserted ${insertedTraining.length} training records`);

    // Sample alerts based on document expirations
    const sampleAlerts = [
      {
        personnelId: insertedPersonnel[1].id,
        alertType: "document_expiring",
        message: "URGENTE: Visa de José Luis Hernández vencida desde marzo 2024",
        severity: "critical",
        relatedId: insertedDocuments[5].id, // Visa document
        relatedType: "document",
        dueDate: "2024-03-15",
        status: "active"
      },
      {
        personnelId: insertedPersonnel[0].id,
        alertType: "document_expiring",
        message: "Visa de Carlos Mendoza vence en 2 meses (enero 2025)",
        severity: "high",
        relatedId: insertedDocuments[1].id, // Visa document
        relatedType: "document",
        dueDate: "2025-01-10",
        status: "active"
      },
      {
        personnelId: insertedPersonnel[0].id,
        alertType: "equipment_inspection",
        message: "Inspección de botas de seguridad vence en abril 2024",
        severity: "medium",
        relatedId: insertedEquipment[1].id, // Safety equipment
        relatedType: "equipment",
        dueDate: "2024-04-01",
        status: "active"
      }
    ];

    const insertedAlerts = await db.insert(alerts).values(sampleAlerts).returning();
    console.log(`✅ Inserted ${insertedAlerts.length} alert records`);

    console.log("🎉 Database seeding completed successfully!");
    console.log(`
    Summary:
    - ${insertedPersonnel.length} personnel records
    - ${insertedProjects.length} project records  
    - ${insertedDocuments.length} document records
    - ${insertedAssignments.length} project assignments
    - ${insertedEquipment.length} safety equipment records
    - ${insertedTraining.length} training records
    - ${insertedAlerts.length} alert records
    `);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDatabase };