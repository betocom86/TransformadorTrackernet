// PROSECU - API para gestión de personal
import { PrismaClient } from '@prisma/client'
import { getSession } from 'next-auth/react'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  try {
    const session = await getSession({ req })
    if (!session) {
      return res.status(401).json({ message: 'No autenticado' })
    }

    switch (req.method) {
      case 'GET':
        return await getPersonnel(req, res)
      case 'POST':
        return await createPersonnel(req, res)
      case 'PUT':
        return await updatePersonnel(req, res)
      case 'DELETE':
        return await deletePersonnel(req, res)
      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in personnel API:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  } finally {
    await prisma.$disconnect()
  }
}

async function getPersonnel(req, res) {
  const { search, status, department } = req.query

  const where = {}

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { employeeId: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (status) {
    where.status = status
  }

  if (department) {
    where.department = department
  }

  const personnel = await prisma.personnel.findMany({
    where,
    include: {
      documents: {
        where: { status: 'ACTIVE' },
        select: { id: true, documentType: true, expirationDate: true }
      },
      training: {
        where: { status: 'COMPLETED' },
        select: { id: true, title: true, expirationDate: true }
      },
      projects: {
        include: {
          project: {
            select: { id: true, projectName: true, status: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  res.status(200).json(personnel)
}

async function createPersonnel(req, res) {
  const {
    employeeId,
    fullName,
    firstName,
    lastName,
    position,
    department,
    email,
    phone,
    address,
    city,
    state,
    zipCode,
    hireDate,
    birthDate
  } = req.body

  // Validar campos requeridos
  if (!employeeId || !fullName || !position) {
    return res.status(400).json({ 
      message: 'Campos requeridos: employeeId, fullName, position' 
    })
  }

  // Verificar que el employeeId no exista
  const existingPersonnel = await prisma.personnel.findUnique({
    where: { employeeId }
  })

  if (existingPersonnel) {
    return res.status(409).json({ 
      message: 'El ID de empleado ya existe' 
    })
  }

  const personnel = await prisma.personnel.create({
    data: {
      employeeId,
      fullName,
      firstName,
      lastName,
      position,
      department,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      hireDate: hireDate ? new Date(hireDate) : null,
      birthDate: birthDate ? new Date(birthDate) : null,
      status: 'ACTIVE'
    }
  })

  res.status(201).json(personnel)
}

async function updatePersonnel(req, res) {
  const { id } = req.query
  const updateData = { ...req.body }

  // Convertir fechas si están presentes
  if (updateData.hireDate) {
    updateData.hireDate = new Date(updateData.hireDate)
  }
  if (updateData.birthDate) {
    updateData.birthDate = new Date(updateData.birthDate)
  }

  const personnel = await prisma.personnel.update({
    where: { id: parseInt(id) },
    data: updateData
  })

  res.status(200).json(personnel)
}

async function deletePersonnel(req, res) {
  const { id } = req.query

  await prisma.personnel.delete({
    where: { id: parseInt(id) }
  })

  res.status(204).end()
}