// PROSECU - Componente de estadísticas del dashboard
import { UsersIcon, FolderOpenIcon, ClipboardDocumentListIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function DashboardStats({ stats, loading }) {
  const statItems = [
    {
      name: 'Personal Total',
      stat: stats.totalPersonnel || '0',
      icon: UsersIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Proyectos Activos',
      stat: stats.activeProjects || '0',
      icon: FolderOpenIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Órdenes de Trabajo',
      stat: stats.activeWorkOrders || '0',
      icon: ClipboardDocumentListIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Alertas Pendientes',
      stat: stats.pendingAlerts || '0',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`${item.color} rounded-md p-3`}>
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </dt>
                  <dd className="text-3xl font-bold text-gray-900">
                    {item.stat}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}