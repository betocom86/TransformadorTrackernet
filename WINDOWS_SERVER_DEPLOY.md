# Guía de Despliegue PROSECU en Windows Server 2022

## Resumen del Sistema
PROSECU es un sistema completo de gestión de personal para operaciones de mantenimiento de transformadores eléctricos, desarrollado para GC Electric con arquitectura full-stack usando React, Express, PostgreSQL y TypeScript.

## Requisitos del Sistema

### Hardware Mínimo
- **CPU**: 4 núcleos, 2.4 GHz
- **RAM**: 8 GB (16 GB recomendado)
- **Almacenamiento**: 100 GB SSD
- **Red**: Conexión estable a Internet

### Software Base
- **Sistema Operativo**: Windows Server 2022
- **Node.js**: Versión 18.x o superior
- **PostgreSQL**: Versión 14.x o superior
- **IIS**: Internet Information Services
- **PM2**: Gestor de procesos Node.js

## Paso 1: Preparación del Servidor

### 1.1 Actualizar Windows Server
```powershell
# Ejecutar como Administrador
Install-Module PSWindowsUpdate
Get-WUInstall -AcceptAll -AutoReboot
```

### 1.2 Instalar Chocolatey (Gestor de Paquetes)
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### 1.3 Instalar Git
```powershell
choco install git -y
```

## Paso 2: Instalación de Node.js

### 2.1 Instalar Node.js LTS
```powershell
choco install nodejs-lts -y
# Verificar instalación
node --version
npm --version
```

### 2.2 Configurar npm para producción
```powershell
npm config set registry https://registry.npmjs.org/
npm install -g npm@latest
```

## Paso 3: Instalación y Configuración de PostgreSQL

### 3.1 Instalar PostgreSQL
```powershell
choco install postgresql14 -y --params '/Password:TuPasswordSegura123'
```

### 3.2 Configurar PostgreSQL
1. **Iniciar servicio PostgreSQL**:
```powershell
Start-Service postgresql-x64-14
Set-Service -Name postgresql-x64-14 -StartupType Automatic
```

2. **Crear base de datos**:
```sql
-- Conectar como postgres
psql -U postgres

-- Crear base de datos
CREATE DATABASE prosecu_db;

-- Crear usuario de aplicación
CREATE USER prosecu_user WITH PASSWORD 'password_segura_123';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE prosecu_db TO prosecu_user;
ALTER USER prosecu_user CREATEDB;

\q
```

### 3.3 Configurar acceso remoto (opcional)
Editar `C:\Program Files\PostgreSQL\14\data\postgresql.conf`:
```
listen_addresses = '*'
port = 5432
```

Editar `C:\Program Files\PostgreSQL\14\data\pg_hba.conf`:
```
host    all             all             0.0.0.0/0               md5
```

Reiniciar servicio:
```powershell
Restart-Service postgresql-x64-14
```

## Paso 4: Despliegue de la Aplicación

### 4.1 Crear directorio de aplicación
```powershell
mkdir C:\inetpub\prosecu
cd C:\inetpub\prosecu
```

### 4.2 Clonar repositorio (o copiar archivos)
```powershell
# Si usas Git
git clone [URL_DEL_REPOSITORIO] .

# O copiar archivos manualmente desde tu proyecto local
```

### 4.3 Instalar dependencias
```powershell
npm install --production
```

### 4.4 Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://prosecu_user:password_segura_123@localhost:5432/prosecu_db
SESSION_SECRET=tu_session_secret_muy_seguro_aqui_2024
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

### 4.5 Construir aplicación
```powershell
npm run build
```

### 4.6 Configurar base de datos
```powershell
npm run db:push
```

## Paso 5: Instalar y Configurar PM2

### 5.1 Instalar PM2 globalmente
```powershell
npm install -g pm2
npm install -g pm2-windows-service
```

### 5.2 Crear archivo de configuración PM2
Crear `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'prosecu-app',
    script: 'dist/index.js',
    cwd: 'C:\\inetpub\\prosecu',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    log_file: 'C:\\inetpub\\prosecu\\logs\\combined.log',
    out_file: 'C:\\inetpub\\prosecu\\logs\\out.log',
    error_file: 'C:\\inetpub\\prosecu\\logs\\error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    max_memory_restart: '1G',
    restart_delay: 4000
  }]
};
```

