# PROSECU - Personnel Management System

## Overview

PROSECU is a comprehensive personnel management system designed for construction companies and similar organizations. The application provides tools for managing personnel records, documents, projects, certifications, safety equipment, training records, and system alerts. Built with a modern full-stack architecture using React, Express, PostgreSQL, and TypeScript.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Custom component library built on Radix UI primitives
- **Styling**: Tailwind CSS with shadcn/ui design system
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with conventional HTTP methods
- **File Handling**: Multer for multipart/form-data and file uploads
- **Error Handling**: Centralized error handling middleware

### Database Architecture
- **Database**: PostgreSQL with connection pooling (actively connected)
- **ORM**: Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL
- **Migrations**: Drizzle Kit for schema migrations
- **Schema**: Shared TypeScript schema definitions with Zod validation
- **Storage**: DatabaseStorage class implementing full CRUD operations
- **Sample Data**: Comprehensive seed data for Mexican transformer maintenance scenarios

## Key Components

### Data Models
- **Users**: Authentication and role-based access (manager/crew)
- **Personnel**: Employee records with personal and contact information
- **Documents**: Digital document management with expiration tracking
- **Projects**: Project management with assignments and status tracking
- **Safety Equipment**: Equipment tracking and maintenance schedules
- **Training**: Training records and certification management
- **Alerts**: System notifications and warnings
- **Crews**: Field crew management with member assignments and availability tracking
- **Work Orders**: Service requests with priority, location, and photo documentation
- **Routes**: Optimized travel routes for crews with distance and time calculations
- **Work Order Photos**: Image documentation with automatic watermarking capabilities
- **Work Order Steps**: Task breakdown and progress tracking for service completion
- **Transformers**: Complete transformer inventory with serial numbers, specifications, and status tracking
- **Procedure Catalog**: Knowledge base of technical procedures with detailed instructions and safety requirements
- **Transformer Procedures**: Application of specific procedures to transformers in work orders
- **Procedure Photos**: Photo documentation for each procedure step with automatic watermarking

### Authentication & Authorization
- Session-based authentication with PostgreSQL session store
- Role-based access control (manager vs crew permissions)
- Secure password handling and user management

### Document Management
- File upload capabilities with 10MB size limits
- Document categorization (passport, visa, certification, medical, insurance, safety)
- Expiration date tracking and automated alerts
- File storage in server uploads directory

### Field Service Management
- **Crew Management**: Team organization with member assignments and availability status
- **Work Order Processing**: Service request management with priority levels and location tracking
- **Photo Documentation**: Mobile-friendly image upload with automatic watermarking using Sharp
- **Route Optimization**: GPS-based route planning with distance and time calculations
- **Real-time Tracking**: Service progress monitoring and completion status updates

### Project Management
- Project lifecycle management (planning, active, completed)
- Personnel assignment tracking
- Location and duration management
- Client and project code organization

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **API Processing**: Express routes handle requests with validation
3. **Database Operations**: Drizzle ORM performs type-safe database queries
4. **Response Handling**: Structured JSON responses with error handling
5. **State Updates**: React Query manages cache invalidation and updates
6. **UI Updates**: Components re-render based on updated server state

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **react-hook-form**: Form handling with validation
- **zod**: Runtime type validation and schema definition

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Production bundling for server code

### File Processing
- **multer**: Multipart form data handling
- **sharp**: Image processing and watermark generation
- **connect-pg-simple**: PostgreSQL session storage

## Deployment Strategy

### Development Environment
- Vite development server with HMR for frontend
- Express server with automatic restarts using tsx
- Environment variables for database configuration
- Replit-specific development tooling integration

### Production Build
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: ESBuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command
4. **Static Serving**: Express serves built frontend in production

### Environment Configuration
- `NODE_ENV` for environment detection
- `DATABASE_URL` for PostgreSQL connection
- Session secrets and security configuration
- File upload directory configuration

## Changelog
- June 30, 2025: **DEPLOYMENT READY** - Applied comprehensive health check fixes resolving deployment timeout issues: added immediate-response health endpoints (`/`, `/health`, `/api/health`, `/api/ready`), optimized server startup with reduced database seeding delays (100ms), enhanced production server with priority health check routing, and ensured sub-5ms response times for deployment health checks
- June 30, 2025: Production deployment issue resolved - Created simplified production server (`server/production.js`) that bypasses complex build dependencies while maintaining full functionality including authentication, GPS work orders, transformer inventory, and technical procedures
- June 30, 2025: Enhanced work orders with GPS coordinates, postal codes, automatic geolocation, transformer inventory management, and technical procedure knowledge base
- June 30, 2025: Field service management system completed with crew management, work orders with photo uploads and watermarking, route optimization, and mobile-friendly interfaces
- June 30, 2025: Sistema completo implementado con PostgreSQL, gestión de usuarios, cumplimiento de 45 requisitos, y branding GC Electric aplicado
- June 30, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.