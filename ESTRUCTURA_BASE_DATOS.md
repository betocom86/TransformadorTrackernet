# ESTRUCTURA DE BASE DE DATOS - PROSECU
## Sistema de Gestión de Personal para Mantenimiento de Transformadores

**Fecha de Exportación:** 1 de Julio, 2025  
**Base de Datos:** PostgreSQL  
**Total de Tablas:** 21 tablas principales

---

## RESUMEN DE TABLAS

| Tabla | Registros | Descripción |
|-------|-----------|-------------|
| **users** | Sistema | Usuarios del sistema con autenticación Replit |
| **personnel** | 4+ | Registros de personal y empleados |
| **documents** | Variable | Documentos digitales (pasaportes, certificaciones) |
| **projects** | Variable | Proyectos y asignaciones |
| **crews** | 1+ | Cuadrillas de trabajo |
| **work_orders** | Variable | Órdenes de trabajo de campo |
| **transformers** | Variable | Inventario de transformadores |
| **procedure_catalog** | Variable | Catálogo de procedimientos técnicos |
| **alerts** | Variable | Alertas y notificaciones del sistema |

---

## ESTRUCTURA DETALLADA DE TABLAS

### 1. **USERS** - Usuarios del Sistema
```sql
CREATE TABLE users (
    id character varying PRIMARY KEY,              -- ID de usuario Replit
    email character varying UNIQUE,                -- Email del usuario
    first_name character varying,                  -- Nombre
    last_name character varying,                   -- Apellido
    profile_image_url character varying,           -- URL de imagen de perfil
    role character varying NOT NULL DEFAULT 'crew', -- admin, manager, crew, viewer
    department character varying,                  -- Departamento
    position character varying,                    -- Posición/Cargo
    is_active boolean DEFAULT true,                -- Usuario activo
    last_login_at timestamp,                       -- Último login
    created_at timestamp DEFAULT now(),            -- Fecha de creación
    updated_at timestamp DEFAULT now()             -- Fecha de actualización
);
```

### 2. **PERSONNEL** - Personal y Empleados
```sql
CREATE TABLE personnel (
    id serial PRIMARY KEY,                         -- ID único
    employee_id text NOT NULL UNIQUE,              -- ID de empleado (ej: PRSCU002)
    full_name text NOT NULL,                       -- Nombre completo
    position text NOT NULL,                        -- Posición laboral
    department text NOT NULL,                      -- Departamento
    phone_number text,                             -- Teléfono
    emergency_contact text,                        -- Contacto de emergencia
    emergency_phone text,                          -- Teléfono de emergencia
    address text,                                  -- Dirección
    date_of_birth text,                           -- Fecha de nacimiento
    hire_date text,                               -- Fecha de contratación
    status text NOT NULL DEFAULT 'active',        -- active, inactive, suspended
    notes text,                                   -- Notas adicionales
    created_at timestamp DEFAULT now(),           -- Fecha de creación
    updated_at timestamp DEFAULT now()            -- Fecha de actualización
);
```

### 3. **DOCUMENTS** - Documentos Digitales
```sql
CREATE TABLE documents (
    id serial PRIMARY KEY,                         -- ID único
    personnel_id integer NOT NULL,                 -- FK a personnel
    document_type text NOT NULL,                   -- passport, visa, certification, medical, insurance, safety
    document_number text,                          -- Número de documento
    issue_date text,                              -- Fecha de emisión
    expiration_date text,                         -- Fecha de expiración
    issuing_authority text,                       -- Autoridad emisora
    status text NOT NULL DEFAULT 'valid',         -- valid, expired, expiring_soon, pending
    file_path text,                               -- Ruta del archivo
    file_name text,                               -- Nombre del archivo
    file_size integer,                            -- Tamaño del archivo
    mime_type text,                               -- Tipo MIME
    notes text,                                   -- Notas
    created_at timestamp DEFAULT now(),           -- Fecha de creación
    updated_at timestamp DEFAULT now()            -- Fecha de actualización
);
```

