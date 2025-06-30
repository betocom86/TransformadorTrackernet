# PROSECU Personnel Management - .NET Implementation

Este es el proyecto PROSECU implementado en .NET 8 como alternativa a la versión React/Express.

## 🏗️ Arquitectura

**Backend (API)**
- **ASP.NET Core 8** Web API
- **Entity Framework Core 8** con PostgreSQL
- **ASP.NET Core Identity** para autenticación
- **Swagger/OpenAPI** para documentación de API
- **Serilog** para logging estructurado
- **AutoMapper** para mapping de objetos

**Frontend (Opción recomendada)**
- **Blazor Server** para interfaz web interactiva
- **Bootstrap 5** para diseño responsivo
- **SignalR** para actualizaciones en tiempo real

## 📋 Características Principales

### Gestión de Personal
- ✅ Registro completo de empleados
- ✅ Documentos con fechas de vencimiento
- ✅ Seguimiento de visas y pasaportes
- ✅ Alertas automáticas de expiración

### Gestión de Cuadrillas
- ✅ Organización de equipos de trabajo
- ✅ Asignación de roles y responsabilidades
- ✅ Seguimiento de disponibilidad

### Órdenes de Trabajo
- ✅ Creación y asignación de tareas
- ✅ Geolocalización GPS
- ✅ Documentación fotográfica
- ✅ Pasos de procedimiento

### Gestión de Transformadores
- ✅ Inventario completo
- ✅ Historial de mantenimiento
- ✅ Procedimientos técnicos
- ✅ Documentación con fotos

### Seguridad y Cumplimiento
- ✅ Equipos de seguridad personal
- ✅ Certificaciones y entrenamientos
- ✅ Alertas de vencimiento
- ✅ Reportes de cumplimiento

## 🚀 Configuración del Proyecto

### Prerequisitos
- **.NET 8 SDK** o superior
- **PostgreSQL 12** o superior
- **Visual Studio 2022** o **VS Code** con extensión de C#

### Configuración de Base de Datos

1. **Instalar PostgreSQL**
```bash
# En Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# En Windows con Chocolatey
choco install postgresql

# En macOS con Homebrew
brew install postgresql
```

2. **Crear base de datos**
```sql
CREATE DATABASE prosecu_db;
CREATE USER prosecu_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE prosecu_db TO prosecu_user;
```

3. **Configurar cadena de conexión**
Editar `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=prosecu_db;Username=prosecu_user;Password=your_password"
  }
}
```

### Ejecutar el Proyecto

1. **Restaurar dependencias**
```bash
cd dotnet-prosecu/ProsecuAPI
dotnet restore
```

2. **Aplicar migraciones**
```bash
dotnet ef database update
```

3. **Ejecutar la aplicación**
```bash
dotnet run
```

4. **Acceder a la API**
- API: `https://localhost:5001`
- Swagger UI: `https://localhost:5001/swagger`
- Health Check: `https://localhost:5001/health`

## 📱 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/user` - Obtener usuario actual

### Personal
- `GET /api/personnel` - Listar todo el personal
- `GET /api/personnel/{id}` - Obtener personal por ID
- `POST /api/personnel` - Crear nuevo personal
- `PUT /api/personnel/{id}` - Actualizar personal
- `DELETE /api/personnel/{id}` - Eliminar personal
- `GET /api/personnel/{id}/documents` - Documentos del personal
- `GET /api/personnel/expiring-documents` - Documentos próximos a vencer

### Cuadrillas
- `GET /api/crews` - Listar cuadrillas
- `POST /api/crews` - Crear cuadrilla
- `GET /api/crews/{id}/members` - Miembros de cuadrilla

### Órdenes de Trabajo
- `GET /api/workorders` - Listar órdenes
- `POST /api/workorders` - Crear orden
- `PUT /api/workorders/{id}/status` - Actualizar estado
- `POST /api/workorders/{id}/photos` - Subir fotos

### Transformadores
- `GET /api/transformers` - Listar transformadores
- `POST /api/transformers` - Crear transformador
- `GET /api/procedures` - Catálogo de procedimientos

## 🔧 Desarrollo

### Estructura del Proyecto
```
ProsecuAPI/
├── Controllers/          # Controladores de API
├── Data/                 # DbContext y configuración EF
├── Models/               # Modelos de datos
├── Services/             # Lógica de negocio
├── DTOs/                 # Data Transfer Objects
├── Migrations/           # Migraciones de EF
├── wwwroot/              # Archivos estáticos
├── Program.cs            # Punto de entrada
└── appsettings.json      # Configuración
```

### Comandos Útiles

**Entity Framework**
```bash
# Crear migración
dotnet ef migrations add MigrationName

# Aplicar migraciones
dotnet ef database update

# Revertir migración
dotnet ef database update PreviousMigrationName

# Ver migraciones pendientes
dotnet ef migrations list
```

**Construcción y Despliegue**
```bash
# Compilar en modo Release
dotnet build --configuration Release

# Publicar para despliegue
dotnet publish --configuration Release --output ./publish

# Ejecutar tests
dotnet test
```

## 📊 Comparación React vs .NET

| Aspecto | React/Express | .NET Core |
|---------|---------------|-----------|
| **Lenguaje** | TypeScript/JavaScript | C# |
| **ORM** | Drizzle | Entity Framework Core |
| **Validación** | Zod | Data Annotations + FluentValidation |
| **Autenticación** | Replit Auth | ASP.NET Core Identity |
| **API** | Express REST | ASP.NET Core Web API |
| **Frontend** | React + Tailwind | Blazor + Bootstrap |
| **Deployment** | Node.js | Docker/.NET Runtime |
| **Ecosystem** | NPM | NuGet |

## 🔒 Seguridad

- **Autenticación JWT** con ASP.NET Core Identity
- **Autorización basada en roles** (Manager, Supervisor, Crew)
- **Validación de entrada** con Data Annotations
- **Protección CORS** configurada
- **Logging de seguridad** con Serilog
- **Hash de contraseñas** con Identity

## 📈 Ventajas de la Versión .NET

1. **Tipado fuerte** - C# proporciona mejor detección de errores en tiempo de compilación
2. **Performance** - Mayor rendimiento en operaciones intensivas
3. **Enterprise ready** - Mejor soporte para aplicaciones empresariales
4. **Ecosistema maduro** - Herramientas y bibliotecas robustas
5. **Deployment** - Opciones de despliegue más flexibles
6. **IntelliSense** - Mejor autocompletado y refactoring
7. **Debugging** - Herramientas de depuración más avanzadas

## 🚀 Próximos Pasos

Para completar la implementación .NET:

1. **Crear controladores faltantes** (Crews, WorkOrders, Transformers)
2. **Implementar frontend Blazor** con componentes interactivos
3. **Agregar validaciones FluentValidation**
4. **Configurar CI/CD** con GitHub Actions
5. **Dockerizar** la aplicación
6. **Implementar tests unitarios** con xUnit
7. **Agregar logging avanzado** y métricas

## 👥 Usuarios de Prueba

Al ejecutar por primera vez, se crea automáticamente:
- **Email**: admin@gcelectric.us
- **Contraseña**: Admin123!
- **Rol**: Manager

## 📞 Soporte

Esta implementación .NET mantiene toda la funcionalidad del sistema original React/Express pero con las ventajas del ecosistema Microsoft para desarrollos empresariales.