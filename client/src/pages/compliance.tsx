import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Shield, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { Personnel } from "@shared/schema";

// Compliance checklist items based on the provided image
const complianceChecklist = [
  {
    category: "Protección, Seguridad y Cuidado",
    items: [
      { id: 1, description: "Monitoreo de vigencia de pasaportes", required: true, critical: true },
      { id: 2, description: "Monitoreo de vigencia de visas", required: true, critical: true },
      { id: 3, description: "Monitoreo de vigencia de licencias de manejo", required: true, critical: false },
      { id: 4, description: "Tarjeta de telefonía y protocolo de emergencia", required: true, critical: false },
      { id: 5, description: "Vigencia de seguro de equipo", required: true, critical: false },
      { id: 6, description: "Monitoreo de seguros de camionetas", required: true, critical: false },
      { id: 7, description: "Matriz de riesgos y vencimientos todas las pólizas, ej. Workers, GMM, etc", required: true, critical: false },
      { id: 8, description: "Ubicación diaria de cuadrilla de cuadrillas, en casa o en hotel + teléfono", required: true, critical: false },
      { id: 9, description: "Seguimiento a lista en el extranjero", required: true, critical: false },
      { id: 10, description: "Cumplimiento a certificaciones para trabajar en USA, asegurar que todos cuentan con eso", required: true, critical: true },
      { id: 11, description: "Respeto a fechas de compromisos para todos los asuntos que se requieren por Dirección General", required: true, critical: false },
      { id: 12, description: "Cumplimiento en tiempo y forma programa de capacitación", required: true, critical: false },
      { id: 13, description: "Manejo médico, seguros, visas, Cuadrillas", required: true, critical: false },
      { id: 14, description: "Matrix de confrontación de cuadrillas por viaje", required: true, critical: false },
      { id: 15, description: "Carpeta general de documentos de viaje y check de contactos y protocolo de emergencia", required: true, critical: false },
      { id: 16, description: "Registro en sistemas de caminoneta, plicas, donde se renta, póliza de seguro, teléfono de contacto", required: true, critical: false },
      { id: 17, description: "Aviso a nina para temas de viaje y trabajos en el extranjero, en nueva empresa", required: false, critical: false },
      { id: 18, description: "Monitoreo dias de viaje en USA", required: true, critical: false },
      { id: 19, description: "Tiempo en USA es tiempo de empresa, respeto y cuidado de reglas", required: true, critical: false },
      { id: 20, description: "Médico funcional y seguimiento de indicaciones médicas o diagnósticos, quien cumple, quien no", required: true, critical: false },
      { id: 21, description: "Revisión y chequeo médico incluyendo examen de vista", required: true, critical: false },
      { id: 22, description: "Seguir bebidas alcohólicas, drogas, evitar ir borrar o inmadura, manejar carronel, viajar solo a cualquier lugar", required: true, critical: true },
      { id: 23, description: "No seguir políticas, procedimientos, indicaciones, etc", required: true, critical: false },
      { id: 24, description: "Contratación de menores de 60 años", required: false, critical: false },
      { id: 25, description: "Sin cumplimiento de documentos, seguros, certificaciones no hay viaje", required: true, critical: true },
      { id: 26, description: "Familia contacto y familiar disponible para viaje viva con pasaporte vigente, especialmente", required: true, critical: false },
      { id: 27, description: "Protocolo de seguridad antes de ingresar al sitio", required: true, critical: false },
      { id: 28, description: "Protocolo de seguridad y visto bueno por el área de seguridad (servicios) junto antes de iniciar el servicio", required: true, critical: false }
    ]
  },
  {
    category: "Asistencia y Control",
    items: [
      { id: 29, description: "Asistencia cronológica", required: false, critical: false },
      { id: 30, description: "Nutrición", required: false, critical: false },
      { id: 31, description: "Llamadas y video llamadas de seguimiento y revisar de paso políticas de estancia", required: false, critical: false },
      { id: 32, description: "Búsqueda de primeros auxilios en bodega y que se lleven a servicios", required: false, critical: false },
      { id: 33, description: "Plan de llamadas de atención y seguimiento", required: false, critical: false },
      { id: 34, description: "Modificar reglamento para mejor no negociables y nuevas condiciones de trabajo y consecuencias", required: false, critical: false },
      { id: 35, description: "uniformes y equipo de seguridad + frecuencia de cambio", required: false, critical: false },
      { id: 36, description: "Exámenes médicos incluidos con antidrogas", required: false, critical: false },
      { id: 37, description: "Bienestar físico, mental y emocional, ¿qué hacemos?", required: false, critical: false },
      { id: 38, description: "Check de preguntas y seguimiento en llamadas/videoconferencias con técnicos", required: false, critical: false },
      { id: 39, description: "Seguro de vida, continental revisar si son eso es suficiente", required: false, critical: false },
      { id: 40, description: "Plan de servicio funerario", required: false, critical: false },
      { id: 41, description: "Actualización inns soelldo diario para minimizar riesgos", required: false, critical: false },
      { id: 42, description: "Apertura de nueva región social como de técnicos", required: false, critical: false },
      { id: 43, description: "Bienestar físico, mental y emocional", required: false, critical: false },
      { id: 44, description: "Expediente completo en PDF", required: false, critical: false },
      { id: 45, description: "Visitas sorpresa en sitio, estancias y bodega, asegurar buenas prácticas y comportamientos", required: false, critical: false }
    ]
  }
];

