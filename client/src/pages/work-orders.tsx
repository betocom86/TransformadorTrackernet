import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Camera, MapPin, Clock, User, Zap, AlertCircle, Upload, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface WorkOrder {
  id: number;
  orderNumber: string;
  title: string;
  description: string;
  workType: string;
  priority: string;
  status: string;
  facilityName: string;
  address: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  assignedCrewId?: number;
  scheduledDate?: string;
  estimatedDuration?: number;
  clientContact?: string;
  clientPhone?: string;
  createdAt: string;
}

interface WorkOrderPhoto {
  id: number;
  workOrderId: number;
  photoType: string;
  filePath: string;
  fileName: string;
  description?: string;
  takenAt: string;
  takenBy?: number;
  hasWatermark: boolean;
}

interface Crew {
  id: number;
  crewName: string;
  crewCode: string;
  status: string;
}

const workOrderSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  description: z.string().min(1, "Descripción requerida"),
  workType: z.string().min(1, "Tipo de trabajo requerido"),
  priority: z.string().min(1, "Prioridad requerida"),
  facilityName: z.string().min(1, "Nombre de instalación requerido"),
  address: z.string().min(1, "Dirección requerida"),
  city: z.string().min(1, "Ciudad requerida"),
  state: z.string().min(1, "Estado requerido"),
  scheduledDate: z.string().optional(),
  estimatedDuration: z.number().optional(),
  clientContact: z.string().optional(),
  clientPhone: z.string().optional(),
});

type WorkOrderForm = z.infer<typeof workOrderSchema>;

