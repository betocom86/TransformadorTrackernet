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
import { Upload, Search, Award, AlertTriangle, Clock } from "lucide-react";
import { cn, formatDate, getStatusColor, getStatusText, getDaysUntilExpiration } from "@/lib/utils";
import type { Training, Personnel } from "@shared/schema";

export default function Certifications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>("");
  const [trainingTypeFilter, setTrainingTypeFilter] = useState<string>("");

  const { data: training = [], isLoading: trainingLoading } = useQuery({
    queryKey: ['/api/training/1'], // This would need to be updated to get all training
  });

  const { data: personnel = [], isLoading: personnelLoading } = useQuery({
    queryKey: ['/api/personnel'],
  });

  const getPersonnelName = (personnelId: number) => {
    const person = (personnel as Personnel[]).find((p: Personnel) => p.id === personnelId);
    return person?.fullName || `ID: ${personnelId}`;
  };

  const getTrainingStatusInfo = (train: Training) => {
    if (!train.expirationDate) {
      return { status: 'valid', text: 'Sin vencimiento', color: 'bg-gray-100 text-gray-800' };
    }

    const daysUntil = getDaysUntilExpiration(train.expirationDate);
    
    if (daysUntil < 0) {
      return { status: 'expired', text: 'Vencido', color: 'bg-red-100 text-red-800' };
    } else if (daysUntil <= 30) {
      return { status: 'expiring', text: `Vence en ${daysUntil} días`, color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'valid', text: 'Vigente', color: 'bg-green-100 text-green-800' };
    }
  };

  const trainingTypes = [
    { value: 'safety', label: 'Seguridad' },
    { value: 'medical', label: 'Médico' },
    { value: 'technical', label: 'Técnico' },
    { value: 'compliance', label: 'Cumplimiento' },
  ];

  if (trainingLoading || personnelLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  // Mock data for demonstration since API endpoint needs to be updated
  const mockTraining = [
    {
      id: 1,
      personnelId: 1,
      trainingName: "OSHA 30-Hour Construction Safety",
      trainingType: "safety",
      provider: "OSHA Training Institute",
      completionDate: "2023-06-15",
      expirationDate: "2026-06-15",
      certificateNumber: "OSHA-30-2023-001",
      status: "active",
      notes: "Certificación requerida para trabajo en EUA"
    },
    {
      id: 2,
      personnelId: 2,
      trainingName: "Primeros Auxilios y RCP",
      trainingType: "medical",
      provider: "Cruz Roja Mexicana",
      completionDate: "2023-08-20",
      expirationDate: "2025-08-20",
      certificateNumber: "CRM-FA-2023-045",
      status: "active",
      notes: "Certificación en primeros auxilios"
    },
    {
      id: 3,
      personnelId: 3,
      trainingName: "Mantenimiento de Transformadores IEEE C57",
      trainingType: "technical",
      provider: "IEEE Power & Energy Society",
      completionDate: "2023-09-10",
      expirationDate: "2026-09-10",
      certificateNumber: "IEEE-C57-2023-078",
      status: "active",
      notes: "Certificación técnica especializada"
    },
    {
      id: 4,
      personnelId: 2,
      trainingName: "Certificación NFPA 70E",
      trainingType: "safety",
      provider: "NFPA International",
      completionDate: "2022-03-15",
      expirationDate: "2024-03-15",
      certificateNumber: "NFPA-70E-2022-089",
      status: "expired",
      notes: "URGENTE: Certificación de seguridad eléctrica vencida"
    }
  ];

  const filteredTraining = mockTraining.filter((train) => {
    const matchesSearch = train.trainingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         train.certificateNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPersonnel = !selectedPersonnel || selectedPersonnel === "all" || train.personnelId.toString() === selectedPersonnel;
    const matchesType = !trainingTypeFilter || trainingTypeFilter === "all" || train.trainingType === trainingTypeFilter;
    
    return matchesSearch && matchesPersonnel && matchesType;
  });

  const activeTraining = mockTraining.filter(t => t.status === 'active').length;
  const expiredTraining = mockTraining.filter(t => {
    const days = getDaysUntilExpiration(t.expirationDate);
    return days < 0;
  }).length;
  const expiringSoonTraining = mockTraining.filter(t => {
    const days = getDaysUntilExpiration(t.expirationDate);
    return days >= 0 && days <= 30;
  }).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Certificaciones y Entrenamientos
          </h2>
          <p className="text-gray-600">
            Gestiona las certificaciones y entrenamientos del personal
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Upload className="mr-2 h-4 w-4" />
          Registrar Certificación
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar certificaciones..."
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
                <SelectItem value="all">Todos</SelectItem>
                {(personnel as Personnel[]).map((person: Personnel) => (
                  <SelectItem key={person.id} value={person.id.toString()}>
                    {person.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={trainingTypeFilter} onValueChange={setTrainingTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de certificación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {trainingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline">
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Training Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Certificaciones</p>
                <p className="text-2xl font-bold">{mockTraining.length}</p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vigentes</p>
                <p className="text-2xl font-bold text-green-600">{activeTraining}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Por Vencer</p>
                <p className="text-2xl font-bold text-yellow-600">{expiringSoonTraining}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-red-600">{expiredTraining}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Certificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Personal</TableHead>
                  <TableHead>Certificación</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Número de Certificado</TableHead>
                  <TableHead>Fecha de Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTraining.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <Award className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          {searchTerm || selectedPersonnel || trainingTypeFilter
                            ? "No se encontraron certificaciones con los filtros aplicados"
                            : "No hay certificaciones registradas"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTraining.map((train) => {
                    const statusInfo = getTrainingStatusInfo(train as Training);
                    const trainingTypeLabel = trainingTypes.find(t => t.value === train.trainingType)?.label || train.trainingType;
                    
                    return (
                      <TableRow key={train.id}>
                        <TableCell>
                          <div className="font-medium">
                            {getPersonnelName(train.personnelId)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{train.trainingName}</div>
                            <div className="text-sm text-gray-500">
                              Completado: {formatDate(train.completionDate)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {trainingTypeLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>{train.provider}</TableCell>
                        <TableCell className="font-mono">
                          {train.certificateNumber}
                        </TableCell>
                        <TableCell>
                          {train.expirationDate ? formatDate(train.expirationDate) : "Sin vencimiento"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color} variant="secondary">
                            {statusInfo.text}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}