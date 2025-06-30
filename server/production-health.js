import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Immediate health check endpoints - registered first for fastest response
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

// Serve static files if they exist
const distPath = path.resolve(__dirname, '..', 'dist', 'public');
try {
  app.use(express.static(distPath));
  app.use('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} catch (err) {
  // If static files don't exist, just serve a simple message
  app.use('*', (req, res) => {
    res.status(200).json({
      message: 'PROSECU Personnel Management System',
      status: 'running',
      environment: 'production'
    });
  });
}

const port = parseInt(process.env.PORT || '5000', 10);
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Production health check server running on ${host}:${port}`);
});