### 5.3 Configurar PM2 como servicio de Windows
```powershell
# Crear directorio de logs
mkdir C:\inetpub\prosecu\logs

# Configurar PM2 como servicio
pm2-service-install -n PM2

# Iniciar aplicación
cd C:\inetpub\prosecu
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

## Paso 6: Configuración de IIS (Proxy Reverso)

### 6.1 Instalar IIS y módulos necesarios
```powershell
# Habilitar IIS
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpRedirect, IIS-ApplicationDevelopment, IIS-NetFxExtensibility45, IIS-HealthAndDiagnostics, IIS-HttpLogging, IIS-Security, IIS-RequestFiltering, IIS-Performance, IIS-WebServerManagementTools, IIS-ManagementConsole, IIS-IIS6ManagementCompatibility, IIS-Metabase

# Instalar URL Rewrite Module
choco install urlrewrite -y

# Instalar Application Request Routing
choco install iis-arr -y
```

### 6.2 Configurar sitio web en IIS
1. **Abrir IIS Manager**
2. **Crear nuevo sitio**:
   - Nombre: `PROSECU`
   - Ruta física: `C:\inetpub\prosecu\dist\public`
   - Puerto: `80` (HTTP) y `443` (HTTPS)

3. **Configurar URL Rewrite**:
Crear `web.config` en `C:\inetpub\prosecu\dist\public`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- Regla para API -->
        <rule name="API" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://localhost:5000/api/{R:1}" />
        </rule>
        <!-- Regla para archivos estáticos -->
        <rule name="Static Files" stopProcessing="true">
          <match url="^(css|js|images|fonts|uploads)/.*" />
          <action type="Rewrite" url="http://localhost:5000/{R:0}" />
        </rule>
        <!-- Regla para SPA -->
        <rule name="SPA" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <defaultDocument>
      <files>
        <clear />
        <add value="index.html" />
      </files>
    </defaultDocument>
  </system.webServer>
</configuration>
```

## Paso 7: Configuración de SSL/HTTPS

### 7.1 Generar certificado SSL (Let's Encrypt)
```powershell
# Instalar win-acme
choco install win-acme -y

# Generar certificado (ejecutar como Administrador)
wacs.exe --target iis --siteid 1 --installation iis
```

### 7.2 Configurar redirección HTTPS
Agregar a `web.config`:
```xml
<rule name="Redirect to HTTPS" stopProcessing="true">
  <match url=".*" />
  <conditions>
    <add input="{HTTPS}" pattern="off" ignoreCase="true" />
    <add input="{HTTP_HOST}" pattern="localhost" negate="true" />
  </conditions>
  <action type="Redirect" url="https://{HTTP_HOST}/{R:0}" redirectType="Permanent" />
</rule>
```

## Paso 8: Configuración del Firewall

### 8.1 Configurar Windows Firewall
```powershell
# Permitir puerto 80 (HTTP)
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Permitir puerto 443 (HTTPS)
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# Permitir puerto 5000 (Node.js) solo localmente
New-NetFirewallRule -DisplayName "Node.js Local" -Direction Inbound -Protocol TCP -LocalPort 5000 -RemoteAddress 127.0.0.1 -Action Allow

# Permitir PostgreSQL (solo si necesitas acceso remoto)
New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow
```

## Paso 9: Configuración de Seguridad

### 9.1 Configurar permisos de carpetas
```powershell
# Dar permisos a IIS_IUSRS
icacls "C:\inetpub\prosecu" /grant IIS_IUSRS:(OI)(CI)F /T

# Configurar permisos específicos para uploads
icacls "C:\inetpub\prosecu\uploads" /grant IIS_IUSRS:(OI)(CI)F /T
```

### 9.2 Configurar Task Scheduler para backups
```powershell
# Crear script de backup
$backupScript = @"
@echo off
set BACKUP_DIR=C:\Backups\PROSECU
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%
mkdir %BACKUP_DIR%\%DATE% 2>nul

pg_dump -U prosecu_user -h localhost prosecu_db > %BACKUP_DIR%\%DATE%\database.sql
xcopy "C:\inetpub\prosecu\uploads" "%BACKUP_DIR%\%DATE%\uploads\" /E /I /Y

forfiles /p %BACKUP_DIR% /d -7 /c "cmd /c rmdir /s /q @path"
"@

$backupScript | Out-File -FilePath "C:\Scripts\backup-prosecu.bat" -Encoding ASCII

# Crear tarea programada
schtasks /create /tn "PROSECU Backup" /tr "C:\Scripts\backup-prosecu.bat" /sc daily /st 02:00 /ru System
```