### 4. **PROJECTS** - Proyectos
```sql
CREATE TABLE projects (
    id serial PRIMARY KEY,                         -- ID único
    project_name text NOT NULL,                    -- Nombre del proyecto
    project_code text NOT NULL UNIQUE,             -- Código único del proyecto
    client_name text NOT NULL,                     -- Nombre del cliente
    location text NOT NULL,                        -- Ubicación
    state text NOT NULL,                          -- Estado/Provincia
    start_date text,                              -- Fecha de inicio
    end_date text,                                -- Fecha de fin
    estimated_duration integer,                    -- Duración estimada (días)
    status text NOT NULL DEFAULT 'planning',      -- planning, active, completed, cancelled, on_hold
    description text,                             -- Descripción
    required_personnel integer DEFAULT 0,         -- Personal requerido
    priority text NOT NULL DEFAULT 'medium',      -- low, medium, high, urgent
    budget integer,                               -- Presupuesto (centavos)
    notes text,                                   -- Notas
    created_at timestamp DEFAULT now(),           -- Fecha de creación
    updated_at timestamp DEFAULT now()            -- Fecha de actualización
);
```

### 5. **PROJECT_ASSIGNMENTS** - Asignaciones de Proyecto
```sql
CREATE TABLE project_assignments (
    id serial PRIMARY KEY,                         -- ID único
    project_id integer NOT NULL,                   -- FK a projects
    personnel_id integer NOT NULL,                 -- FK a personnel
    role text NOT NULL,                           -- lead, technician, specialist, supervisor
    assigned_date text,                           -- Fecha de asignación
    status text NOT NULL DEFAULT 'assigned',      -- assigned, confirmed, traveling, on_site, completed
    notes text,                                   -- Notas
    created_at timestamp DEFAULT now()            -- Fecha de creación
);
```

### 6. **CREWS** - Cuadrillas de Trabajo
```sql
CREATE TABLE crews (
    id serial PRIMARY KEY,                         -- ID único
    crew_name text NOT NULL,                       -- Nombre de la cuadrilla
    crew_code text NOT NULL UNIQUE,                -- Código único
    leader_id integer,                             -- FK a personnel (líder)
    specialization text NOT NULL,                  -- transformer_maintenance, electrical_repair, emergency_response
    max_capacity integer NOT NULL DEFAULT 6,       -- Capacidad máxima
    current_size integer NOT NULL DEFAULT 0,       -- Tamaño actual
    status text NOT NULL DEFAULT 'available',     -- available, assigned, maintenance, inactive
    base_location text NOT NULL,                   -- Ubicación base
    contact_phone text,                           -- Teléfono de contacto
    equipment text[],                             -- Array de equipos
    notes text,                                   -- Notas
    created_at timestamp DEFAULT now(),           -- Fecha de creación
    updated_at timestamp DEFAULT now()            -- Fecha de actualización
);
```

### 7. **CREW_MEMBERS** - Miembros de Cuadrilla
```sql
CREATE TABLE crew_members (
    id serial PRIMARY KEY,                         -- ID único
    crew_id integer NOT NULL,                      -- FK a crews
    personnel_id integer NOT NULL,                 -- FK a personnel
    role text NOT NULL,                           -- leader, technician, apprentice, driver, safety_officer
    assigned_date text NOT NULL,                  -- Fecha de asignación
    status text NOT NULL DEFAULT 'active',        -- active, temporary, inactive
    created_at timestamp DEFAULT now()            -- Fecha de creación
);
```

