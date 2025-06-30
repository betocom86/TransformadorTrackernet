import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Clock,
  UserCheck,
  Briefcase,
  Plus,
  Filter,
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  UserPlus,
  FileUp,
  CalendarPlus,
  FileText,
  ClipboardCheck,
  Bell,
  Search,
  Settings,
} from "lucide-react";
import { cn, formatDate, getStatusColor, getStatusText } from "@/lib/utils";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/alerts?active=true'],
  });

  const { data: personnel = [], isLoading: personnelLoading } = useQuery({
    queryKey: ['/api/personnel'],
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects?active=true'],
  });

  const recentAlerts = alerts.slice(0, 3);
  const personnelSample = personnel.slice(0, 3);
  const activeProjects = projects.slice(0, 3);

  const quickActions = [
    { icon: UserPlus, label: "Agregar Personal", action: "add-personnel" },
    { icon: FileUp, label: "Subir Documentos", action: "upload-docs" },
    { icon: CalendarPlus, label: "Nuevo Proyecto", action: "new-project" },
    { icon: FileText, label: "Generar Reporte", action: "generate-report" },
    { icon: ClipboardCheck, label: "Lista de Verificación", action: "checklist" },
    { icon: Bell, label: "Configurar Alertas", action: "configure-alerts" },
    { icon: Search, label: "Buscar Personal", action: "search-personnel" },
    { icon: Settings, label: "Configuración", action: "settings" },
  ];

  if (statsLoading || alertsLoading || personnelLoading || projectsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Dashboard - Resumen General
        </h2>
        <div className="flex space-x-2">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proyecto
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Documentos Vencidos
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.expiredDocs || 0}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Por Vencer (30 días)
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.expiringSoon || 0}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Renovar pronto</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Personal Disponible
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.availableStaff || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Listos para asignar</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Proyectos Activos
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.activeProjects || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              En Texas y otros estados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Alertas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAlerts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay alertas activas
              </p>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-center p-4 rounded-lg border",
                    alert.severity === "critical" && "bg-red-50 border-red-200",
                    alert.severity === "high" && "bg-orange-50 border-orange-200",
                    alert.severity === "medium" && "bg-yellow-50 border-yellow-200",
                    alert.severity === "low" && "bg-blue-50 border-blue-200"
                  )}
                >
                  <div className="flex-shrink-0">
                    {alert.severity === "critical" && (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    {alert.severity === "medium" && (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    {alert.severity === "low" && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(alert.createdAt?.toString())}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button variant="ghost" size="sm" className="text-primary">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Personnel Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personal - Estado de Documentos</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver Todos
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Personal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {personnelSample.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                        No hay personal registrado
                      </td>
                    </tr>
                  ) : (
                    personnelSample.map((person) => (
                      <tr key={person.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {person.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {person.position}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={getStatusColor(person.status)}
                            variant="secondary"
                          >
                            {getStatusText(person.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Proyectos Activos</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              Gestionar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay proyectos activos
                </p>
              ) : (
                activeProjects.map((project) => (
                  <div
                    key={project.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-800">
                        {project.projectName}
                      </h4>
                      <Badge
                        className={getStatusColor(project.status)}
                        variant="secondary"
                      >
                        {getStatusText(project.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <MapPin className="inline w-4 h-4 mr-2 text-gray-400" />
                      {project.location}, {project.state}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>
                          {formatDate(project.startDate)} - {formatDate(project.endDate)}
                        </span>
                      </div>
                    </div>
                    {project.status === "planning" && (
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" className="text-xs">
                          Asignar Personal
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          Ver Detalles
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.action}
                      variant="outline"
                      className="flex flex-col items-center p-4 h-auto space-y-2 hover:bg-gray-50"
                    >
                      <Icon className="h-6 w-6 text-primary" />
                      <span className="text-sm font-medium text-gray-700">
                        {action.label}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">
                    Documentos Vigentes
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-800">89%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Certificaciones</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">76%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">Seguros Médicos</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">92%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-700">
                    Equipo de Seguridad
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-800">84%</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-primary font-medium mb-2">
                Próxima Auditoría
              </p>
              <p className="text-xs text-gray-600">
                Programada para el 15 de Abril, 2024
              </p>
              <Button size="sm" className="mt-3 text-xs">
                Preparar Documentos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
