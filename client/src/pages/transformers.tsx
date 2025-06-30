import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Zap, MapPin, Calendar, Settings, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface Transformer {
  id: number;
  serialNumber: string;
  manufacturer?: string;
  model?: string;
  voltage?: string;
  capacity?: string;
  installationDate?: string;
  location?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

const transformerSchema = z.object({
  serialNumber: z.string().min(1, "Número de serie requerido"),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  voltage: z.string().optional(),
  capacity: z.string().optional(),
  installationDate: z.string().optional(),
  location: z.string().min(1, "Ubicación requerida"),
  notes: z.string().optional(),
});

type TransformerForm = z.infer<typeof transformerSchema>;

export default function Transformers() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTransformer, setSelectedTransformer] = useState<Transformer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transformers = [], isLoading } = useQuery({
    queryKey: ["/api/transformers"],
    queryFn: () => apiRequest("/api/transformers")
  });

  const createTransformerMutation = useMutation({
    mutationFn: (data: TransformerForm) => 
      apiRequest("/api/transformers", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transformers"] });
      setIsCreateOpen(false);
      form.reset();
      toast({ title: "Transformador registrado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al registrar transformador", variant: "destructive" });
    }
  });

  const form = useForm<TransformerForm>({
    resolver: zodResolver(transformerSchema),
    defaultValues: {
      serialNumber: "",
      manufacturer: "",
      model: "",
      voltage: "",
      capacity: "",
      installationDate: "",
      location: "",
      notes: "",
    },
  });

  const onSubmit = (data: TransformerForm) => {
    createTransformerMutation.mutate(data);
  };

  const statusOptions = [
    { value: "all", label: "Todos los Estados" },
    { value: "active", label: "Activo" },
    { value: "maintenance", label: "En Mantenimiento" },
    { value: "decommissioned", label: "Dado de Baja" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "maintenance": return "bg-yellow-100 text-yellow-800";
      case "decommissioned": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Zap className="h-4 w-4" />;
      case "maintenance": return <Settings className="h-4 w-4" />;
      case "decommissioned": return <AlertTriangle className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const filteredTransformers = transformers.filter((transformer: Transformer) => {
    const matchesSearch = transformer.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transformer.manufacturer && transformer.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (transformer.location && transformer.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === "all" || transformer.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario de Transformadores</h1>
          <p className="text-gray-600">Gestión completa del inventario de transformadores eléctricos</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Transformador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Transformador</DialogTitle>
              <DialogDescription>
                Agrega un transformador al inventario del sistema
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Serie</FormLabel>
                        <FormControl>
                          <Input placeholder="TR-2025-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fabricante</FormLabel>
                        <FormControl>
                          <Input placeholder="ABB, Siemens, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo</FormLabel>
                        <FormControl>
                          <Input placeholder="Modelo del transformador" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="voltage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voltaje</FormLabel>
                        <FormControl>
                          <Input placeholder="13.8/4.16 kV" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidad</FormLabel>
                        <FormControl>
                          <Input placeholder="500 kVA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="installationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Instalación</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación</FormLabel>
                      <FormControl>
                        <Input placeholder="Subestación Norte, Zona Industrial..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Información adicional del transformador..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createTransformerMutation.isPending}>
                    {createTransformerMutation.isPending ? "Registrando..." : "Registrar Transformador"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros de búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por número de serie, fabricante o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transformadores</p>
                <p className="text-2xl font-bold">{transformers.length}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {transformers.filter((t: Transformer) => t.status === 'active').length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Mantenimiento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {transformers.filter((t: Transformer) => t.status === 'maintenance').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dados de Baja</p>
                <p className="text-2xl font-bold text-red-600">
                  {transformers.filter((t: Transformer) => t.status === 'decommissioned').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de transformadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTransformers.map((transformer: Transformer) => (
          <Card key={transformer.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedTransformer(transformer)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{transformer.serialNumber}</CardTitle>
                  <CardDescription>
                    {transformer.manufacturer} {transformer.model}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(transformer.status)} variant="secondary">
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(transformer.status)}
                    <span>
                      {transformer.status === 'active' ? 'Activo' :
                       transformer.status === 'maintenance' ? 'Mantenimiento' :
                       transformer.status === 'decommissioned' ? 'Dado de Baja' : transformer.status}
                    </span>
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {transformer.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{transformer.location}</span>
                </div>
              )}
              
              {transformer.voltage && (
                <div className="flex items-center text-sm text-gray-600">
                  <Zap className="h-4 w-4 mr-2" />
                  <span>{transformer.voltage}</span>
                </div>
              )}
              
              {transformer.capacity && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Capacidad:</span> {transformer.capacity}
                </div>
              )}
              
              {transformer.installationDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Instalado: {formatDate(transformer.installationDate)}</span>
                </div>
              )}
              
              <div className="pt-3 border-t">
                <Button variant="outline" className="w-full">
                  Ver Historial
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTransformers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron transformadores</h3>
            <p className="text-gray-500 mb-4">Registra tu primer transformador para comenzar el inventario</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primer Transformador
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de detalle del transformador */}
      {selectedTransformer && (
        <Dialog open={!!selectedTransformer} onOpenChange={() => setSelectedTransformer(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-xl">{selectedTransformer.serialNumber}</DialogTitle>
                  <DialogDescription>
                    {selectedTransformer.manufacturer} {selectedTransformer.model}
                  </DialogDescription>
                </div>
                <Badge className={getStatusColor(selectedTransformer.status)} variant="secondary">
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(selectedTransformer.status)}
                    <span>
                      {selectedTransformer.status === 'active' ? 'Activo' :
                       selectedTransformer.status === 'maintenance' ? 'Mantenimiento' :
                       selectedTransformer.status === 'decommissioned' ? 'Dado de Baja' : selectedTransformer.status}
                    </span>
                  </div>
                </Badge>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {selectedTransformer.voltage && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Voltaje</label>
                    <p className="text-gray-900">{selectedTransformer.voltage}</p>
                  </div>
                )}
                
                {selectedTransformer.capacity && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Capacidad</label>
                    <p className="text-gray-900">{selectedTransformer.capacity}</p>
                  </div>
                )}
              </div>
              
              {selectedTransformer.location && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ubicación</label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {selectedTransformer.location}
                  </p>
                </div>
              )}
              
              {selectedTransformer.installationDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Instalación</label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(selectedTransformer.installationDate)}
                  </p>
                </div>
              )}
              
              {selectedTransformer.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notas</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedTransformer.notes}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
                <p className="text-gray-900">{formatDate(selectedTransformer.createdAt)}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedTransformer(null)}>
                Cerrar
              </Button>
              <Button>
                Editar Información
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}