### 8. **WORK_ORDERS** - Órdenes de Trabajo
```sql
CREATE TABLE work_orders (
    id serial PRIMARY KEY,                         -- ID único
    order_number text NOT NULL UNIQUE,             -- Número de orden único
    title text NOT NULL,                          -- Título
    description text NOT NULL,                     -- Descripción
    work_type text NOT NULL,                      -- preventive_maintenance, emergency_repair, inspection, installation
    priority text NOT NULL DEFAULT 'medium',      -- low, medium, high, emergency
    status text NOT NULL DEFAULT 'pending',       -- pending, assigned, in_progress, completed, cancelled
    
    -- Detalles de ubicación
    facility_name text NOT NULL,                  -- Nombre de la instalación
    address text NOT NULL,                        -- Dirección
    city text NOT NULL,                          -- Ciudad
    state text NOT NULL,                         -- Estado
    zip_code text,                               -- Código postal
    latitude numeric,                            -- Latitud GPS
    longitude numeric,                           -- Longitud GPS
    
    -- Asignación
    assigned_crew_id integer,                    -- FK a crews
    assigned_date text,                          -- Fecha de asignación
    scheduled_date text,                         -- Fecha programada
    estimated_duration integer,                 -- Duración estimada (horas)
    
    -- Finalización
    started_at timestamp,                        -- Inicio real
    completed_at timestamp,                      -- Finalización real
    actual_duration integer,                     -- Duración real (horas)
    
    -- Contacto
    client_contact text,                         -- Contacto del cliente
    client_phone text,                          -- Teléfono del cliente
    emergency_contact text,                      -- Contacto de emergencia
    
    created_at timestamp DEFAULT now(),          -- Fecha de creación
    updated_at timestamp DEFAULT now()           -- Fecha de actualización
);
```

### 9. **WORK_ORDER_PHOTOS** - Fotos de Órdenes de Trabajo
```sql
CREATE TABLE work_order_photos (
    id serial PRIMARY KEY,                         -- ID único
    work_order_id integer NOT NULL,               -- FK a work_orders
    photo_type text NOT NULL,                     -- before, during, after, issue, equipment, safety
    file_path text NOT NULL,                      -- Ruta del archivo
    file_name text NOT NULL,                      -- Nombre del archivo
    file_size integer,                           -- Tamaño del archivo
    mime_type text,                              -- Tipo MIME
    description text,                            -- Descripción
    taken_at timestamp DEFAULT now(),            -- Fecha de captura
    gps_latitude numeric,                        -- Latitud GPS
    gps_longitude numeric,                       -- Longitud GPS
    taken_by integer,                            -- FK a personnel
    has_watermark boolean DEFAULT false,         -- Tiene marca de agua
    watermark_text text,                         -- Texto de marca de agua
    original_file_path text,                     -- Ruta original (sin marca de agua)
    created_at timestamp DEFAULT now()           -- Fecha de creación
);
```

### 10. **WORK_ORDER_STEPS** - Pasos de Órdenes de Trabajo
```sql
CREATE TABLE work_order_steps (
    id serial PRIMARY KEY,                         -- ID único
    work_order_id integer NOT NULL,               -- FK a work_orders
    step_number integer NOT NULL,                 -- Número del paso
    step_title text NOT NULL,                     -- Título del paso
    step_description text NOT NULL,               -- Descripción del paso
    status text NOT NULL DEFAULT 'pending',       -- pending, in_progress, completed, skipped
    started_at timestamp,                         -- Inicio del paso
    completed_at timestamp,                       -- Finalización del paso
    completed_by integer,                         -- FK a personnel
    requires_photo boolean DEFAULT false,         -- Requiere foto
    requires_signature boolean DEFAULT false,     -- Requiere firma
    requires_approval boolean DEFAULT false,      -- Requiere aprobación
    notes text,                                  -- Notas
    verification_data text,                      -- Datos de verificación (JSON)
    created_at timestamp DEFAULT now()           -- Fecha de creación
);
```

