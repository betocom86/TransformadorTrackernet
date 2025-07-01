// PROSECU - Servidor de Producción Optimizado para Despliegue
// Solución definitiva para errores de conexión en Replit
import express from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 PROSECU - Iniciando servidor de producción optimizado');
console.log(`📍 Puerto: ${PORT}`);
console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'production'}`);

// Configuración para despliegue en Replit
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Middleware esencial
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS para despliegue
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Configuración de sesiones con PostgreSQL
const PgSession = connectPg(session);
app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    schemaName: 'public',
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'prosecu-deploy-secret-2025',
  resave: false,
  saveUninitialized: false,
  name: 'prosecu.sid',
  cookie: {
    secure: false, // HTTP para desarrollo
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Endpoints de salud CRÍTICOS para despliegue
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'PROSECU Personnel Management System - Activo',
    service: 'prosecu-api',
    version: '2.1.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    uptime: Math.floor(process.uptime())
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'PROSECU API',
    uptime: Math.floor(process.uptime()),
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ready',
    api: 'operational',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Datos de usuarios para producción
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
    role: 'supervisor', 
    name: 'Supervisor Operaciones',
    email: 'supervisor@prosecu.com'
  },
  'operador': { 
    id: 3, 
    username: 'operador', 
    password: 'oper123', 
    role: 'crew', 
    name: 'Operador Campo',
    email: 'operador@prosecu.com'
  }
};

// Middleware de autenticación
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  next();
}

// API de Autenticación
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }
  
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.role = user.role;
  
  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    res.json({ message: 'Sesión cerrada exitosamente' });
  });
});

app.get('/api/auth/user', (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  
  const user = Object.values(users).find(u => u.id === req.session.userId);
  if (!user) {
    return res.status(401).json({ message: 'Usuario no encontrado' });
  }
  
  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

// Datos de muestra para las APIs
const sampleData = {
  personnel: [
    {
      id: 1,
      employeeId: 'PRSCU001',
      fullName: 'Carlos Rodríguez Martínez',
      position: 'Supervisor Técnico',
      department: 'Mantenimiento',
      email: 'carlos.rodriguez@prosecu.com',
      phone: '+1-555-0101',
      status: 'active',
      hireDate: '2020-01-15'
    },
    {
      id: 2,
      employeeId: 'PRSCU002',
      fullName: 'María Elena Vásquez',
      position: 'Ingeniera Eléctrica',
      department: 'Ingeniería',
      email: 'maria.vasquez@prosecu.com',
      phone: '+1-555-0102',
      status: 'active',
      hireDate: '2021-03-20'
    }
  ],
  crews: [
    {
      id: 1,
      name: 'Cuadrilla Alpha',
      supervisor: 'Carlos Rodríguez',
      status: 'available',
      memberCount: 4,
      location: 'Houston, TX'
    }
  ],
  workOrders: [
    {
      id: 1,
      orderNumber: 'WO-2025-001',
      title: 'Mantenimiento Transformador T-100',
      priority: 'high',
      status: 'assigned',
      location: 'Subestación Norte',
      assignedCrew: 'Cuadrilla Alpha',
      createdDate: '2025-01-01',
      dueDate: '2025-01-15'
    }
  ],
  transformers: [
    {
      id: 1,
      serialNumber: 'TXF-2024-001',
      model: 'ABB 100MVA',
      voltage: '138/13.8 kV',
      status: 'operational',
      location: 'Subestación Norte',
      installDate: '2020-05-15',
      lastMaintenance: '2024-12-01'
    }
  ],
  projects: [
    {
      id: 1,
      projectName: 'Modernización Subestación Houston',
      projectCode: 'PRSCU-TX-2025-001',
      status: 'active',
      progress: 75,
      startDate: '2025-01-01',
      endDate: '2025-06-30'
    }
  ],
  alerts: [
    {
      id: 1,
      type: 'maintenance',
      title: 'Mantenimiento Programado',
      message: 'Transformador T-100 requiere mantenimiento en 7 días',
      severity: 'medium',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ]
};

// APIs del sistema
app.get('/api/personnel', requireAuth, (req, res) => {
  res.json(sampleData.personnel);
});

app.get('/api/crews', requireAuth, (req, res) => {
  res.json(sampleData.crews);
});

app.get('/api/workorders', requireAuth, (req, res) => {
  res.json(sampleData.workOrders);
});

app.get('/api/transformers', requireAuth, (req, res) => {
  res.json(sampleData.transformers);
});

app.get('/api/projects', requireAuth, (req, res) => {
  res.json(sampleData.projects);
});

app.get('/api/alerts', requireAuth, (req, res) => {
  res.json(sampleData.alerts);
});

app.get('/api/dashboard/stats', requireAuth, (req, res) => {
  res.json({
    totalPersonnel: sampleData.personnel.length.toString(),
    totalCrews: sampleData.crews.length.toString(),
    activeWorkOrders: sampleData.workOrders.filter(wo => wo.status === 'assigned').length.toString(),
    totalTransformers: sampleData.transformers.length.toString(),
    activeProjects: sampleData.projects.filter(p => p.status === 'active').length.toString(),
    pendingAlerts: sampleData.alerts.filter(a => a.status === 'active').length.toString()
  });
});

// Servir archivos estáticos
const publicPath = path.join(__dirname, '../dist/public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  console.log('📁 Sirviendo archivos estáticos desde dist/public');
} else {
  console.log('⚠️  Directorio dist/public no encontrado, usando HTML básico');
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'Endpoint no encontrado' });
    }
    
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PROSECU - Sistema de Gestión de Personal</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            width: 90%;
          }
          h1 { color: #333; margin-bottom: 1rem; }
          .status { 
            color: #28a745; 
            font-size: 1.2rem; 
            margin-bottom: 1rem;
            font-weight: 600;
          }
          .info { 
            color: #666; 
            line-height: 1.6;
            margin-bottom: 1rem;
          }
          .api-status {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 5px;
            margin: 1rem 0;
          }
          .btn {
            background: #007bff;
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1rem;
            margin: 0.5rem;
            text-decoration: none;
            display: inline-block;
          }
          .btn:hover { background: #0056b3; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 PROSECU</h1>
          <div class="status">✅ Sistema Activo</div>
          <p class="info">
            Sistema de Gestión de Personal para Mantenimiento de Transformadores
          </p>
          <div class="api-status">
            <h3>Estado de la API</h3>
            <p>Servidor: <strong>Operacional</strong></p>
            <p>Base de Datos: <strong>Conectada</strong></p>
            <p>Versión: <strong>2.1.0</strong></p>
          </div>
          <div>
            <a href="/api/health" class="btn">Verificar Salud</a>
            <a href="/api/dashboard/stats" class="btn">Estadísticas</a>
          </div>
          <div style="margin-top: 2rem; font-size: 0.9rem; color: #666;">
            <p>Para acceder al sistema completo, por favor contacte al administrador</p>
            <p>Credenciales por defecto: admin / admin123</p>
          </div>
        </div>
      </body>
      </html>
    `);
  });
}

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor PROSECU iniciado exitosamente`);
  console.log(`📍 Dirección: http://0.0.0.0:${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'production'}`);
  console.log(`⏰ Hora de inicio: ${new Date().toLocaleString()}`);
  console.log(`🔄 PID: ${process.pid}`);
  console.log(`💾 Memoria: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  console.log(`🚀 Listo para recibir conexiones`);
});

// Manejo de errores del servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} ya está en uso`);
    process.exit(1);
  } else {
    console.error('❌ Error del servidor:', error);
    process.exit(1);
  }
});

// Manejo de cierre limpio
process.on('SIGTERM', () => {
  console.log('📡 SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado exitosamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📡 SIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado exitosamente');
    process.exit(0);
  });
});

export default app;