// PROSECU - Script de Seed para datos de ejemplo
// Migración a Node.js + PostgreSQL + Vercel/Railway

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de base de datos...')

  // Limpiar datos existentes
  await prisma.alert.deleteMany()
  await prisma.transformerProcedurePhoto.deleteMany()
  await prisma.transformerProcedure.deleteMany()
  await prisma.workOrderTransformer.deleteMany()
  await prisma.workOrderPhoto.deleteMany()
  await prisma.workOrderStep.deleteMany()
  await prisma.route.deleteMany()
  await prisma.safetyEquipment.deleteMany()
  await prisma.training.deleteMany()
  await prisma.document.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.crewMember.deleteMany()
  await prisma.crew.deleteMany()
  await prisma.projectAssignment.deleteMany()
  await prisma.project.deleteMany()
  await prisma.transformer.deleteMany()
  await prisma.procedureCatalog.deleteMany()
  await prisma.personnel.deleteMany()
  await prisma.user.deleteMany()

  // Crear usuarios
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const users = await prisma.user.createMany({
    data: [
      {
        email: 'admin@prosecu.com',
        username: 'admin',
        name: 'Administrador Sistema',
        password: hashedPassword,
        role: 'MANAGER'
      },
      {
        email: 'supervisor@prosecu.com',
        username: 'supervisor',
        name: 'Supervisor Operaciones',
        password: hashedPassword,
        role: 'SUPERVISOR'
      },
      {
        email: 'operador@prosecu.com',
        username: 'operador',
        name: 'Operador Campo',
        password: hashedPassword,
        role: 'CREW'
      }
    ]
  })
  console.log(`✅ ${users.count} usuarios creados`)

  // Crear personal
  const personnel = await prisma.personnel.createMany({
    data: [
      {
        employeeId: 'PRSCU001',
        fullName: 'Carlos Rodríguez Martínez',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        position: 'Supervisor Técnico',
        department: 'Mantenimiento',
        email: 'carlos.rodriguez@prosecu.com',
        phone: '+1-713-555-0101',
        address: '1234 Main St',
        city: 'Houston',
        state: 'TX',
        zipCode: '77002',
        hireDate: new Date('2020-01-15'),
        status: 'ACTIVE'
      },
      {
        employeeId: 'PRSCU002',
        fullName: 'María Elena Vásquez',
        firstName: 'María',
        lastName: 'Vásquez',
        position: 'Ingeniera Eléctrica',
        department: 'Ingeniería',
        email: 'maria.vasquez@prosecu.com',
        phone: '+1-713-555-0102',
        address: '5678 Oak Ave',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        hireDate: new Date('2021-03-20'),
        status: 'ACTIVE'
      },
      {
        employeeId: 'PRSCU003',
        fullName: 'Miguel Ángel Torres',
        firstName: 'Miguel',
        lastName: 'Torres',
        position: 'Técnico Senior',
        department: 'Operaciones',
        email: 'miguel.torres@prosecu.com',
        phone: '+1-713-555-0103',
        address: '9012 Pine Rd',
        city: 'San Antonio',
        state: 'TX',
        zipCode: '78201',
        hireDate: new Date('2019-08-10'),
        status: 'ACTIVE'
      },
      {
        employeeId: 'PRSCU004',
        fullName: 'Roberto Jiménez',
        firstName: 'Roberto',
        lastName: 'Jiménez',
        position: 'Operador Campo',
        department: 'Operaciones',
        email: 'roberto.jimenez@prosecu.com',
        phone: '+1-713-555-0104',
        address: '3456 Elm St',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301',
        hireDate: new Date('2022-06-01'),
        status: 'ACTIVE'
      }
    ]
  })
  console.log(`✅ ${personnel.count} personal creado`)

  // Obtener IDs de personal para relaciones
  const allPersonnel = await prisma.personnel.findMany()

  // Crear proyectos
  const projects = await prisma.project.createMany({
    data: [
      {
        projectName: 'Mantenimiento Subestación Houston North',
        projectCode: 'PRSCU-TX-2025-001',
        clientName: 'CenterPoint Energy',
        location: 'Houston',
        state: 'TX',
        description: 'Mantenimiento preventivo de transformadores de potencia en subestación de 138kV',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-15'),
        estimatedDuration: 14,
        status: 'ACTIVE',
        priority: 'HIGH',
        budget: BigInt(15000000), // $150,000 en centavos
        requiredPersonnel: 4
      },
      {
        projectName: 'Instalación Transformador Dallas',
        projectCode: 'PRSCU-TX-2025-002',
        clientName: 'Oncor Electric Delivery',
        location: 'Dallas',
        state: 'TX',
        description: 'Instalación de nuevo transformador de distribución 25MVA',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-03-10'),
        estimatedDuration: 10,
        status: 'PLANNING',
        priority: 'MEDIUM',
        budget: BigInt(8500000), // $85,000 en centavos
        requiredPersonnel: 3
      },
      {
        projectName: 'Reparación Emergencia San Antonio',
        projectCode: 'PRSCU-TX-2025-003',
        clientName: 'CPS Energy',
        location: 'San Antonio',
        state: 'TX',
        description: 'Reparación de emergencia en transformador principal',
        startDate: new Date('2025-01-20'),
        endDate: new Date('2025-01-25'),
        estimatedDuration: 5,
        status: 'COMPLETED',
        priority: 'CRITICAL',
        budget: BigInt(5000000), // $50,000 en centavos
        requiredPersonnel: 2
      }
    ]
  })
  console.log(`✅ ${projects.count} proyectos creados`)

  // Crear cuadrillas
  const crews = await prisma.crew.createMany({
    data: [
      {
        crewName: 'Cuadrilla Alpha',
        crewCode: 'CA-001',
        supervisorName: 'Carlos Rodríguez',
        location: 'Houston, TX',
        status: 'AVAILABLE',
        description: 'Cuadrilla especializada en mantenimiento de transformadores de alta tensión'
      },
      {
        crewName: 'Cuadrilla Beta',
        crewCode: 'CB-002',
        supervisorName: 'María Vásquez',
        location: 'Dallas, TX',
        status: 'ASSIGNED',
        description: 'Equipo de instalación y reparación de transformadores de distribución'
      }
    ]
  })
  console.log(`✅ ${crews.count} cuadrillas creadas`)

  // Crear transformadores
  const transformers = await prisma.transformer.createMany({
    data: [
      {
        serialNumber: 'TXF-2024-001',
        model: 'ABB 100MVA',
        manufacturer: 'ABB',
        voltage: '138/13.8 kV',
        power: '100 MVA',
        installDate: new Date('2020-05-15'),
        location: 'Subestación Norte Houston',
        coordinates: '29.7604,-95.3698',
        status: 'OPERATIONAL',
        lastMaintenance: new Date('2024-12-01'),
        nextMaintenance: new Date('2025-06-01')
      },
      {
        serialNumber: 'TXF-2024-002',
        model: 'Siemens 50MVA',
        manufacturer: 'Siemens',
        voltage: '69/12.47 kV',
        power: '50 MVA',
        installDate: new Date('2021-08-20'),
        location: 'Subestación Este Dallas',
        coordinates: '32.7767,-96.7970',
        status: 'OPERATIONAL',
        lastMaintenance: new Date('2024-11-15'),
        nextMaintenance: new Date('2025-05-15')
      },
      {
        serialNumber: 'TXF-2024-003',
        model: 'General Electric 25MVA',
        manufacturer: 'General Electric',
        voltage: '34.5/4.16 kV',
        power: '25 MVA',
        installDate: new Date('2019-03-10'),
        location: 'Subestación Sur San Antonio',
        coordinates: '29.4241,-98.4936',
        status: 'MAINTENANCE',
        lastMaintenance: new Date('2024-10-30'),
        nextMaintenance: new Date('2025-04-30')
      }
    ]
  })
  console.log(`✅ ${transformers.count} transformadores creados`)

  // Crear catálogo de procedimientos
  const procedures = await prisma.procedureCatalog.createMany({
    data: [
      {
        title: 'Inspección Visual de Transformador',
        category: 'Mantenimiento Preventivo',
        description: 'Inspección visual completa del transformador y sus componentes',
        instructions: JSON.stringify([
          'Verificar estado físico del tanque',
          'Inspeccionar bushings y aisladores',
          'Revisar sistema de enfriamiento',
          'Comprobar indicadores y medidores',
          'Documentar anomalías encontradas'
        ]),
        safetyNotes: 'Usar EPP completo. Verificar desenergización antes de iniciar.',
        estimatedTime: 120,
        requiredPersonnel: 2
      },
      {
        title: 'Análisis de Aceite Dieléctrico',
        category: 'Análisis',
        description: 'Toma de muestra y análisis del aceite dieléctrico',
        instructions: JSON.stringify([
          'Preparar equipo de muestreo',
          'Tomar muestra en recipiente limpio',
          'Etiquetar muestra correctamente',
          'Enviar a laboratorio autorizado',
          'Registrar datos en bitácora'
        ]),
        safetyNotes: 'Evitar contaminación de la muestra. Usar guantes nitrilo.',
        estimatedTime: 45,
        requiredPersonnel: 1
      },
      {
        title: 'Medición de Resistencia de Aislamiento',
        category: 'Pruebas Eléctricas',
        description: 'Medición de resistencia de aislamiento con megóhmetro',
        instructions: JSON.stringify([
          'Verificar desenergización completa',
          'Conectar megóhmetro según diagrama',
          'Realizar mediciones en secuencia',
          'Registrar valores obtenidos',
          'Comparar con valores históricos'
        ]),
        safetyNotes: 'Equipo completamente desenergizado. Verificar ausencia de tensión.',
        estimatedTime: 90,
        requiredPersonnel: 2
      }
    ]
  })
  console.log(`✅ ${procedures.count} procedimientos creados`)

  // Crear órdenes de trabajo
  const workOrders = await prisma.workOrder.createMany({
    data: [
      {
        orderNumber: 'WO-2025-001',
        title: 'Mantenimiento Preventivo TXF-2024-001',
        description: 'Mantenimiento preventivo programado para transformador ABB 100MVA',
        priority: 'HIGH',
        status: 'ASSIGNED',
        location: 'Subestación Norte Houston',
        address: '1000 Industrial Blvd, Houston, TX 77002',
        coordinates: '29.7604,-95.3698',
        clientName: 'CenterPoint Energy',
        contactInfo: 'Juan Pérez - (713) 555-0200',
        estimatedHours: 8.0,
        scheduledDate: new Date('2025-02-05')
      },
      {
        orderNumber: 'WO-2025-002',
        title: 'Instalación Nuevo Transformador Dallas',
        description: 'Instalación de transformador Siemens 25MVA en nueva subestación',
        priority: 'MEDIUM',
        status: 'PENDING',
        location: 'Subestación Nueva Dallas',
        address: '2500 Commerce St, Dallas, TX 75201',
        coordinates: '32.7767,-96.7970',
        clientName: 'Oncor Electric Delivery',
        contactInfo: 'Ana García - (214) 555-0300',
        estimatedHours: 12.0,
        scheduledDate: new Date('2025-03-05')
      },
      {
        orderNumber: 'WO-2025-003',
        title: 'Reparación Emergencia San Antonio',
        description: 'Reparación de falla en transformador principal',
        priority: 'EMERGENCY',
        status: 'COMPLETED',
        location: 'Subestación Sur San Antonio',
        address: '800 Military Dr, San Antonio, TX 78201',
        coordinates: '29.4241,-98.4936',
        clientName: 'CPS Energy',
        contactInfo: 'Luis Morales - (210) 555-0400',
        estimatedHours: 6.0,
        actualHours: 8.5,
        scheduledDate: new Date('2025-01-20'),
        completedDate: new Date('2025-01-21')
      }
    ]
  })
  console.log(`✅ ${workOrders.count} órdenes de trabajo creadas`)

  // Crear alertas
  const alerts = await prisma.alert.createMany({
    data: [
      {
        type: 'MAINTENANCE',
        title: 'Mantenimiento Programado',
        message: 'Transformador TXF-2024-001 requiere mantenimiento en 7 días',
        severity: 'MEDIUM',
        status: 'ACTIVE',
        entityType: 'transformer',
        entityId: 1
      },
      {
        type: 'DOCUMENT_EXPIRY',
        title: 'Certificación Próxima a Vencer',
        message: 'Certificación de soldadura de Miguel Torres vence en 15 días',
        severity: 'HIGH',
        status: 'ACTIVE',
        entityType: 'personnel',
        entityId: 3
      },
      {
        type: 'SAFETY',
        title: 'Inspección de EPP Pendiente',
        message: 'Equipo de protección personal requiere calibración',
        severity: 'MEDIUM',
        status: 'ACTIVE'
      }
    ]
  })
  console.log(`✅ ${alerts.count} alertas creadas`)

  // Crear documentos de ejemplo
  const documents = await prisma.document.createMany({
    data: [
      {
        personnelId: allPersonnel[0].id,
        documentType: 'CERTIFICATION',
        documentNumber: 'CERT-2024-001',
        issueDate: new Date('2024-01-15'),
        expirationDate: new Date('2026-01-15'),
        fileName: 'certificacion_soldadura.pdf',
        status: 'ACTIVE'
      },
      {
        personnelId: allPersonnel[1].id,
        documentType: 'LICENSE',
        documentNumber: 'LIC-ENG-2024',
        issueDate: new Date('2024-03-01'),
        expirationDate: new Date('2026-03-01'),
        fileName: 'licencia_ingenieria.pdf',
        status: 'ACTIVE'
      }
    ]
  })
  console.log(`✅ ${documents.count} documentos creados`)

  console.log('🎉 Seed completado exitosamente!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })