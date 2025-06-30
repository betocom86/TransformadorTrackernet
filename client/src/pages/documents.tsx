import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Upload, Search, Eye, Download, FileText, AlertTriangle, Clock } from "lucide-react";
import { cn, formatDate, getStatusColor, getStatusText, getDaysUntilExpiration } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Document, Personnel } from "@shared/schema";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>("all");
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['/api/documents'],
  });

  const { data: personnel = [], isLoading: personnelLoading } = useQuery({
    queryKey: ['/api/personnel'],
  });

  const filteredDocuments = (documents as Document[]).filter((doc: Document) => {
    const matchesSearch = doc.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.issuingAuthority?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPersonnel = selectedPersonnel === "all" || doc.personnelId.toString() === selectedPersonnel;
    const matchesType = documentTypeFilter === "all" || doc.documentType === documentTypeFilter;
    
    return matchesSearch && matchesPersonnel && matchesType;
  });

  const getPersonnelName = (personnelId: number) => {
    const person = (personnel as Personnel[]).find((p: Personnel) => p.id === personnelId);
    return person?.fullName || `ID: ${personnelId}`;
  };

  const getDocumentStatusInfo = (doc: Document) => {
    if (!doc.expirationDate) {
      return { status: 'valid', text: 'Sin vencimiento', color: 'bg-gray-100 text-gray-800' };
    }

    const daysUntil = getDaysUntilExpiration(doc.expirationDate);
    
    if (daysUntil < 0) {
      return { status: 'expired', text: 'Vencido', color: 'bg-red-100 text-red-800' };
    } else if (daysUntil <= 30) {
      return { status: 'expiring', text: `Vence en ${daysUntil} días`, color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'valid', text: 'Vigente', color: 'bg-green-100 text-green-800' };
    }
  };

  const documentTypes = [
    { value: 'passport', label: 'Pasaporte' },
    { value: 'visa', label: 'Visa' },
    { value: 'certification', label: 'Certificación' },
    { value: 'medical', label: 'Médico' },
    { value: 'insurance', label: 'Seguro' },
    { value: 'safety', label: 'Seguridad' },
  ];

  if (documentsLoading || personnelLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  const expiredDocs = (documents as Document[]).filter((doc: Document) => 
    getDaysUntilExpiration(doc.expirationDate) < 0
  ).length;

  const expiringSoonDocs = (documents as Document[]).filter((doc: Document) => {
    const days = getDaysUntilExpiration(doc.expirationDate);
    return days >= 0 && days <= 30;
  }).length;

  const validDocs = (documents as Document[]).filter((doc: Document) => 
    getDaysUntilExpiration(doc.expirationDate) > 30
  ).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Gestión de Documentos
          </h2>
          <p className="text-gray-600">
            Administra todos los documentos del personal
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Upload className="mr-2 h-4 w-4" />
          Subir Documento
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar documentos..."
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

            <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedPersonnel("all");
                setDocumentTypeFilter("all");
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documentos</p>
                <p className="text-2xl font-bold">{(documents as Document[]).length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vigentes</p>
                <p className="text-2xl font-bold text-green-600">{validDocs}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Por Vencer</p>
                <p className="text-2xl font-bold text-yellow-600">{expiringSoonDocs}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{expiredDocs}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Personal</TableHead>
                  <TableHead>Tipo de Documento</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Emisor</TableHead>
                  <TableHead>Fecha de Emisión</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          {searchTerm || selectedPersonnel || documentTypeFilter
                            ? "No se encontraron documentos con los filtros aplicados"
                            : "No hay documentos registrados"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments.map((document: Document) => {
                    const statusInfo = getDocumentStatusInfo(document);
                    const documentTypeLabel = documentTypes.find(t => t.value === document.documentType)?.label || document.documentType;
                    
                    return (
                      <TableRow key={document.id}>
                        <TableCell>
                          <div className="font-medium">
                            {getPersonnelName(document.personnelId)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {documentTypeLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          {document.documentNumber || "N/A"}
                        </TableCell>
                        <TableCell>{document.issuingAuthority || "N/A"}</TableCell>
                        <TableCell>{formatDate(document.issueDate)}</TableCell>
                        <TableCell>
                          {document.expirationDate ? formatDate(document.expirationDate) : "Sin vencimiento"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color} variant="secondary">
                            {statusInfo.text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {document.filePath && (
                              <>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
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