## Paso 10: Monitoreo y Mantenimiento

### 10.1 Configurar monitoreo con PM2
```powershell
# Ver estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs prosecu-app

# Reiniciar aplicación
pm2 restart prosecu-app

# Ver métricas
pm2 monit
```

### 10.2 Scripts de mantenimiento
Crear `maintenance.ps1`:
```powershell
# Script de mantenimiento diario
Write-Host "Iniciando mantenimiento PROSECU..."

# Limpiar logs antiguos
Get-ChildItem "C:\inetpub\prosecu\logs" -Name "*.log" | Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-30)} | Remove-Item

# Limpiar archivos temporales
Get-ChildItem $env:TEMP -Recurse | Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-7)} | Remove-Item -Force -Recurse

# Verificar estado de servicios
$services = @("postgresql-x64-14", "PM2")
foreach ($service in $services) {
    $status = Get-Service $service -ErrorAction SilentlyContinue
    if ($status.Status -ne "Running") {
        Start-Service $service
        Write-Host "Reiniciado servicio: $service"
    }
}

Write-Host "Mantenimiento completado."
```

## Paso 11: Verificación de Instalación

### 11.1 Verificar servicios
```powershell
# Verificar PostgreSQL
Get-Service postgresql-x64-14

# Verificar PM2
pm2 status

# Verificar IIS
Get-Service W3SVC
```

### 11.2 Probar aplicación
1. **Abrir navegador web**
2. **Navegar a**: `http://tu-servidor` o `https://tu-servidor`
3. **Verificar funcionalidades**:
   - Login/logout
   - Gestión de personal
   - Subida de documentos
   - Procedimientos de transformadores

## Paso 12: Configuración de Dominios y DNS

### 12.1 Configurar dominio personalizado
```powershell
# En el servidor DNS o en el proveedor de dominio
# Crear registro A: prosecu.tu-empresa.com -> IP_DEL_SERVIDOR
# Crear registro CNAME: www.prosecu.tu-empresa.com -> prosecu.tu-empresa.com
```

### 12.2 Actualizar IIS con dominio
1. **Abrir IIS Manager**
2. **Editar bindings del sitio**
3. **Agregar bindings para**:
   - `prosecu.tu-empresa.com` (puerto 80 y 443)
   - `www.prosecu.tu-empresa.com` (puerto 80 y 443)

## Solución de Problemas Comunes

### Problema: Aplicación no inicia
```powershell
# Verificar logs
pm2 logs prosecu-app --lines 100

# Verificar variables de entorno
pm2 env 0

# Reiniciar aplicación
pm2 restart prosecu-app
```

### Problema: Error de base de datos
```powershell
# Verificar conexión a PostgreSQL
psql -U prosecu_user -h localhost -d prosecu_db

# Verificar servicios
Get-Service postgresql-x64-14
```

### Problema: Archivos no se suben
```powershell
# Verificar permisos de carpeta uploads
icacls "C:\inetpub\prosecu\uploads"

# Verificar espacio en disco
Get-WmiObject -Class Win32_LogicalDisk | Select-Object Size,FreeSpace,DeviceID
```

## Configuración Avanzada

### Balanceador de Carga (opcional)
Para múltiples servidores, configurar ARR en IIS:
```xml
<webFarm name="prosecuFarm">
  <server address="192.168.1.100" enabled="true" />
  <server address="192.168.1.101" enabled="true" />
</webFarm>
```

### Monitoreo con New Relic o similar
```powershell
# Instalar agente de New Relic
npm install newrelic
```

### Cache con Redis (opcional)
```powershell
# Instalar Redis
choco install redis-64 -y

# Configurar en la aplicación
npm install redis connect-redis
```

## Contacto y Soporte

Para problemas técnicos o soporte adicional:
- **Documentación del proyecto**: Ver `replit.md`
- **Logs de aplicación**: `C:\inetpub\prosecu\logs\`
- **Logs de sistema**: Event Viewer de Windows

---

**Nota**: Esta guía asume experiencia básica con Windows Server y administración de sistemas. Siempre realiza backups antes de hacer cambios en producción.