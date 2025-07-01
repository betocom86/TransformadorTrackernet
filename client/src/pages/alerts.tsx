import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Clock, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Alerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/alerts/${id}/acknowledge`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alerta reconocida",
        description: "La alerta ha sido marcada como reconocida.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo reconocer la alerta.",
        variant: "destructive",
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/alerts/${id}/resolve`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alerta resuelta",
        description: "La alerta ha sido marcada como resuelta.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo resolver la alerta.",
        variant: "destructive",
      });
    },
  });

  const activeAlerts = alerts.filter((alert: any) => !alert.resolvedAt);
  const resolvedAlerts = alerts.filter((alert: any) => alert.resolvedAt);

  const getAlertVariant = (alertType: string) => {
    switch (alertType.toLowerCase()) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType.toLowerCase()) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  if (isLoading) {
    return <div>Cargando alertas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Centro de Alertas</h1>
          <p className="text-gray-600 mt-2">
            Gestione y monitoree todas las alertas del sistema
          </p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="destructive" className="text-sm">
            {activeAlerts.length} Activas
          </Badge>
          <Badge variant="outline" className="text-sm">
            {resolvedAlerts.length} Resueltas
          </Badge>
        </div>
      </div>

      {/* Alertas Activas */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Alertas Activas ({activeAlerts.length})
        </h2>
        {activeAlerts.length === 0 ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              No hay alertas activas en este momento. ¡Todo está funcionando correctamente!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4">
            {activeAlerts.map((alert: any) => (
              <Card key={alert.id} className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getAlertIcon(alert.alertType)}
                      <div>
                        <CardTitle className="text-base">{alert.message}</CardTitle>
                        <CardDescription className="text-sm">
                          Tipo: <Badge variant={getAlertVariant(alert.alertType)}>{alert.alertType}</Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeMutation.mutate(alert.id)}
                        disabled={acknowledgeMutation.isPending}
                      >
                        Reconocer
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => resolveMutation.mutate(alert.id)}
                        disabled={resolveMutation.isPending}
                      >
                        Resolver
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm text-gray-600">
                    <p>Creada: {new Date(alert.createdAt).toLocaleString()}</p>
                    {alert.acknowledgedAt && (
                      <p>Reconocida: {new Date(alert.acknowledgedAt).toLocaleString()}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Alertas Resueltas */}
      {resolvedAlerts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Alertas Resueltas Recientes ({resolvedAlerts.slice(0, 5).length})
          </h2>
          <div className="grid gap-4">
            {resolvedAlerts.slice(0, 5).map((alert: any) => (
              <Card key={alert.id} className="border-l-4 border-l-green-500 opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <CardTitle className="text-base">{alert.message}</CardTitle>
                        <CardDescription className="text-sm">
                          Tipo: <Badge variant="outline">{alert.alertType}</Badge>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Resuelta
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm text-gray-600">
                    <p>Resuelta: {new Date(alert.resolvedAt).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}