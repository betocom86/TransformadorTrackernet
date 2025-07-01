// PROSECU - Layout principal con navegación
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  FolderOpenIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  MapIcon,
  CogIcon,
  BellIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  PowerIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Personal', href: '/personnel', icon: UsersIcon },
  { name: 'Proyectos', href: '/projects', icon: FolderOpenIcon },
  { name: 'Documentos', href: '/documents', icon: DocumentTextIcon },
  { name: 'Cuadrillas', href: '/crews', icon: TruckIcon },
  { name: 'Órdenes de Trabajo', href: '/work-orders', icon: ClipboardDocumentListIcon },
  { name: 'Rutas', href: '/routes', icon: MapIcon },
  { name: 'Transformadores', href: '/transformers', icon: CogIcon },
  { name: 'Alertas', href: '/alerts', icon: BellIcon },
  { name: 'Reportes', href: '/reports', icon: ChartBarIcon },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">PROSECU</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6 text-gray-400" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                  router.pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow-lg">
          <div className="flex h-16 shrink-0 items-center px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">PROSECU</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                  router.pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* User info at bottom */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {session?.user?.name?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.role}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                title="Cerrar sesión"
              >
                <PowerIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 shrink-0 bg-white shadow">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1" />
            
            {/* Right side of top bar */}
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications */}
              <button className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <BellIcon className="h-6 w-6" />
              </button>
              
              {/* User menu for mobile */}
              <div className="relative ml-3 lg:hidden">
                <button
                  onClick={() => signOut()}
                  className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {session?.user?.name?.charAt(0)}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}