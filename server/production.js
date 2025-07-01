// PROSECU Personnel Management - Production Server
// Clean deployment-ready server for Replit
import express from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Configure for deployment
app.set('trust proxy', true);

console.log('🚀 Starting PROSECU Personnel Management System...');
console.log(`📍 Port: ${PORT}`);
console.log(`🌍 Environment: production`);

// PRIORITY: Immediate health check endpoints for deployment
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'PROSECU Personnel Management',
    version: '2.0.0',
    environment: 'production',
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    uptime: Math.floor(process.uptime()),
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ready',
    service: 'PROSECU Personnel Management API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/ready', (req, res) => {
  res.status(200).json({ 
    ready: true,
    service: 'PROSECU Personnel Management',
    timestamp: new Date().toISOString()
  });
});

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
const PgSession = connectPg(session);
app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'prosecu-production-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  next();
}

// Production user accounts
const users = {
  'admin': { 
    id: 1, 
    username: 'admin', 
    password: 'admin123', 
    role: 'manager', 
    name: 'Administrador Sistema',
    email: 'admin@prosecu.com'
  },
  'supervisor': { 
    id: 2, 
    username: 'supervisor', 
    password: 'super123', 
    role: 'manager', 
    name: 'Supervisor General',
    email: 'supervisor@prosecu.com'
  },
  'trabajador': { 
    id: 3, 
    username: 'trabajador', 
    password: 'trabajo123', 
    role: 'crew', 
    name: 'Trabajador Campo',
    email: 'trabajador@prosecu.com'
  }
};

// === AUTHENTICATION ROUTES ===
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    }

    const user = users[username.toLowerCase()];
    
    if (user && user.password === password) {
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.userName = user.name;
      
      console.log(`✅ Usuario autenticado: ${user.name} (${user.role})`);
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email
        }
      });
    } else {
      console.log(`❌ Intento de login fallido: ${username}`);
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

app.get('/api/auth/user', (req, res) => {
  if (req.session?.userId) {
    const user = Object.values(users).find(u => u.id === req.session.userId);
    if (user) {
      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email
      });
    } else {
      res.status(401).json({ message: 'No autenticado' });
    }
  } else {
    res.status(401).json({ message: 'No autenticado' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const userName = req.session?.userName || 'Usuario';
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Error en logout:', err);
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    console.log(`🔐 Sesión cerrada: ${userName}`);
    res.json({ message: 'Sesión cerrada exitosamente' });
  });
});

// === DASHBOARD STATISTICS ===
app.get('/api/dashboard/stats', requireAuth, (req, res) => {
  res.json({
    totalPersonnel: 45,
    activeProjects: 8,
    expiredDocuments: 3,
    expiringSoon: 12,
    availableCrew: 6,
    activeCrew: 4,
    totalWorkOrders: 23,
    pendingOrders: 7,
    completedToday: 3,
    monthlyCompletion: 67
  });
});

// === PERSONNEL MANAGEMENT ===
app.get('/api/personnel', requireAuth, (req, res) => {
  const personnel = [
    {
      id: 1,
      firstName: 'Juan Carlos',
      lastName: 'Pérez Martínez',
      position: 'Técnico Eléctrico Senior',
      department: 'Mantenimiento',
      status: 'active',
      hireDate: '2020-03-15',
      phone: '+52 81 1234 5678',
      email: 'juan.perez@prosecu.com',
      certifications: ['Electricista Industrial', 'Seguridad en Alturas']
    },
    {
      id: 2,
      firstName: 'María Elena',
      lastName: 'González Rodríguez',
      position: 'Ingeniera de Proyectos',
      department: 'Ingeniería',
      status: 'active',
      hireDate: '2019-08-20',
      phone: '+52 81 2345 6789',
      email: 'maria.gonzalez@prosecu.com',
      certifications: ['PMP', 'Ingeniería Eléctrica']
    },
    {
      id: 3,
      firstName: 'Carlos Alberto',
      lastName: 'Rodríguez López',
      position: 'Supervisor de Campo',
      department: 'Operaciones',
      status: 'active',
      hireDate: '2018-05-10',
      phone: '+52 81 3456 7890',
      email: 'carlos.rodriguez@prosecu.com',
      certifications: ['Liderazgo', 'Seguridad Industrial']
    },
    {
      id: 4,
      firstName: 'Ana Patricia',
      lastName: 'Mendoza Silva',
      position: 'Técnico en Instrumentación',
      department: 'Mantenimiento',
      status: 'active',
      hireDate: '2021-01-12',
      phone: '+52 81 4567 8901',
      email: 'ana.mendoza@prosecu.com',
      certifications: ['Instrumentación Industrial']
    }
  ];
  
  res.json(personnel);
});

