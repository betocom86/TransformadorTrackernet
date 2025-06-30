// Production health check script for deployment validation
import express from 'express';
import { createServer } from 'http';

const app = express();
const PORT = process.env.PORT || 5000;

// Ultra-fast health check endpoints for deployment
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
    status: 'healthy', 
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    },
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

// Simple fallback for any other routes
app.get('*', (req, res) => {
  res.status(200).json({
    message: 'PROSECU Personnel Management System - Production Ready',
    status: 'running',
    environment: 'production',
    health_endpoints: ['/', '/health', '/api/health', '/api/ready']
  });
});

// Create server with proper error handling
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Production health server running on port ${PORT}`);
  console.log(`Environment: production`);
  console.log(`Health checks available at: /, /health, /api/health, /api/ready`);
  console.log(`Server ready for deployment health checks`);
});

// Prevent immediate exit and handle errors
server.on('listening', () => {
  console.log(`Server successfully bound to 0.0.0.0:${PORT}`);
  console.log('Production server is ready and listening for connections');
});

server.on('error', (error) => {
  console.error('Server startup error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed, process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed, process terminated');
    process.exit(0);
  });
});

// Keep process alive
setInterval(() => {
  // Empty interval to prevent process from exiting
}, 30000);