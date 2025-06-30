// Simplified production server for deployment
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

// CRITICAL: Health check endpoints MUST be first for deployment health checks
// These respond immediately without database operations or authentication
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'PROSECU Personnel Management',
    version: '1.0.0',
    environment: 'production',
    timestamp: new Date().toISOString() 
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'PROSECU Personnel Management',
    version: '1.0.0',
    environment: 'production',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    },
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/ready', (req, res) => {
  res.status(200).json({ 
    status: 'ready',
    service: 'PROSECU Personnel Management',
    version: '1.0.0',
    environment: 'production',
    pid: process.pid,
    timestamp: new Date().toISOString()
  });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
const PgSession = connectPg(session);
app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
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

// Test users for production
const testUsers = {
  'admin': { id: 1, username: 'admin', password: 'admin123', role: 'manager', name: 'Administrator' },
  'supervisor': { id: 2, username: 'supervisor', password: 'supervisor123', role: 'manager', name: 'Supervisor' },
  'trabajador': { id: 3, username: 'trabajador', password: 'trabajador123', role: 'crew', name: 'Trabajador' }
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = testUsers[username];
    
    if (user && user.password === password) {
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.save();
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name
        }
      });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

app.get('/api/auth/user', (req, res) => {
  if (req.session?.userId) {
    const user = Object.values(testUsers).find(u => u.id === req.session.userId);
    if (user) {
      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      });
    } else {
      res.status(401).json({ message: 'No autenticado' });
    }
  } else {
    res.status(401).json({ message: 'No autenticado' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    res.json({ message: 'Sesión cerrada' });
  });
});

// Simple data endpoints for demo
app.get('/api/dashboard/stats', requireAuth, (req, res) => {
  res.json({
    expiredDocs: 3,
    expiringSoon: 8,
    availableStaff: 24,
    activeProjects: 5
  });
});

app.get('/api/personnel', requireAuth, (req, res) => {
  res.json([
    { id: 1, firstName: 'Juan', lastName: 'Pérez', position: 'Técnico Eléctrico', status: 'active' },
    { id: 2, firstName: 'María', lastName: 'González', position: 'Ingeniera', status: 'active' },
    { id: 3, firstName: 'Carlos', lastName: 'Rodríguez', position: 'Supervisor', status: 'active' }
  ]);
});

app.get('/api/work-orders', requireAuth, (req, res) => {
  res.json([
    {
      id: 1,
      title: 'Mantenimiento Transformador TX-001',
      status: 'pending',
      priority: 'high',
      location: 'Zona Industrial Norte',
      gpsCoordinates: '25.6866,-100.3161',
      assignedCrew: 'Equipo A'
    },
    {
      id: 2,
      title: 'Inspección Rutinaria TX-045',
      status: 'in_progress',
      priority: 'medium',
      location: 'Centro Comercial Plaza',
      gpsCoordinates: '25.6879,-100.3370',
      assignedCrew: 'Equipo B'
    }
  ]);
});

app.get('/api/transformers', requireAuth, (req, res) => {
  res.json([
    {
      id: 1,
      serialNumber: 'TX-001-2024',
      manufacturer: 'ABB',
      model: 'ONAN-500kVA',
      voltage: '13.8kV/480V',
      capacity: 500,
      status: 'active',
      location: 'Subestación Norte'
    },
    {
      id: 2,
      serialNumber: 'TX-045-2023',
      manufacturer: 'Siemens',
      model: 'ONAN-750kVA',
      voltage: '13.8kV/480V',
      capacity: 750,
      status: 'maintenance',
      location: 'Subestación Sur'
    }
  ]);
});

app.get('/api/procedures', requireAuth, (req, res) => {
  res.json([
    {
      id: 1,
      title: 'Inspección Visual de Transformadores',
      category: 'inspection',
      description: 'Procedimiento estándar para inspección visual de transformadores de distribución',
      steps: [
        'Verificar conexiones externas',
        'Inspeccionar aisladores',
        'Revisar nivel de aceite',
        'Documentar anomalías'
      ]
    },
    {
      id: 2,
      title: 'Mantenimiento Preventivo',
      category: 'maintenance',
      description: 'Rutina de mantenimiento preventivo para transformadores',
      steps: [
        'Desconectar alimentación',
        'Limpiar componentes externos',
        'Verificar torque de conexiones',
        'Pruebas eléctricas básicas'
      ]
    }
  ]);
});

// Serve static files if they exist
const distPath = path.join(__dirname, '../dist/public');
const indexPath = path.join(distPath, 'index.html');

// Check if built files exist
if (fs.existsSync(distPath) && fs.existsSync(indexPath)) {
  app.use(express.static(distPath));
  
  // Catch all handler for SPA
  app.get('*', (req, res) => {
    res.sendFile(indexPath);
  });
} else {
  // Fallback when static files don't exist - serve basic info
  app.get('*', (req, res) => {
    res.status(200).json({
      message: 'PROSECU Personnel Management System',
      status: 'running',
      environment: 'production',
      note: 'Frontend build not found - API endpoints available'
    });
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Start server
const server = createServer(app);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'production');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});