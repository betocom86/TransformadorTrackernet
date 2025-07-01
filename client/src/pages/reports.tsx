import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, FileText, Users, AlertTriangle, Wrench } from "lucide-react";

export default function Reports() {
  const { data: dashboardStats = {} } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: personnel = [] } = useQuery({
    queryKey: ["/api/personnel"],
  });

  const { data: crews = [] } = useQuery({
    queryKey: ["/api/crews"],
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: ["/api/work-orders"],
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const generateReport = (reportType: string) => {
    console.log(`Generando reporte: ${reportType}`);
    // Aquí iría la lógica para generar reportes
  };

  const reportCards = [
    {
      title: "Reporte de Personal",
      description: "Información detallada de todo el personal",
      icon: Users,
      stats: `${Array.isArray(personnel) ? personnel.length : 0} empleados`,
      reportType: "personnel"
    },
    {
      title: "Reporte de Equipos",
      description: "Estado y asignaciones de equipos de trabajo",
      icon: Wrench,
      stats: `${Array.isArray(crews) ? crews.length : 0} equipos`,
      reportType: "crews"
    },
    {
      title: "Reporte de Órdenes de Trabajo",
      description: "Historial y estado de todas las órdenes",
      icon: FileText,
      stats: `${Array.isArray(workOrders) ? workOrders.length : 0} órdenes`,
      reportType: "work-orders"
    },
    {
      title: "Reporte de Alertas",
      description: "Análisis de alertas y incidentes",
      icon: AlertTriangle,
      stats: `${Array.isArray(alerts) ? alerts.length : 0} alertas`,
      reportType: "alerts"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Centro de Reportes</h1>
          <p className="text-gray-600 mt-2">
            Genere y descargue reportes detallados del sistema
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4" />
          <span>Dashboard Ejecutivo</span>
        </Button>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Personal</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalPersonnel || 0}</div>
            <p className="text-xs text-muted-foreground">empleados activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipos Activos</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalCrews || 0}</div>
            <p className="text-xs text-muted-foreground">equipos de trabajo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalWorkOrders || 0}</div>
            <p className="text-xs text-muted-foreground">órdenes de trabajo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.complianceRate || 0}%</div>
            <p className="text-xs text-muted-foreground">tasa de cumplimiento</p>
          </CardContent>
        </Card>
      </div>

      {/* Reportes Disponibles */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reportes Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportCards.map((report) => {
            const IconComponent = report.icon;
            
            return (
              <Card key={report.reportType} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{report.stats}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => generateReport(report.reportType)}
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Descargar PDF</span>
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => generateReport(`${report.reportType}-excel`)}
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Descargar Excel</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Reportes Programados */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reportes Programados</h2>
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Reportes Automáticos</CardTitle>
            <CardDescription>
              Configure reportes para generarse automáticamente en intervalos regulares
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Reporte Semanal de Personal</h3>
                  <p className="text-sm text-gray-600">Enviado cada lunes a las 8:00 AM</p>
                </div>
                <Badge variant="outline">Activo</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Reporte Mensual de Cumplimiento</h3>
                  <p className="text-sm text-gray-600">Enviado el primer día de cada mes</p>
                </div>
                <Badge variant="outline">Activo</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Reporte de Alertas Críticas</h3>
                  <p className="text-sm text-gray-600">Enviado inmediatamente cuando ocurren</p>
                </div>
                <Badge variant="outline">Activo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}