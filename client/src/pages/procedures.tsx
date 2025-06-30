import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, BookOpen, Clock, Wrench, Shield, FileText, Edit } from "lucide-react";
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

interface ProcedureCatalog {
  id: number;
  code: string;
  title: string;
  description?: string;
  category: string;
  estimatedDuration?: number;
  requiredTools?: string[];
  safetyRequirements?: string[];
  steps?: string[];
  knowledgeBase?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const procedureSchema = z.object({
  code: z.string().min(1, "Código requerido"),
  title: z.string().min(1, "Título requerido"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoría requerida"),
  estimatedDuration: z.number().min(1, "Duración estimada requerida"),
  requiredTools: z.array(z.string()).optional(),
  safetyRequirements: z.array(z.string()).optional(),
  steps: z.array(z.string()).optional(),
  knowledgeBase: z.string().optional(),
});

type ProcedureForm = z.infer<typeof procedureSchema>;

export default function Procedures() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureCatalog | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: procedures = [], isLoading } = useQuery({
    queryKey: ["/api/procedures"],
    queryFn: () => apiRequest("/api/procedures")
  });

  const createProcedureMutation = useMutation({
    mutationFn: (data: ProcedureForm) => 
      apiRequest("/api/procedures", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          requiredTools: data.requiredTools || [],
          safetyRequirements: data.safetyRequirements || [],
          steps: data.steps || [],
        }),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procedures"] });
      setIsCreateOpen(false);
      form.reset();
      toast({ title: "Procedimiento creado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear procedimiento", variant: "destructive" });
    }
  });

  const form = useForm<ProcedureForm>({
    resolver: zodResolver(procedureSchema),
    defaultValues: {
      code: "",
      title: "",
      description: "",
      category: "",
      estimatedDuration: 60,
      requiredTools: [],
      safetyRequirements: [],
      steps: [],
      knowledgeBase: "",
    },
  });

  const onSubmit = (data: ProcedureForm) => {
    createProcedureMutation.mutate(data);
  };

  const categories = [
    { value: "all", label: "Todas las Categorías" },
    { value: "maintenance", label: "Mantenimiento" },
    { value: "repair", label: "Reparación" },
    { value: "inspection", label: "Inspección" },
    { value: "installation", label: "Instalación" },
    { value: "testing", label: "Pruebas" },
    { value: "emergency", label: "Emergencia" },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "maintenance": return "bg-blue-100 text-blue-800";
      case "repair": return "bg-red-100 text-red-800";
      case "inspection": return "bg-yellow-100 text-yellow-800";
      case "installation": return "bg-green-100 text-green-800";
      case "testing": return "bg-purple-100 text-purple-800";
      case "emergency": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProcedures = procedures.filter((procedure: ProcedureCatalog) => {
    const matchesSearch = procedure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         procedure.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (procedure.description && procedure.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || procedure.category === selectedCategory;
    return matchesSearch && matchesCategory && procedure.isActive;
  });

  const [newToolInput, setNewToolInput] = useState("");
  const [newSafetyInput, setNewSafetyInput] = useState("");
  const [newStepInput, setNewStepInput] = useState("");

  const addTool = () => {
    if (newToolInput.trim()) {
      const currentTools = form.getValues("requiredTools") || [];
      form.setValue("requiredTools", [...currentTools, newToolInput.trim()]);
      setNewToolInput("");
    }
  };

  const addSafetyRequirement = () => {
    if (newSafetyInput.trim()) {
      const currentSafety = form.getValues("safetyRequirements") || [];
      form.setValue("safetyRequirements", [...currentSafety, newSafetyInput.trim()]);
      setNewSafetyInput("");
    }
  };

  const addStep = () => {
    if (newStepInput.trim()) {
      const currentSteps = form.getValues("steps") || [];
      form.setValue("steps", [...currentSteps, newStepInput.trim()]);
      setNewStepInput("");
    }
  };

  const removeTool = (index: number) => {
    const currentTools = form.getValues("requiredTools") || [];
    form.setValue("requiredTools", currentTools.filter((_, i) => i !== index));
  };

  const removeSafetyRequirement = (index: number) => {
    const currentSafety = form.getValues("safetyRequirements") || [];
    form.setValue("safetyRequirements", currentSafety.filter((_, i) => i !== index));
  };

  const removeStep = (index: number) => {
    const currentSteps = form.getValues("steps") || [];
    form.setValue("steps", currentSteps.filter((_, i) => i !== index));
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
          <h1 className="text-3xl font-bold text-gray-900">Catálogo de Procedimientos</h1>
          <p className="text-gray-600">Base de conocimientos técnicos para transformadores</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Procedimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Procedimiento</DialogTitle>
              <DialogDescription>
                Agrega un nuevo procedimiento técnico a la base de conocimientos
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código del Procedimiento</FormLabel>
                        <FormControl>
                          <Input placeholder="TR-MANT-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.slice(1).map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título del Procedimiento</FormLabel>
                      <FormControl>
                        <Input placeholder="Inspección visual de transformador..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe el propósito y alcance del procedimiento..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estimatedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración Estimada (minutos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="60"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Herramientas Requeridas */}
                <div>
                  <FormLabel>Herramientas Requeridas</FormLabel>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      placeholder="Agregar herramienta..."
                      value={newToolInput}
                      onChange={(e) => setNewToolInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                    />
                    <Button type="button" onClick={addTool}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(form.watch("requiredTools") || []).map((tool, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTool(index)}>
                        {tool} ×
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Requisitos de Seguridad */}
                <div>
                  <FormLabel>Requisitos de Seguridad</FormLabel>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      placeholder="Agregar requisito de seguridad..."
                      value={newSafetyInput}
                      onChange={(e) => setNewSafetyInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSafetyRequirement())}
                    />
                    <Button type="button" onClick={addSafetyRequirement}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(form.watch("safetyRequirements") || []).map((req, index) => (
                      <Badge key={index} variant="destructive" className="cursor-pointer" onClick={() => removeSafetyRequirement(index)}>
                        {req} ×
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Pasos del Procedimiento */}
                <div>
                  <FormLabel>Pasos del Procedimiento</FormLabel>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      placeholder="Agregar paso..."
                      value={newStepInput}
                      onChange={(e) => setNewStepInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStep())}
                    />
                    <Button type="button" onClick={addStep}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {(form.watch("steps") || []).map((step, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{index + 1}.</span>
                        <span className="flex-1 text-sm">{step}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeStep(index)}>
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="knowledgeBase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base de Conocimientos</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Información técnica detallada, mejores prácticas, lecciones aprendidas..."
                          rows={6}
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
                  <Button type="submit" disabled={createProcedureMutation.isPending}>
                    {createProcedureMutation.isPending ? "Creando..." : "Crear Procedimiento"}
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
            placeholder="Buscar procedimientos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
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
                <p className="text-sm font-medium text-gray-600">Total Procedimientos</p>
                <p className="text-2xl font-bold">{procedures.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mantenimiento</p>
                <p className="text-2xl font-bold text-blue-600">
                  {procedures.filter((p: ProcedureCatalog) => p.category === 'maintenance').length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reparación</p>
                <p className="text-2xl font-bold text-red-600">
                  {procedures.filter((p: ProcedureCatalog) => p.category === 'repair').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inspección</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {procedures.filter((p: ProcedureCatalog) => p.category === 'inspection').length}
                </p>
              </div>
              <Search className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de procedimientos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProcedures.map((procedure: ProcedureCatalog) => (
          <Card key={procedure.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedProcedure(procedure)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{procedure.title}</CardTitle>
                  <CardDescription className="font-mono text-sm">{procedure.code}</CardDescription>
                </div>
                <Badge className={getCategoryColor(procedure.category)}>
                  {categories.find(c => c.value === procedure.category)?.label || procedure.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {procedure.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{procedure.description}</p>
              )}
              
              {procedure.estimatedDuration && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{procedure.estimatedDuration} minutos</span>
                </div>
              )}
              
              {procedure.requiredTools && procedure.requiredTools.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Wrench className="h-4 w-4 mr-2" />
                  <span>{procedure.requiredTools.length} herramientas</span>
                </div>
              )}
              
              {procedure.safetyRequirements && procedure.safetyRequirements.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>{procedure.safetyRequirements.length} requisitos de seguridad</span>
                </div>
              )}
              
              {procedure.steps && procedure.steps.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>{procedure.steps.length} pasos</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProcedures.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron procedimientos</h3>
            <p className="text-gray-500 mb-4">Crea tu primer procedimiento para comenzar la base de conocimientos</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Procedimiento
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de detalle del procedimiento */}
      {selectedProcedure && (
        <Dialog open={!!selectedProcedure} onOpenChange={() => setSelectedProcedure(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-xl">{selectedProcedure.title}</DialogTitle>
                  <DialogDescription className="font-mono">{selectedProcedure.code}</DialogDescription>
                </div>
                <Badge className={getCategoryColor(selectedProcedure.category)}>
                  {categories.find(c => c.value === selectedProcedure.category)?.label || selectedProcedure.category}
                </Badge>
              </div>
            </DialogHeader>
            
            <div className="space-y-6">
              {selectedProcedure.description && (
                <div>
                  <h4 className="font-medium mb-2">Descripción</h4>
                  <p className="text-gray-600">{selectedProcedure.description}</p>
                </div>
              )}
              
              {selectedProcedure.estimatedDuration && (
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-400" />
                  <span><strong>Duración estimada:</strong> {selectedProcedure.estimatedDuration} minutos</span>
                </div>
              )}
              
              {selectedProcedure.requiredTools && selectedProcedure.requiredTools.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Wrench className="h-5 w-5 mr-2" />
                    Herramientas Requeridas
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedProcedure.requiredTools.map((tool, index) => (
                      <li key={index} className="text-gray-600">{tool}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedProcedure.safetyRequirements && selectedProcedure.safetyRequirements.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center text-red-600">
                    <Shield className="h-5 w-5 mr-2" />
                    Requisitos de Seguridad
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedProcedure.safetyRequirements.map((req, index) => (
                      <li key={index} className="text-red-600">{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedProcedure.steps && selectedProcedure.steps.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Pasos del Procedimiento
                  </h4>
                  <ol className="space-y-2">
                    {selectedProcedure.steps.map((step, index) => (
                      <li key={index} className="flex">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              
              {selectedProcedure.knowledgeBase && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Base de Conocimientos
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedProcedure.knowledgeBase}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedProcedure(null)}>
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}