#!/usr/bin/env node

// Simple production starter for deployment
console.log('🚀 Starting PROSECU Personnel Management in production mode...');

// Set production environment
process.env.NODE_ENV = 'production';

// Start the existing server with production config
import('./server/index.ts').catch(error => {
  console.error('Failed to start production server:', error);
  process.exit(1);
});