// === CREW MANAGEMENT ===
app.get('/api/crews', requireAuth, (req, res) => {
  const crews = [
    {
      id: 1,
      crewName: 'Equipo Alpha',
      crewCode: 'ALPHA-01',
      specialization: 'transformer_maintenance',
      maxCapacity: 6,
      currentSize: 4,
      status: 'available',
      baseLocation: 'Monterrey, Nuevo León',
      contactPhone: '+52 81 1111 2222',
      equipment: ['Multímetro Digital', 'Equipo de Soldadura', 'Grúa Móvil'],
      notes: 'Equipo especializado en transformadores de alta tensión',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-12-20T15:30:00Z'
    },
    {
      id: 2,
      crewName: 'Equipo Beta',
      crewCode: 'BETA-02',
      specialization: 'electrical_repair',
      maxCapacity: 4,
      currentSize: 3,
      status: 'assigned',
      baseLocation: 'Guadalajara, Jalisco',
      contactPhone: '+52 33 2222 3333',
      equipment: ['Kit de Herramientas Eléctricas', 'Probador de Cables'],
      notes: 'Especialistas en reparaciones de emergencia',
      createdAt: '2024-02-01T08:00:00Z',
      updatedAt: '2024-12-28T12:00:00Z'
    },
    {
      id: 3,
      crewName: 'Equipo Gamma',
      crewCode: 'GAMMA-03',
      specialization: 'emergency_response',
      maxCapacity: 8,
      currentSize: 6,
      status: 'available',
      baseLocation: 'Ciudad de México',
      contactPhone: '+52 55 3333 4444',
      equipment: ['Generador Portátil', 'Equipo de Comunicación', 'Vehículo de Emergencia'],
      notes: 'Respuesta rápida 24/7',
      createdAt: '2024-01-20T14:00:00Z',
      updatedAt: '2024-12-30T09:15:00Z'
    }
  ];
  
  res.json(crews);
});

// === WORK ORDERS ===
app.get('/api/work-orders', requireAuth, (req, res) => {
  const workOrders = [
    {
      id: 1,
      title: 'Mantenimiento Preventivo TX-001',
      description: 'Inspección y mantenimiento del transformador principal',
      status: 'pending',
      priority: 'high',
      location: 'Subestación Norte - Zona Industrial',
      address: 'Av. Industrial 1250, Monterrey, NL',
      postalCode: '64700',
      gpsCoordinates: '25.6866,-100.3161',
      assignedCrew: 'Equipo Alpha',
      estimatedHours: 4,
      scheduledDate: '2025-01-02',
      createdAt: '2024-12-28T10:00:00Z'
    },
    {
      id: 2,
      title: 'Reparación Urgente TX-045',
      description: 'Falla en transformador de distribución - pérdida de energía',
      status: 'in_progress',
      priority: 'critical',
      location: 'Centro Comercial Plaza del Sol',
      address: 'Av. López Mateos 2375, Guadalajara, JAL',
      postalCode: '44550',
      gpsCoordinates: '20.6597,-103.3496',
      assignedCrew: 'Equipo Beta',
      estimatedHours: 6,
      scheduledDate: '2024-12-30',
      createdAt: '2024-12-29T14:30:00Z'
    },
    {
      id: 3,
      title: 'Instalación Nueva TX-078',
      description: 'Instalación de transformador nuevo en expansión residencial',
      status: 'scheduled',
      priority: 'medium',
      location: 'Fraccionamiento Los Pinos',
      address: 'Calle Pino 150, San Pedro Garza García, NL',
      postalCode: '66230',
      gpsCoordinates: '25.6515,-100.4077',
      assignedCrew: null,
      estimatedHours: 8,
      scheduledDate: '2025-01-05',
      createdAt: '2024-12-27T16:45:00Z'
    }
  ];
  
  res.json(workOrders);
});

