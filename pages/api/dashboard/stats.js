// PROSECU - API para estadísticas del dashboard
import { PrismaClient } from '@prisma/client'
import { getSession } from 'next-auth/react'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getSession({ req })
    if (!session) {
      return res.status(401).json({ message: 'No autenticado' })
    }

    // Obtener estadísticas en paralelo
    const [
      totalPersonnel,
      totalCrews,
      activeWorkOrders,
      totalTransformers,
      activeProjects,
      pendingAlerts
    ] = await Promise.all([
      prisma.personnel.count({ where: { status: 'ACTIVE' } }),
      prisma.crew.count(),
      prisma.workOrder.count({ where: { status: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] } } }),
      prisma.transformer.count({ where: { status: 'OPERATIONAL' } }),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.alert.count({ where: { status: 'ACTIVE' } })
    ])

    const stats = {
      totalPersonnel: totalPersonnel.toString(),
      totalCrews: totalCrews.toString(),
      activeWorkOrders: activeWorkOrders.toString(),
      totalTransformers: totalTransformers.toString(),
      activeProjects: activeProjects.toString(),
      pendingAlerts: pendingAlerts.toString()
    }

    res.status(200).json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  } finally {
    await prisma.$disconnect()
  }
}