# Instrucciones de Despliegue - PROSECU Personnel Management

## Repositorio del Proyecto
Este proyecto está listo para despliegue en VPS tradicional.

## Archivos principales para el despliegue:
- `server/production.js` - Servidor de producción optimizado
- `server/production-health.js` - Servidor de respaldo para health checks
- `dist/index.js` - Build compilado con todas las optimizaciones
- `package.json` - Dependencias y scripts
- `.env.example` - Variables de entorno necesarias

## Comando de despliegue en VPS:

```bash
# 1. Clonar el repositorio
git clone <URL-DE-TU-REPO> /var/www/prosecu
cd /var/www/prosecu

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
nano .env

# 4. Ejecutar migraciones de base de datos
npm run db:push

# 5. Construir aplicación (opcional, ya incluido)
npm run build

# 6. Iniciar con PM2
pm2 start server/production.js --name prosecu-personnel
```

## Variables de entorno requeridas (.env):

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://prosecu_user:password@localhost:5432/prosecu_db
SESSION_SECRET=clave-super-secreta-de-al-menos-32-caracteres
HOST=0.0.0.0
```

## Verificación de health checks:
- `/` - Health check principal
- `/health` - Estado del servidor
- `/api/health` - Información detallada
- `/api/ready` - Confirmación de disponibilidad

Todos los endpoints responden en menos de 5ms.