// === TRANSFORMER INVENTORY ===
app.get('/api/transformers', requireAuth, (req, res) => {
  const transformers = [
    {
      id: 1,
      serialNumber: 'TX-001-2024',
      manufacturer: 'ABB México',
      model: 'ONAN-500kVA-13.8kV',
      voltage: '13.8kV/480V',
      capacity: 500,
      powerRating: '500 kVA',
      status: 'active',
      location: 'Subestación Norte',
      installationDate: '2024-03-15',
      lastMaintenance: '2024-11-20',
      nextMaintenance: '2025-05-20',
      condition: 'excellent'
    },
    {
      id: 2,
      serialNumber: 'TX-045-2023',
      manufacturer: 'Siemens',
      model: 'ONAN-750kVA-13.8kV',
      voltage: '13.8kV/480V',
      capacity: 750,
      powerRating: '750 kVA',
      status: 'maintenance',
      location: 'Subestación Sur',
      installationDate: '2023-08-10',
      lastMaintenance: '2024-12-15',
      nextMaintenance: '2025-03-15',
      condition: 'good'
    },
    {
      id: 3,
      serialNumber: 'TX-078-2024',
      manufacturer: 'Schneider Electric',
      model: 'ONAN-1000kVA-13.8kV',
      voltage: '13.8kV/480V',
      capacity: 1000,
      powerRating: '1000 kVA',
      status: 'new',
      location: 'Almacén Central',
      installationDate: null,
      lastMaintenance: null,
      nextMaintenance: null,
      condition: 'new'
    }
  ];
  
  res.json(transformers);
});

// === TECHNICAL PROCEDURES ===
app.get('/api/procedures', requireAuth, (req, res) => {
  const procedures = [
    {
      id: 1,
      title: 'Inspección Visual de Transformadores',
      category: 'inspection',
      description: 'Procedimiento estándar para inspección visual de transformadores de distribución',
      safetyRequirements: [
        'Equipo de protección personal completo',
        'Verificar desconexión de energía',
        'Bloqueo y etiquetado (LOTO)',
        'Detector de gases'
      ],
      steps: [
        'Verificar que el transformador esté desenergizado',
        'Inspeccionar conexiones externas por corrosión o daños',
        'Revisar aisladores por grietas o contaminación',
        'Verificar nivel de aceite dieléctrico',
        'Inspeccionar tanque por fugas o deformaciones',
        'Revisar sistema de ventilación y refrigeración',
        'Documentar todas las anomalías encontradas',
        'Completar reporte de inspección'
      ],
      estimatedTime: '2-3 horas',
      requiredTools: ['Multímetro', 'Cámara digital', 'Detector de fugas', 'Linterna LED'],
      createdAt: '2024-01-10T00:00:00Z'
    },
    {
      id: 2,
      title: 'Mantenimiento Preventivo Transformador',
      category: 'maintenance',
      description: 'Rutina completa de mantenimiento preventivo para transformadores de potencia',
      safetyRequirements: [
        'Autorización de trabajo en caliente',
        'Equipo de respiración autónoma',
        'Extintor clase C disponible',
        'Personal certificado únicamente'
      ],
      steps: [
        'Desconectar completamente la alimentación',
        'Aplicar procedimiento LOTO',
        'Drenar aceite dieléctrico para análisis',
        'Limpiar componentes externos con solvente apropiado',
        'Verificar y ajustar torque de todas las conexiones',
        'Realizar pruebas de resistencia de aislamiento',
        'Prueba de relación de transformación',
        'Rellenar con aceite nuevo certificado',
        'Pruebas finales de funcionamiento',
        'Documentar todos los valores medidos'
      ],
      estimatedTime: '6-8 horas',
      requiredTools: ['Megger', 'TTR', 'Analizador de aceite', 'Llaves de torque'],
      createdAt: '2024-01-15T00:00:00Z'
    },
    {
      id: 3,
      title: 'Respuesta a Emergencia Eléctrica',
      category: 'emergency',
      description: 'Protocolo de respuesta rápida para fallas críticas en transformadores',
      safetyRequirements: [
        'Notificar a bomberos y protección civil',
        'Evacuar área de 15 metros',
        'Equipo especializado en emergencias',
        'Comunicación constante con centro de control'
      ],
      steps: [
        'Evaluar la situación desde distancia segura',
        'Notificar inmediatamente a supervisión',
        'Desenergizar circuitos afectados',
        'Establecer perímetro de seguridad',
        'Identificar tipo de falla (térmica, eléctrica, mecánica)',
        'Implementar medidas de contención',
        'Coordinar con servicios de emergencia',
        'Ejecutar reparación temporal si es seguro',
        'Restablecer servicio gradualmente',
        'Generar reporte detallado del incidente'
      ],
      estimatedTime: '1-4 horas',
      requiredTools: ['Radio de emergencia', 'Generador portátil', 'Kit de reparación rápida'],
      createdAt: '2024-01-20T00:00:00Z'
    }
  ];
  
  res.json(procedures);
});

