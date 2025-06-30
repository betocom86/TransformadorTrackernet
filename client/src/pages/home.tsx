import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wrench, FileCheck, AlertTriangle } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Redirect to dashboard after a brief welcome
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        {/* Welcome Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido a PROSECU
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {user?.firstName && user?.lastName 
              ? `Hola ${user.firstName} ${user.lastName}` 
              : 'Sistema de Gestión de Personal'}
          </p>
          <Button 
            onClick={handleDashboard}
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Ir al Dashboard
          </Button>
        </div>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/personal")}>
            <CardHeader>
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Gestionar expedientes y documentos del personal</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/cuadrillas")}>
            <CardHeader>
              <Wrench className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Cuadrillas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Administrar equipos de trabajo y asignaciones</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/cumplimiento")}>
            <CardHeader>
              <FileCheck className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Cumplimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Monitorear certificaciones y documentos</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/ordenes-trabajo")}>
            <CardHeader>
              <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle className="text-lg">Órdenes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Revisar órdenes de trabajo pendientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Auto-redirect message */}
        <div className="text-center text-gray-500">
          <p>Serás redirigido al dashboard automáticamente en unos segundos...</p>
        </div>
      </div>
    </div>
  );
}