export default function Compliance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const { data: personnel = [], isLoading: personnelLoading } = useQuery({
    queryKey: ['/api/personnel'],
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['/api/documents'],
  });

  const getPersonnelName = (personnelId: number) => {
    const person = (personnel as Personnel[]).find((p: Personnel) => p.id === personnelId);
    return person?.fullName || `ID: ${personnelId}`;
  };

  // Mock compliance status for demonstration
  const getComplianceStatus = (itemId: number, personnelId: number) => {
    // This would normally check against real data
    const randomSeed = (itemId + personnelId) % 4;
    const statuses = ['compliant', 'non_compliant', 'pending', 'expired'];
    return statuses[randomSeed];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'non_compliant':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'Cumple';
      case 'non_compliant':
        return 'No Cumple';
      case 'pending':
        return 'Pendiente';
      case 'expired':
        return 'Vencido';
      default:
        return 'Sin Datos';
    }
  };

  const filteredItems = complianceChecklist.flatMap(category => 
    category.items.filter(item => {
      const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || category.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }).map(item => ({ ...item, category: category.category }))
  );

  if (personnelLoading || documentsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Lista de Verificación de Cumplimiento
          </h2>
          <p className="text-gray-600">
            Seguimiento detallado de protección, seguridad y cuidado del personal
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Shield className="mr-2 h-4 w-4" />
          Generar Reporte
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar requisito..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por personal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el Personal</SelectItem>
                {(personnel as Personnel[]).map((person: Personnel) => (
                  <SelectItem key={person.id} value={person.id.toString()}>
                    {person.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las Categorías</SelectItem>
                <SelectItem value="Protección, Seguridad y Cuidado">Protección, Seguridad y Cuidado</SelectItem>
                <SelectItem value="Asistencia y Control">Asistencia y Control</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los Estados</SelectItem>
                <SelectItem value="compliant">Cumple</SelectItem>
                <SelectItem value="non_compliant">No Cumple</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="expired">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requisitos</p>
                <p className="text-2xl font-bold">{complianceChecklist.reduce((acc, cat) => acc + cat.items.length, 0)}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Críticos</p>
                <p className="text-2xl font-bold text-red-600">
                  {complianceChecklist.reduce((acc, cat) => acc + cat.items.filter(item => item.critical).length, 0)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Obligatorios</p>
                <p className="text-2xl font-bold text-orange-600">
                  {complianceChecklist.reduce((acc, cat) => acc + cat.items.filter(item => item.required).length, 0)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Personal Activo</p>
                <p className="text-2xl font-bold text-green-600">
                  {(personnel as Personnel[]).filter(p => p.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Verificación Detallada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Carlos Mendoza</TableHead>
                  <TableHead>José Luis Hernández</TableHead>
                  <TableHead>Miguel Torres</TableHead>
                  <TableHead>Roberto Jiménez</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Shield className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          {searchTerm || categoryFilter
                            ? "No se encontraron requisitos con los filtros aplicados"
                            : "No hay requisitos de cumplimiento"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="flex items-start space-x-2">
                          {item.critical && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />}
                          <span className={cn("text-sm", item.critical && "font-medium")}>
                            {item.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {item.required && (
                            <Badge variant="destructive" className="text-xs">
                              Obligatorio
                            </Badge>
                          )}
                          {item.critical && (
                            <Badge variant="destructive" className="text-xs bg-red-600">
                              Crítico
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {/* Status for each personnel member */}
                      {(personnel as Personnel[]).slice(0, 4).map((person: Personnel) => {
                        const status = getComplianceStatus(item.id, person.id);
                        return (
                          <TableCell key={person.id}>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(status)}
                              <Badge className={getStatusColor(status)} variant="secondary">
                                {getStatusText(status)}
                              </Badge>
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}