### 11. **TRANSFORMERS** - Inventario de Transformadores
```sql
CREATE TABLE transformers (
    id serial PRIMARY KEY,                         -- ID único
    serial_number character varying NOT NULL UNIQUE, -- Número de serie
    model character varying NOT NULL,              -- Modelo
    manufacturer character varying NOT NULL,        -- Fabricante
    voltage_rating character varying NOT NULL,      -- Voltaje nominal
    power_rating character varying NOT NULL,        -- Potencia nominal
    installation_date date,                        -- Fecha de instalación
    location character varying NOT NULL,            -- Ubicación
    status character varying NOT NULL DEFAULT 'active', -- active, maintenance, decommissioned
    last_maintenance_date date,                    -- Última fecha de mantenimiento
    next_maintenance_date date,                    -- Próxima fecha de mantenimiento
    notes text,                                   -- Notas
    created_at timestamp DEFAULT now(),           -- Fecha de creación
    updated_at timestamp DEFAULT now()            -- Fecha de actualización
);
```

### 12. **PROCEDURE_CATALOG** - Catálogo de Procedimientos
```sql
CREATE TABLE procedure_catalog (
    id serial PRIMARY KEY,                         -- ID único
    title character varying NOT NULL,              -- Título del procedimiento
    description text NOT NULL,                     -- Descripción
    category character varying NOT NULL,           -- maintenance, repair, inspection
    difficulty_level character varying NOT NULL DEFAULT 'intermediate', -- beginner, intermediate, advanced
    estimated_duration_minutes integer NOT NULL DEFAULT 60, -- Duración estimada
    safety_requirements text,                     -- Requisitos de seguridad
    tools_required text,                          -- Herramientas requeridas
    steps text NOT NULL,                          -- Pasos del procedimiento
    precautions text,                             -- Precauciones
    is_active boolean DEFAULT true,               -- Procedimiento activo
    created_at timestamp DEFAULT now(),           -- Fecha de creación
    updated_at timestamp DEFAULT now()            -- Fecha de actualización
);
```

### 13. **TRANSFORMER_PROCEDURES** - Procedimientos Aplicados a Transformadores
```sql
CREATE TABLE transformer_procedures (
    id serial PRIMARY KEY,                         -- ID único
    work_order_id integer NOT NULL REFERENCES work_orders(id), -- FK a work_orders
    transformer_id integer NOT NULL REFERENCES transformers(id), -- FK a transformers
    procedure_id integer NOT NULL REFERENCES procedure_catalog(id), -- FK a procedure_catalog
    status character varying NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    started_at timestamp,                         -- Inicio del procedimiento
    completed_at timestamp,                       -- Finalización del procedimiento
    notes text,                                  -- Notas
    created_at timestamp DEFAULT now()           -- Fecha de creación
);
```

### 14. **TRANSFORMER_PROCEDURE_PHOTOS** - Fotos de Procedimientos de Transformadores
```sql
CREATE TABLE transformer_procedure_photos (
    id serial PRIMARY KEY,                         -- ID único
    transformer_procedure_id integer NOT NULL REFERENCES transformer_procedures(id), -- FK a transformer_procedures
    photo_url character varying NOT NULL,          -- URL de la foto
    description text,                             -- Descripción
    taken_at timestamp DEFAULT now(),             -- Fecha de captura
    created_at timestamp DEFAULT now()            -- Fecha de creación
);
```

### 15. **WORK_ORDER_TRANSFORMERS** - Relación Órdenes-Transformadores
```sql
CREATE TABLE work_order_transformers (
    id serial PRIMARY KEY,                         -- ID único
    work_order_id integer NOT NULL REFERENCES work_orders(id), -- FK a work_orders
    transformer_id integer NOT NULL REFERENCES transformers(id), -- FK a transformers
    assigned_at timestamp DEFAULT now()           -- Fecha de asignación
);
```

