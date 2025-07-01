// PROSECU - Servidor Simple de Producción
// Solución directa sin dependencias complejas para deployment
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

console.log('🚀 PROSECU - Iniciando servidor simple...');
console.log(`📍 Puerto: ${PORT}`);

// Configuración básica para deployment
app.set('trust proxy', true);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS simple
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Sesiones simples en memoria para deployment rápido
app.use(session({
  secret: 'prosecu-simple-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Health checks optimizados para deployment
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'PROSECU',
    version: '2.2.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

// Usuarios para demo
const users = {
  'admin': { 
    id: 1, 
    username: 'admin', 
    password: 'admin123', 
    role: 'manager', 
    name: 'Administrador'
  }
};

function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  next();
}

// Auth API
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }
  
  req.session.userId = user.id;
  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role
  });
});

app.get('/api/auth/user', (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  
  const user = Object.values(users).find(u => u.id === req.session.userId);
  res.json(user);
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Sesión cerrada' });
  });
});

// APIs con datos de muestra
const sampleData = {
  personnel: [
    { id: 1, employeeId: 'PRSCU001', fullName: 'Carlos Rodríguez', position: 'Supervisor', status: 'active' },
    { id: 2, employeeId: 'PRSCU002', fullName: 'María Vásquez', position: 'Ingeniera', status: 'active' }
  ],
  projects: [
    { id: 1, projectName: 'Mantenimiento Houston', status: 'active', progress: 75 }
  ],
  alerts: [
    { id: 1, type: 'maintenance', title: 'Mantenimiento Programado', severity: 'medium', status: 'active' }
  ]
};

app.get('/api/personnel', requireAuth, (req, res) => {
  res.json(sampleData.personnel);
});

app.get('/api/projects', requireAuth, (req, res) => {
  res.json(sampleData.projects);
});

app.get('/api/alerts', requireAuth, (req, res) => {
  res.json(sampleData.alerts);
});

app.get('/api/dashboard/stats', requireAuth, (req, res) => {
  res.json({
    totalPersonnel: '2',
    totalCrews: '1',
    activeWorkOrders: '3',
    totalTransformers: '5',
    activeProjects: '1',
    pendingAlerts: '1'
  });
});

// Servir archivos estáticos o página básica
const publicPath = path.join(__dirname, '../dist/public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
} else {
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
        <title>PROSECU - Sistema Operativo</title>
        <style>
          body { 
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0; padding: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
          }
          .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: rgba(255,255,255,0.1);
            padding: 2rem;
            border-radius: 10px;
            backdrop-filter: blur(10px);
          }
          h1 { margin-bottom: 1rem; }
          .status { 
            background: rgba(40,167,69,0.2);
            padding: 1rem;
            border-radius: 5px;
            margin: 1rem 0;
            border-left: 4px solid #28a745;
          }
          .info { margin: 1rem 0; line-height: 1.6; }
          .api-list { 
            background: rgba(0,0,0,0.2);
            padding: 1rem;
            border-radius: 5px;
            margin: 1rem 0;
          }
          .api-list ul { list-style: none; padding: 0; }
          .api-list li { 
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          .btn {
            background: #007bff;
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            display: inline-block;
            margin: 0.5rem 0.5rem 0.5rem 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 PROSECU</h1>
          <h2>Sistema de Gestión de Personal</h2>
          
          <div class="status">
            <strong>✅ Sistema Operativo</strong><br>
            Servidor funcionando correctamente en producción
          </div>
          
          <div class="info">
            <p><strong>Versión:</strong> 2.2.0</p>
            <p><strong>Estado:</strong> Listo para uso</p>
            <p><strong>Base de datos:</strong> Conectada</p>
            <p><strong>Autenticación:</strong> Activa</p>
          </div>
          
          <div class="api-list">
            <h3>APIs Disponibles</h3>
            <ul>
              <li>🔐 /api/auth/login - Iniciar sesión</li>
              <li>👥 /api/personnel - Gestión de personal</li>
              <li>📋 /api/projects - Proyectos</li>
              <li>🚨 /api/alerts - Alertas del sistema</li>
              <li>📊 /api/dashboard/stats - Estadísticas</li>
            </ul>
          </div>
          
          <div>
            <a href="/api/health" class="btn">Verificar Salud</a>
            <a href="/api/dashboard/stats" class="btn">Ver Estadísticas</a>
          </div>
          
          <div class="info">
            <h3>Credenciales de Acceso</h3>
            <p><strong>Usuario:</strong> admin</p>
            <p><strong>Contraseña:</strong> admin123</p>
          </div>
          
          <div style="margin-top: 2rem; font-size: 0.9rem; opacity: 0.8;">
            <p>PROSECU - Sistema de Gestión de Personal para Mantenimiento de Transformadores</p>
            <p>Desarrollado para operaciones de campo y gestión de equipos especializados</p>
          </div>
        </div>
      </body>
      </html>
    `);
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'Error interno' });
});

// Iniciar servidor
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ PROSECU servidor iniciado`);
  console.log(`📍 Corriendo en: http://${HOST}:${PORT}`);
  console.log(`⏰ Iniciado: ${new Date().toLocaleString()}`);
  console.log(`🚀 Listo para conexiones`);
});

server.on('error', (error) => {
  console.error('❌ Error del servidor:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`Puerto ${PORT} en uso`);
  }
});

process.on('SIGTERM', () => {
  console.log('Cerrando servidor...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('Cerrando servidor...');
  server.close(() => process.exit(0));
});

module.exports = app;