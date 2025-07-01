// PROSECU - Página principal (Dashboard)
import { useSession, signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import DashboardStats from '../components/DashboardStats'
import AlertsList from '../components/AlertsList'
import RecentActivity from '../components/RecentActivity'

export default function Home() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState({})
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      loadDashboardData()
    }
  }, [session])

  const loadDashboardData = async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/alerts')
      ])

      const statsData = await statsRes.json()
      const alertsData = await alertsRes.json()

      setStats(statsData)
      setAlerts(alertsData)
      setLoading(false)
    } catch (error) {
      console.error('Error cargando dashboard:', error)
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">PROSECU</h1>
          <p className="text-gray-600 mb-6">
            Sistema de Gestión de Personal para Mantenimiento de Transformadores
          </p>
          <button
            onClick={() => signIn()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Iniciar Sesión
          </button>
          <div className="mt-4 text-sm text-gray-500">
            <p>Usuario: admin</p>
            <p>Contraseña: admin123</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Bienvenido, {session.user.name}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Última actualización: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Statistics Cards */}
        <DashboardStats stats={stats} loading={loading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alerts Column */}
          <div className="lg:col-span-2">
            <AlertsList alerts={alerts} onRefresh={loadDashboardData} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RecentActivity />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                  <div className="font-medium">Nueva Orden de Trabajo</div>
                  <div className="text-sm text-gray-500">Crear nueva solicitud</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                  <div className="font-medium">Agregar Personal</div>
                  <div className="text-sm text-gray-500">Registrar empleado</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                  <div className="font-medium">Generar Reporte</div>
                  <div className="text-sm text-gray-500">Exportar datos</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}