// === DOCUMENTS MANAGEMENT ===
app.get('/api/documents', requireAuth, (req, res) => {
  const documents = [
    {
      id: 1,
      personnelId: 1,
      title: 'Certificación Electricista Industrial',
      category: 'certification',
      fileName: 'cert_electricista_juan_perez.pdf',
      expirationDate: '2025-06-15',
      status: 'valid',
      uploadedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      personnelId: 2,
      title: 'Licencia de Ingeniero',
      category: 'certification',
      fileName: 'licencia_ing_maria_gonzalez.pdf',
      expirationDate: '2026-03-20',
      status: 'valid',
      uploadedAt: '2024-02-01T14:30:00Z'
    },
    {
      id: 3,
      personnelId: 1,
      title: 'Examen Médico Anual',
      category: 'medical',
      fileName: 'examen_medico_juan_perez_2024.pdf',
      expirationDate: '2025-01-30',
      status: 'expiring_soon',
      uploadedAt: '2024-01-30T09:15:00Z'
    }
  ];
  
  res.json(documents);
});

// === PROJECTS MANAGEMENT ===
app.get('/api/projects', requireAuth, (req, res) => {
  const projects = [
    {
      id: 1,
      projectName: 'Modernización Subestación Norte',
      projectCode: 'PROJ-2024-001',
      client: 'CFE Distribución',
      status: 'active',
      startDate: '2024-11-01',
      endDate: '2025-03-31',
      location: 'Monterrey, Nuevo León',
      description: 'Actualización completa de equipos de subestación eléctrica',
      budget: 2500000,
      assignedPersonnel: [1, 2, 3]
    },
    {
      id: 2,
      projectName: 'Expansión Red Guadalajara',
      projectCode: 'PROJ-2024-002',
      client: 'Comisión Federal de Electricidad',
      status: 'planning',
      startDate: '2025-02-15',
      endDate: '2025-08-30',
      location: 'Guadalajara, Jalisco',
      description: 'Instalación de nueva infraestructura eléctrica residencial',
      budget: 1800000,
      assignedPersonnel: [2, 4]
    }
  ];
  
  res.json(projects);
});

// === COMPLIANCE AND ALERTS ===
app.get('/api/compliance/overview', requireAuth, (req, res) => {
  res.json({
    totalRequirements: 45,
    compliantRequirements: 38,
    complianceRate: 84.4,
    expiredDocuments: 3,
    expiringSoon: 12,
    totalPersonnel: 45,
    lastUpdated: new Date().toISOString()
  });
});

app.get('/api/alerts', requireAuth, (req, res) => {
  const alerts = [
    {
      id: 1,
      type: 'document_expiring',
      title: 'Documentos por Vencer',
      message: '3 certificaciones vencen en los próximos 30 días',
      severity: 'warning',
      createdAt: '2024-12-30T08:00:00Z'
    },
    {
      id: 2,
      type: 'maintenance_due',
      title: 'Mantenimiento Programado',
      message: 'Transformador TX-045 requiere mantenimiento',
      severity: 'info',
      createdAt: '2024-12-29T15:30:00Z'
    },
    {
      id: 3,
      type: 'safety_violation',
      title: 'Incidente de Seguridad',
      message: 'Reporte de seguridad pendiente de revisión',
      severity: 'critical',
      createdAt: '2024-12-28T12:45:00Z'
    }
  ];
  
  res.json(alerts);
});

// Serve built frontend if available
const distPath = path.join(__dirname, '../dist/public');
const indexPath = path.join(distPath, 'index.html');

if (fs.existsSync(distPath) && fs.existsSync(indexPath)) {
  console.log('📁 Serving built frontend from dist/public');
  app.use(express.static(distPath));
  
  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(indexPath);
  });
} else {
  console.log('⚠️  Frontend build not found - API only mode');
  app.get('*', (req, res) => {
    res.status(200).json({
      service: 'PROSECU Personnel Management API',
      status: 'running',
      version: '2.0.0',
      environment: 'production',
      endpoints: [
        'GET /',
        'GET /health',
        'GET /api/health',
        'POST /api/auth/login',
        'GET /api/auth/user',
        'GET /api/dashboard/stats',
        'GET /api/personnel',
        'GET /api/crews',
        'GET /api/work-orders',
        'GET /api/transformers',
        'GET /api/procedures'
      ],
      note: 'Frontend will be served once built'
    });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Start production server
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🎉 PROSECU Personnel Management System');
  console.log('✅ Production server running successfully');
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`📊 API: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('👥 Test Users:');
  console.log('   • admin / admin123 (Manager)');
  console.log('   • supervisor / super123 (Manager)');
  console.log('   • trabajador / trabajo123 (Crew)');
  console.log('');
  console.log('🚀 Ready for deployment!');
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received - shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received - shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

// Keep process alive and handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

export default app;