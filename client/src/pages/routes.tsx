import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Clock, Route as RouteIcon, Truck, Zap, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface Route {
  id: number;
  routeName: string;
  crewId: number;
  routeDate: string;
  status: string;
  totalDistance?: number;
  estimatedTravelTime?: number;
  actualTravelTime?: number;
  fuelEstimate?: number;
  workOrderSequence?: string[];
  optimizationScore?: number;
  startLocation?: string;
  endLocation?: string;
  notes?: string;
  createdAt: string;
}

interface Crew {
  id: number;
  crewName: string;
  crewCode: string;
  status: string;
}

interface WorkOrder {
  id: number;
  orderNumber: string;
  title: string;
  facilityName: string;
  address: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  status: string;
  priority: string;
}

const routeSchema = z.object({
  routeName: z.string().min(1, "Nombre de ruta requerido"),
  crewId: z.number().min(1, "Cuadrilla requerida"),
  routeDate: z.string().min(1, "Fecha requerida"),
  startLocation: z.string().min(1, "Ubicación de inicio requerida"),
  endLocation: z.string().optional(),
  workOrderIds: z.array(z.number()).min(1, "Al menos una orden de trabajo requerida"),
});

type RouteForm = z.infer<typeof routeSchema>;

export default function Routes() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<number[]>([]);
  const [mapView, setMapView] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ["/api/routes"],
    queryFn: () => apiRequest("/api/routes")
  });

  const { data: crews = [] } = useQuery({
    queryKey: ["/api/crews/available"],
    queryFn: () => apiRequest("/api/crews/available")
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: ["/api/work-orders"],
    queryFn: () => apiRequest("/api/work-orders?status=pending")
  });

  const createRouteMutation = useMutation({
    mutationFn: (data: RouteForm) => {
      const routeData = {
        ...data,
        workOrderSequence: data.workOrderIds.map(id => id.toString()),
        endLocation: data.endLocation || data.startLocation,
        status: 'planned'
      };
      return apiRequest("/api/routes", {
        method: "POST",
        body: JSON.stringify(routeData),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      setIsCreateOpen(false);
      toast({ title: "Ruta creada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear ruta", variant: "destructive" });
    }
  });

  const optimizeRouteMutation = useMutation({
    mutationFn: (data: { crewId: number; workOrderIds: number[]; routeDate: string; startLocation: string }) =>
      apiRequest("/api/routes/optimize", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      toast({ title: "Ruta optimizada creada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al optimizar ruta", variant: "destructive" });
    }
  });

  const form = useForm<RouteForm>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      routeName: "",
      crewId: 0,
      routeDate: new Date().toISOString().split('T')[0],
      startLocation: "Base GC Electric",
      endLocation: "",
      workOrderIds: [],
    },
  });

  const onSubmit = (data: RouteForm) => {
    createRouteMutation.mutate(data);
  };

  const handleOptimizeRoute = () => {
    if (selectedWorkOrders.length === 0) {
      toast({ title: "Selecciona al menos una orden de trabajo", variant: "destructive" });
      return;
    }

    const crewId = form.getValues("crewId");
    const routeDate = form.getValues("routeDate");
    const startLocation = form.getValues("startLocation");

    if (!crewId || !routeDate || !startLocation) {
      toast({ title: "Completa todos los campos requeridos", variant: "destructive" });
      return;
    }

    optimizeRouteMutation.mutate({
      crewId,
      workOrderIds: selectedWorkOrders,
      routeDate,
      startLocation
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned": return "bg-blue-100 text-blue-800";
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCrewName = (crewId: number) => {
    const crew = crews.find((c: Crew) => c.id === crewId);
    return crew ? crew.crewName : `Cuadrilla ${crewId}`;
  };

  // Simulador simple de mapa (en una implementación real usarías Google Maps, Mapbox, etc.)
  const MapSimulator = ({ routes }: { routes: Route[] }) => (
    <div className="bg-green-50 border-2 border-dashed border-green-200 rounded-lg p-8 text-center">
      <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Vista de Mapa - Demo</h3>
      <p className="text-gray-600 mb-4">
        Aquí se mostraría un mapa interactivo con las rutas de reparación actuales
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {routes.slice(0, 4).map((route: Route) => (
          <div key={route.id} className="bg-white p-4 rounded-lg shadow text-left">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{route.routeName}</h4>
              <Badge className={getStatusColor(route.status)}>
                {route.status === 'planned' ? 'Planificada' :
                 route.status === 'active' ? 'Activa' :
                 route.status === 'completed' ? 'Completada' : 'Cancelada'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Cuadrilla:</span> {getCrewName(route.crewId)}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Fecha:</span> {formatDate(route.routeDate)}
            </p>
            {route.totalDistance && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Distancia:</span> {route.totalDistance} km
              </p>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4">
        Integración con APIs de mapas como Google Maps o Mapbox pendiente
      </p>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Rutas de Reparación</h1>
          <p className="text-gray-600">Optimiza y gestiona las rutas de trabajo de las cuadrillas</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={mapView ? "default" : "outline"}
            onClick={() => setMapView(!mapView)}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {mapView ? "Vista Lista" : "Vista Mapa"}
          </Button>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Ruta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Ruta</DialogTitle>
                <DialogDescription>
                  Planifica una nueva ruta de trabajo para una cuadrilla
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="routeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Ruta</FormLabel>
                          <FormControl>
                            <Input placeholder="Ruta Norte - Lunes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="routeDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha</FormLabel>
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
                    name="crewId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuadrilla Asignada</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar cuadrilla" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {crews.map((crew: Crew) => (
                              <SelectItem key={crew.id} value={crew.id.toString()}>
                                {crew.crewName} ({crew.crewCode})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ubicación de Inicio</FormLabel>
                          <FormControl>
                            <Input placeholder="Base GC Electric" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ubicación de Fin (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Misma que inicio" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Órdenes de Trabajo</FormLabel>
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {workOrders.map((workOrder: WorkOrder) => (
                        <div
                          key={workOrder.id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => {
                            const newSelection = selectedWorkOrders.includes(workOrder.id)
                              ? selectedWorkOrders.filter(id => id !== workOrder.id)
                              : [...selectedWorkOrders, workOrder.id];
                            setSelectedWorkOrders(newSelection);
                            form.setValue("workOrderIds", newSelection);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedWorkOrders.includes(workOrder.id)}
                            readOnly
                            className="rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{workOrder.title}</p>
                            <p className="text-xs text-gray-500">
                              {workOrder.facilityName} - {workOrder.city}
                            </p>
                          </div>
                          <Badge className="text-xs">
                            {workOrder.priority === 'emergency' ? 'Emergencia' :
                             workOrder.priority === 'high' ? 'Alta' :
                             workOrder.priority === 'medium' ? 'Media' : 'Baja'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Seleccionadas: {selectedWorkOrders.length} órdenes
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleOptimizeRoute}
                      disabled={optimizeRouteMutation.isPending || selectedWorkOrders.length === 0}
                    >
                      <RouteIcon className="h-4 w-4 mr-2" />
                      {optimizeRouteMutation.isPending ? "Optimizando..." : "Optimizar Ruta"}
                    </Button>
                    <Button type="submit" disabled={createRouteMutation.isPending}>
                      {createRouteMutation.isPending ? "Creando..." : "Crear Ruta"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rutas</p>
                <p className="text-2xl font-bold">{routes.length}</p>
              </div>
              <RouteIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activas Hoy</p>
                <p className="text-2xl font-bold text-green-600">
                  {routes.filter((route: Route) => 
                    route.status === 'active' && 
                    route.routeDate === new Date().toISOString().split('T')[0]
                  ).length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planificadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {routes.filter((route: Route) => route.status === 'planned').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-600">
                  {routes.filter((route: Route) => route.status === 'completed').length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vista de Mapa o Lista */}
      {mapView ? (
        <MapSimulator routes={routes} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route: Route) => (
            <Card key={route.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{route.routeName}</CardTitle>
                    <CardDescription>{getCrewName(route.crewId)}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(route.status)}>
                    {route.status === 'planned' ? 'Planificada' :
                     route.status === 'active' ? 'Activa' :
                     route.status === 'completed' ? 'Completada' : 'Cancelada'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{formatDate(route.routeDate)}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{route.startLocation}</span>
                </div>
                
                {route.totalDistance && (
                  <div className="flex items-center text-sm text-gray-600">
                    <RouteIcon className="h-4 w-4 mr-2" />
                    <span>{route.totalDistance} km estimados</span>
                  </div>
                )}
                
                {route.estimatedTravelTime && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{Math.round(route.estimatedTravelTime / 60)} horas estimadas</span>
                  </div>
                )}
                
                {route.workOrderSequence && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Órdenes:</span> {route.workOrderSequence.length} trabajos programados
                  </div>
                )}
                
                {route.optimizationScore && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Optimización:</span> {Math.round(route.optimizationScore)}% eficiencia
                  </div>
                )}
                
                <div className="pt-3 border-t">
                  <Button variant="outline" className="w-full">
                    Ver en Mapa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {routes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <RouteIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay rutas programadas</h3>
            <p className="text-gray-500 mb-4">Comienza creando tu primera ruta optimizada</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Ruta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}