import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Wrench, FileCheck } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            PROSECU Personnel Management
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema integral de gestión de personal para empresas de mantenimiento eléctrico
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Iniciar Sesión
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Gestión de Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Control completo de expedientes, documentos y certificaciones del personal técnico
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Wrench className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Órdenes de Trabajo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Gestión de cuadrillas, asignación de trabajos y seguimiento en tiempo real
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 mx-auto text-red-600 mb-4" />
              <CardTitle>Seguridad y Cumplimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Monitoreo de equipos de seguridad, capacitaciones y alertas de vencimiento
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileCheck className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Procedimientos Técnicos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Base de conocimientos con procedimientos estándar para mantenimiento de transformadores
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Company Info */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">GC Electric</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Especializados en mantenimiento de transformadores eléctricos en territorio estadounidense. 
            Nuestro sistema PROSECU garantiza el cumplimiento normativo y la eficiencia operativa 
            de nuestros equipos técnicos mexicanos.
          </p>
        </div>
      </div>
    </div>
  );
}