### 16. **ROUTES** - Rutas Optimizadas
```sql
CREATE TABLE routes (
    id serial PRIMARY KEY,                         -- ID único
    route_name text NOT NULL,                      -- Nombre de la ruta
    crew_id integer NOT NULL,                      -- FK a crews
    route_date text NOT NULL,                     -- Fecha de la ruta
    status text NOT NULL DEFAULT 'planned',       -- planned, active, completed, cancelled
    total_distance numeric,                       -- Distancia total (km)
    estimated_travel_time integer,               -- Tiempo estimado (minutos)
    actual_travel_time integer,                  -- Tiempo real (minutos)
    fuel_estimate numeric,                       -- Combustible estimado (litros)
    work_order_sequence text[],                  -- Secuencia de órdenes de trabajo
    optimization_score numeric,                  -- Puntuación de optimización (0-100)
    start_location text,                         -- Ubicación de inicio
    end_location text,                          -- Ubicación de fin
    notes text,                                 -- Notas
    created_at timestamp DEFAULT now(),         -- Fecha de creación
    updated_at timestamp DEFAULT now()          -- Fecha de actualización
);
```

### 17. **SAFETY_EQUIPMENT** - Equipos de Seguridad
```sql
CREATE TABLE safety_equipment (
    id serial PRIMARY KEY,                         -- ID único
    personnel_id integer NOT NULL,                 -- FK a personnel
    equipment_type text NOT NULL,                 -- helmet, boots, harness, gloves
    brand text,                                   -- Marca
    model text,                                   -- Modelo
    serial_number text,                           -- Número de serie
    purchase_date text,                           -- Fecha de compra
    expiration_date text,                         -- Fecha de expiración
    condition text NOT NULL DEFAULT 'good',       -- good, fair, poor, needs_replacement
    last_inspection text,                         -- Última inspección
    next_inspection text,                         -- Próxima inspección
    status text NOT NULL DEFAULT 'active',        -- active, retired, lost, damaged
    notes text,                                   -- Notas
    created_at timestamp DEFAULT now()            -- Fecha de creación
);
```

### 18. **TRAINING** - Capacitación y Certificaciones
```sql
CREATE TABLE training (
    id serial PRIMARY KEY,                         -- ID único
    personnel_id integer NOT NULL,                 -- FK a personnel
    training_name text NOT NULL,                   -- Nombre de la capacitación
    training_type text NOT NULL,                   -- safety, technical, compliance, medical
    provider text,                                -- Proveedor
    completion_date text,                         -- Fecha de finalización
    expiration_date text,                         -- Fecha de expiración
    certificate_number text,                      -- Número de certificado
    status text NOT NULL DEFAULT 'active',        -- active, expired, pending_renewal
    file_path text,                              -- Ruta del archivo
    notes text,                                  -- Notas
    created_at timestamp DEFAULT now()           -- Fecha de creación
);
```

### 19. **ALERTS** - Alertas del Sistema
```sql
CREATE TABLE alerts (
    id serial PRIMARY KEY,                         -- ID único
    personnel_id integer,                          -- FK a personnel (opcional)
    alert_type text NOT NULL,                     -- document_expiring, certification_expiring, equipment_inspection, medical_due
    message text NOT NULL,                        -- Mensaje de la alerta
    severity text NOT NULL DEFAULT 'medium',      -- low, medium, high, critical
    related_id integer,                          -- ID relacionado
    related_type text,                           -- document, training, equipment
    due_date text,                               -- Fecha de vencimiento
    status text NOT NULL DEFAULT 'active',       -- active, acknowledged, resolved
    is_active boolean NOT NULL DEFAULT true,     -- Alerta activa
    created_at timestamp DEFAULT now(),          -- Fecha de creación
    updated_at timestamp DEFAULT now(),          -- Fecha de actualización
    acknowledged_at timestamp,                   -- Fecha de reconocimiento
    resolved_at timestamp                        -- Fecha de resolución
);
```

### 20. **SESSIONS** - Sesiones de Usuario (Autenticación)
```sql
CREATE TABLE sessions (
    sid character varying PRIMARY KEY,             -- ID de sesión
    sess jsonb NOT NULL,                          -- Datos de sesión (JSON)
    expire timestamp NOT NULL                     -- Fecha de expiración
);
CREATE INDEX IDX_session_expire ON sessions(expire);
```

