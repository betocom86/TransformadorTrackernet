# PROSECU - Guía de Deployment con Node.js Stack

## Stack Seleccionado: Node.js + PostgreSQL + Vercel/Railway

### Por qué este stack es ideal para PROSECU:
- **Desarrollo rápido**: JavaScript en frontend y backend
- **Costos bajos**: Hosting gratuito/económico disponible
- **Flexibilidad**: Fácil adaptación a cambios de requisitos
- **Ecosistema**: Gran cantidad de librerías y herramientas

---

## 🚀 **OPCIÓN 1: DEPLOYMENT EN VERCEL**

### **Configuración del Proyecto**
```json
// package.json
{
  "name": "prosecu-app",
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0"
  }
}
```

### **Base de Datos: Neon PostgreSQL**
```bash
# 1. Crear cuenta en neon.tech (gratis)
# 2. Crear base de datos
# 3. Obtener connection string
```

### **Variables de Entorno (.env.local)**
```env
DATABASE_URL="postgresql://user:pass@host:5432/prosecu"
NEXTAUTH_SECRET="tu-secret-key"
NEXTAUTH_URL="https://tu-app.vercel.app"
```

### **Deployment en Vercel**
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login en Vercel  
vercel login

# 3. Deploy
vercel --prod
```

---

## 🚀 **OPCIÓN 2: DEPLOYMENT EN RAILWAY**

### **Ventajas de Railway**
- Base de datos PostgreSQL incluida
- Variables de entorno automáticas
- Logs en tiempo real
- Más control sobre el servidor

### **Setup en Railway**
```bash
# 1. Crear cuenta en railway.app
# 2. Conectar repositorio GitHub
# 3. Railway detecta automáticamente Node.js
# 4. Agrega PostgreSQL addon
```

### **Configuración Railway**
```json
// railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

## 📦 **ESTRUCTURA RECOMENDADA PARA DEPLOYMENT**

### **Opción A: Next.js (Full-Stack)**
```
prosecu-app/
├── pages/
│   ├── api/            # Backend APIs
│   ├── dashboard.js    # Dashboard page
│   ├── personnel.js    # Personal page
│   └── index.js        # Home page
├── components/         # React components
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.js         # Sample data
├── public/             # Static files
└── package.json
```

### **Opción B: Separado Frontend/Backend**
```
prosecu/
├── frontend/           # React app
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/            # Express API
│   ├── routes/
│   ├── models/
│   └── package.json
└── database/
    └── schema.sql
```

---

## 🔧 **CONFIGURACIÓN DE BASE DE DATOS**

### **Schema con Prisma (Recomendado)**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Personnel {
  id         Int      @id @default(autoincrement())
  employeeId String   @unique
  fullName   String
  position   String
  email      String?
  phone      String?
  status     String   @default("active")
  createdAt  DateTime @default(now())
  
  // Relations
  projects   ProjectAssignment[]
  documents  Document[]
}

model Project {
  id          Int      @id @default(autoincrement())
  projectName String
  projectCode String   @unique
  status      String   @default("planning")
  startDate   DateTime
  endDate     DateTime?
  createdAt   DateTime @default(now())
  
  // Relations
  assignments ProjectAssignment[]
}

model ProjectAssignment {
  id          Int @id @default(autoincrement())
  personnelId Int
  projectId   Int
  role        String
  assignedAt  DateTime @default(now())
  
  // Relations
  personnel   Personnel @relation(fields: [personnelId], references: [id])
  project     Project   @relation(fields: [projectId], references: [id])
}
```

### **Comandos de Setup**
```bash
# Instalar Prisma
npm install prisma @prisma/client

# Generar cliente
npx prisma generate

# Aplicar schema
npx prisma db push

# Seed data (opcional)
npx prisma db seed
```

---

## 📱 **FRONTEND COMPONENTS**

### **Dashboard Component**
```jsx
// components/Dashboard.js
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [stats, setStats] = useState({})
  
  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(setStats)
  }, [])
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3>Personal Total</h3>
        <p className="text-3xl font-bold">{stats.totalPersonnel}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3>Proyectos Activos</h3>
        <p className="text-3xl font-bold">{stats.activeProjects}</p>
      </div>
      {/* Más cards... */}
    </div>
  )
}
```

### **Personnel List Component**
```jsx
// components/PersonnelList.js
import { useState, useEffect } from 'react'

export default function PersonnelList() {
  const [personnel, setPersonnel] = useState([])
  
  useEffect(() => {
    fetch('/api/personnel')
      .then(res => res.json())
      .then(setPersonnel)
  }, [])
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {personnel.map((person) => (
          <li key={person.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium">{person.fullName}</p>
                <p className="text-sm text-gray-500">{person.position}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                person.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {person.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 🔐 **AUTENTICACIÓN**

### **Con NextAuth.js**
```bash
npm install next-auth
```

```jsx
// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Validar credenciales aquí
        if (credentials.username === 'admin' && credentials.password === 'admin123') {
          return {
            id: 1,
            name: 'Administrador',
            email: 'admin@prosecu.com',
            role: 'manager'
          }
        }
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  }
})
```

---

## 💰 **COSTOS ESTIMADOS**

### **Vercel + Neon (Gratis para empezar)**
- Vercel Hobby: $0/mes (límites generosos)
- Neon Free Tier: $0/mes (1GB storage)
- **Total: $0/mes** para empezar

### **Railway (Paid but simple)**
- Railway Starter: $5/mes
- PostgreSQL incluido
- **Total: $5/mes** todo incluido

### **Escalamiento**
- 1,000 usuarios: ~$20-50/mes
- 10,000 usuarios: ~$100-200/mes
- 50,000+ usuarios: ~$500+/mes

---

## ✅ **CHECKLIST DE DEPLOYMENT**

### **Antes del Deploy**
- [ ] Schema de base de datos definido
- [ ] Variables de entorno configuradas
- [ ] Tests básicos funcionando
- [ ] Build exitoso localmente

### **Deploy Process**
- [ ] Crear base de datos en Neon/Railway
- [ ] Subir código a GitHub
- [ ] Conectar GitHub con Vercel/Railway
- [ ] Configurar variables de entorno
- [ ] Ejecutar primera migración
- [ ] Verificar que la app funciona

### **Post-Deploy**
- [ ] Configurar dominio personalizado
- [ ] Setup de backups automáticos
- [ ] Monitoreo de errores
- [ ] SSL habilitado
- [ ] Performance monitoring

Este stack te dará una aplicación moderna, escalable y económica, perfecta para el crecimiento de PROSECU.