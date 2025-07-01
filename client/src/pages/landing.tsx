import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, ClipboardList, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            PROSECU Personnel Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Complete personnel management system for construction companies with advanced field service capabilities, safety compliance, and workforce optimization.
          </p>
          <Badge variant="secondary" className="mb-8">
            GC Electric - Professional Solutions
          </Badge>
          
          <Button 
            size="lg" 
            className="px-8 py-4 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Login to Continue
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Personnel Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete employee records, certifications, and document management with expiration tracking.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <ClipboardList className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Advanced work order system with GPS tracking, photo documentation, and transformer maintenance procedures.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="w-12 h-12 mx-auto text-orange-600 mb-4" />
              <CardTitle>Safety Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Safety equipment tracking, training records, and compliance monitoring with automated alerts.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Field Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Crew management, route optimization, and real-time field service coordination for maximum efficiency.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Trusted by construction companies across Mexico and US territories
          </p>
          <div className="flex justify-center space-x-4 text-sm text-gray-500">
            <span>✓ PostgreSQL Database</span>
            <span>✓ Role-based Access</span>
            <span>✓ Mobile Friendly</span>
            <span>✓ Real-time Updates</span>
          </div>
        </div>
      </div>
    </div>
  );
}