---

## RELACIONES PRINCIPALES

### Relaciones de Clave Foránea (Foreign Keys)
- **transformer_procedure_photos.transformer_procedure_id** → **transformer_procedures.id**
- **transformer_procedures.work_order_id** → **work_orders.id**
- **transformer_procedures.transformer_id** → **transformers.id**
- **transformer_procedures.procedure_id** → **procedure_catalog.id**
- **work_order_transformers.work_order_id** → **work_orders.id**
- **work_order_transformers.transformer_id** → **transformers.id**

### Relaciones Implícitas (Sin FK, pero lógicamente relacionadas)
- **documents.personnel_id** → **personnel.id**
- **project_assignments.project_id** → **projects.id**
- **project_assignments.personnel_id** → **personnel.id**
- **crew_members.crew_id** → **crews.id**
- **crew_members.personnel_id** → **personnel.id**
- **work_orders.assigned_crew_id** → **crews.id**
- **work_order_photos.work_order_id** → **work_orders.id**
- **work_order_steps.work_order_id** → **work_orders.id**
- **routes.crew_id** → **crews.id**
- **safety_equipment.personnel_id** → **personnel.id**
- **training.personnel_id** → **personnel.id**
- **alerts.personnel_id** → **personnel.id**

---

## ÍNDICES Y OPTIMIZACIONES

### Índices Existentes
- **PRIMARY KEY** en todas las tablas con `id serial`
- **UNIQUE** en:
  - `users.email`
  - `personnel.employee_id`
  - `projects.project_code`
  - `crews.crew_code`
  - `work_orders.order_number`
  - `transformers.serial_number`
- **IDX_session_expire** en `sessions.expire`

### Índices Recomendados (No implementados)
```sql
-- Para mejorar rendimiento en consultas frecuentes
CREATE INDEX idx_documents_personnel_id ON documents(personnel_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_assigned_crew_id ON work_orders(assigned_crew_id);
CREATE INDEX idx_alerts_status ON alerts(status, is_active);
CREATE INDEX idx_personnel_status ON personnel(status);
```

---

## DATOS DE EJEMPLO EXISTENTES

### Personal (4+ registros)
- **PRSCU002**: Empleado con datos completos de ejemplo

### Cuadrillas (1+ registro)
- Cuadrilla especializada en mantenimiento de transformadores

### Usuarios del Sistema
- Usuarios autenticados via Replit Auth con roles definidos

---

## CARACTERÍSTICAS ESPECIALES

### 1. **Autenticación Integrada**
- Sistema de sesiones con PostgreSQL
- Integración con Replit Auth
- Roles de usuario: admin, manager, crew, viewer

### 2. **Gestión de Archivos**
- Almacenamiento de documentos con metadatos
- Sistema de marcas de agua para fotos
- Soporte para múltiples tipos MIME

### 3. **Geolocalización**
- Coordenadas GPS en órdenes de trabajo
- Tracking de ubicación en fotos
- Optimización de rutas

### 4. **Sistema de Alertas**
- Notificaciones automáticas por vencimientos
- Alertas de mantenimiento preventivo
- Gestión de estados de alerta

### 5. **Trazabilidad Completa**
- Timestamps de creación y actualización
- Historial de procedimientos aplicados
- Documentación fotográfica con metadatos

---

## TECNOLOGÍAS Y HERRAMIENTAS

- **Base de Datos**: PostgreSQL con Neon Database
- **ORM**: Drizzle ORM con TypeScript
- **Autenticación**: Replit Auth + PostgreSQL Sessions
- **Validación**: Zod schemas
- **Archivos**: Sistema de uploads con Sharp para procesamiento de imágenes

---

**Este documento representa la estructura completa de la base de datos del sistema PROSECU al 1 de Julio de 2025.**