export default function WorkOrders() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ["/api/work-orders"],
    queryFn: () => apiRequest("/api/work-orders")
  });

  const { data: crews = [] } = useQuery({
    queryKey: ["/api/crews/available"],
    queryFn: () => apiRequest("/api/crews/available")
  });

  const createWorkOrderMutation = useMutation({
    mutationFn: (data: WorkOrderForm) => {
      const orderNumber = `OT-${Date.now().toString().slice(-6)}`;
      return apiRequest("/api/work-orders", {
        method: "POST",
        body: JSON.stringify({ ...data, orderNumber }),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      setIsCreateOpen(false);
      toast({ title: "Orden de trabajo creada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear orden de trabajo", variant: "destructive" });
    }
  });

  const uploadPhotosMutation = useMutation({
    mutationFn: async ({ workOrderId, files, data }: {
      workOrderId: number;
      files: File[];
      data: { photoType: string; description: string; personnelName: string };
    }) => {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('photos', file);
      });
      
      formData.append('photoType', data.photoType);
      formData.append('description', data.description);
      formData.append('personnelName', data.personnelName);
      
      // Intentar obtener ubicación GPS si está disponible
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          formData.append('gpsLatitude', position.coords.latitude.toString());
          formData.append('gpsLongitude', position.coords.longitude.toString());
        } catch (error) {
          console.log('No se pudo obtener ubicación GPS');
        }
      }

      return apiRequest(`/api/work-orders/${workOrderId}/photos`, {
        method: "POST",
        body: formData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      setIsPhotoUploadOpen(false);
      setSelectedFiles([]);
      toast({ title: "Fotos subidas exitosamente con watermark aplicado" });
    },
    onError: (error) => {
      console.error('Error uploading photos:', error);
      toast({ title: "Error al subir fotos", variant: "destructive" });
    }
  });

  const form = useForm<WorkOrderForm>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      title: "",
      description: "",
      workType: "preventive_maintenance",
      priority: "medium",
      facilityName: "",
      address: "",
      city: "",
      state: "",
      scheduledDate: "",
      clientContact: "",
      clientPhone: "",
    },
  });

  const onSubmit = (data: WorkOrderForm) => {
    createWorkOrderMutation.mutate(data);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast({ 
        title: "Solo se permiten archivos de imagen", 
        variant: "destructive" 
      });
    }
    
    if (imageFiles.length > 10) {
      toast({ 
        title: "Máximo 10 fotos por vez", 
        variant: "destructive" 
      });
      return;
    }
    
    setSelectedFiles(imageFiles);
  };

  const handlePhotoUpload = () => {
    if (!selectedWorkOrder || selectedFiles.length === 0) return;
    
    const photoType = (document.getElementById('photoType') as HTMLSelectElement)?.value || 'general';
    const description = (document.getElementById('photoDescription') as HTMLInputElement)?.value || '';
    const personnelName = (document.getElementById('personnelName') as HTMLInputElement)?.value || 'Usuario';
    
    uploadPhotosMutation.mutate({
      workOrderId: selectedWorkOrder.id,
      files: selectedFiles,
      data: { photoType, description, personnelName }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "emergency": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-gray-100 text-gray-800";
      case "assigned": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getWorkTypeText = (workType: string) => {
    switch (workType) {
      case "preventive_maintenance": return "Mantenimiento Preventivo";
      case "emergency_repair": return "Reparación de Emergencia";
      case "inspection": return "Inspección";
      case "installation": return "Instalación";
      default: return workType;
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Órdenes de Trabajo</h1>
          <p className="text-gray-600">Gestiona las órdenes de trabajo y sube fotos con watermark automático</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Orden
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Orden de Trabajo</DialogTitle>
              <DialogDescription>
                Registra una nueva orden de trabajo para asignar a las cuadrillas
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Mantenimiento Transformador TX-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="workType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Trabajo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="preventive_maintenance">Mantenimiento Preventivo</SelectItem>
                            <SelectItem value="emergency_repair">Reparación de Emergencia</SelectItem>
                            <SelectItem value="inspection">Inspección</SelectItem>
                            <SelectItem value="installation">Instalación</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe los trabajos a realizar..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Baja</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="emergency">Emergencia</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Programada</FormLabel>
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
                  name="facilityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Instalación</FormLabel>
                      <FormControl>
                        <Input placeholder="Subestación Norte" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Av. Principal 123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input placeholder="Ciudad de México" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="CDMX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contacto Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="+52 55 1234 5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createWorkOrderMutation.isPending}>
                    {createWorkOrderMutation.isPending ? "Creando..." : "Crear Orden"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Órdenes</p>
                <p className="text-2xl font-bold">{workOrders.length}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {workOrders.filter((wo: WorkOrder) => wo.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-blue-600">
                  {workOrders.filter((wo: WorkOrder) => wo.status === 'in_progress').length}
                </p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emergencias</p>
                <p className="text-2xl font-bold text-red-600">
                  {workOrders.filter((wo: WorkOrder) => wo.priority === 'emergency').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de órdenes de trabajo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workOrders.map((workOrder: WorkOrder) => (
          <Card key={workOrder.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{workOrder.title}</CardTitle>
                  <CardDescription>{workOrder.orderNumber}</CardDescription>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getPriorityColor(workOrder.priority)}>
                    {workOrder.priority === 'emergency' ? 'Emergencia' :
                     workOrder.priority === 'high' ? 'Alta' :
                     workOrder.priority === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                  <Badge className={getStatusColor(workOrder.status)}>
                    {workOrder.status === 'pending' ? 'Pendiente' :
                     workOrder.status === 'assigned' ? 'Asignada' :
                     workOrder.status === 'in_progress' ? 'En Progreso' :
                     workOrder.status === 'completed' ? 'Completada' : 'Cancelada'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Zap className="h-4 w-4 mr-2" />
                <span>{getWorkTypeText(workOrder.workType)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{workOrder.facilityName}</span>
              </div>
              
              <div className="text-sm text-gray-600">
                <span className="font-medium">Ubicación:</span> {workOrder.address}, {workOrder.city}
              </div>
              
              {workOrder.scheduledDate && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Programada: {formatDate(workOrder.scheduledDate)}</span>
                </div>
              )}
              
              <p className="text-sm text-gray-500 line-clamp-2">{workOrder.description}</p>
              
              <div className="pt-3 border-t flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedWorkOrder(workOrder);
                    setIsPhotoUploadOpen(true);
                  }}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Subir Fotos
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para subir fotos */}
      <Dialog open={isPhotoUploadOpen} onOpenChange={setIsPhotoUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Subir Fotos con Watermark</DialogTitle>
            <DialogDescription>
              Las fotos se procesarán automáticamente con watermark de GC Electric
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Foto</label>
              <select 
                id="photoType" 
                className="w-full p-2 border rounded-md"
                defaultValue="general"
              >
                <option value="before">Antes</option>
                <option value="during">Durante</option>
                <option value="after">Después</option>
                <option value="issue">Problema</option>
                <option value="equipment">Equipo</option>
                <option value="safety">Seguridad</option>
                <option value="general">General</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Nombre del Técnico</label>
              <input 
                id="personnelName"
                type="text" 
                className="w-full p-2 border rounded-md"
                placeholder="Tu nombre completo"
                defaultValue=""
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <input 
                id="photoDescription"
                type="text" 
                className="w-full p-2 border rounded-md"
                placeholder="Describe lo que muestran las fotos"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Seleccionar Fotos (máx. 10)</label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="w-full p-2 border rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se aplicará watermark automáticamente con información de la orden
              </p>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Archivos seleccionados:</p>
                <div className="space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      <span className="truncate">{file.name}</span>
                      <span className="ml-auto text-xs">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPhotoUploadOpen(false);
                  setSelectedFiles([]);
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handlePhotoUpload}
                disabled={selectedFiles.length === 0 || uploadPhotosMutation.isPending}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadPhotosMutation.isPending ? "Subiendo..." : `Subir ${selectedFiles.length} Foto${selectedFiles.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {workOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes de trabajo</h3>
            <p className="text-gray-500 mb-4">Comienza creando tu primera orden de trabajo</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Orden
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}