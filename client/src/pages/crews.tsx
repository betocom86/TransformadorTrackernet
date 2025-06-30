import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, MapPin, Phone, Wrench } from "lucide-react";
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

interface Crew {
  id: number;
  crewName: string;
  crewCode: string;
  leaderId?: number;
  specialization: string;
  maxCapacity: number;
  currentSize: number;
  status: string;
  baseLocation: string;
  contactPhone?: string;
  equipment?: string[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Personnel {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
}

const crewSchema = z.object({
  crewName: z.string().min(1, "Nombre de cuadrilla requerido"),
  crewCode: z.string().min(1, "Código de cuadrilla requerido"),
  specialization: z.string().min(1, "Especialización requerida"),
  maxCapacity: z.number().min(1).max(20),
  baseLocation: z.string().min(1, "Ubicación base requerida"),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
});

type CrewForm = z.infer<typeof crewSchema>;

export default function Crews() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: crews = [], isLoading } = useQuery({
    queryKey: ["/api/crews"],
    queryFn: () => apiRequest("/api/crews")
  });

  const { data: personnel = [] } = useQuery({
    queryKey: ["/api/personnel"],
    queryFn: () => apiRequest("/api/personnel")
  });

  const createCrewMutation = useMutation({
    mutationFn: (data: CrewForm) => 
      apiRequest("/api/crews", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crews"] });
      setIsCreateOpen(false);
      toast({ title: "Cuadrilla creada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear cuadrilla", variant: "destructive" });
    }
  });

  const form = useForm<CrewForm>({
    resolver: zodResolver(crewSchema),
    defaultValues: {
      crewName: "",
      crewCode: "",
      specialization: "transformer_maintenance",
      maxCapacity: 6,
      baseLocation: "",
      contactPhone: "",
      notes: "",
    },
  });

  const onSubmit = (data: CrewForm) => {
    createCrewMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "assigned": return "bg-blue-100 text-blue-800";
      case "maintenance": return "bg-yellow-100 text-yellow-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSpecializationText = (specialization: string) => {
    switch (specialization) {
      case "transformer_maintenance": return "Mantenimiento de Transformadores";
      case "electrical_repair": return "Reparaciones Eléctricas";
      case "emergency_response": return "Respuesta de Emergencia";
      default: return specialization;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Cuadrillas</h1>
          <p className="text-gray-600">Administra las cuadrillas de trabajo y su personal</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cuadrilla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Cuadrilla</DialogTitle>
              <DialogDescription>
                Configura una nueva cuadrilla de trabajo
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="crewName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Cuadrilla</FormLabel>
                      <FormControl>
                        <Input placeholder="Cuadrilla Alpha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="crewCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input placeholder="CA-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialización</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar especialización" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="transformer_maintenance">Mantenimiento de Transformadores</SelectItem>
                          <SelectItem value="electrical_repair">Reparaciones Eléctricas</SelectItem>
                          <SelectItem value="emergency_response">Respuesta de Emergencia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidad Máxima</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="20" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="baseLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación Base</FormLabel>
                      <FormControl>
                        <Input placeholder="Ciudad de México" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de Contacto</FormLabel>
                      <FormControl>
                        <Input placeholder="+52 55 1234 5678" {...field} />
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
                        <Textarea placeholder="Notas adicionales..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createCrewMutation.isPending}>
                    {createCrewMutation.isPending ? "Creando..." : "Crear Cuadrilla"}
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
                <p className="text-sm font-medium text-gray-600">Total Cuadrillas</p>
                <p className="text-2xl font-bold">{crews.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">
                  {crews.filter((crew: Crew) => crew.status === 'available').length}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                Listas
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Trabajo</p>
                <p className="text-2xl font-bold text-blue-600">
                  {crews.filter((crew: Crew) => crew.status === 'assigned').length}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                Activas
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Mantenimiento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {crews.filter((crew: Crew) => crew.status === 'maintenance').length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de cuadrillas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crews.map((crew: Crew) => (
          <Card key={crew.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{crew.crewName}</CardTitle>
                  <CardDescription>{crew.crewCode}</CardDescription>
                </div>
                <Badge className={getStatusColor(crew.status)}>
                  {crew.status === 'available' ? 'Disponible' :
                   crew.status === 'assigned' ? 'Asignada' :
                   crew.status === 'maintenance' ? 'Mantenimiento' : 'Inactiva'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Wrench className="h-4 w-4 mr-2" />
                <span>{getSpecializationText(crew.specialization)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>{crew.currentSize}/{crew.maxCapacity} miembros</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{crew.baseLocation}</span>
              </div>
              
              {crew.contactPhone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{crew.contactPhone}</span>
                </div>
              )}
              
              {crew.notes && (
                <p className="text-sm text-gray-500 mt-2">{crew.notes}</p>
              )}
              
              <div className="pt-3 border-t">
                <Button variant="outline" className="w-full">
                  Ver Detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {crews.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cuadrillas registradas</h3>
            <p className="text-gray-500 mb-4">Comienza creando tu primera cuadrilla de trabajo</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Cuadrilla
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}