import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  ClipboardList, 
  Shield, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Calendar
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: personnel } = useQuery({
    queryKey: ["/api/personnel"],
  });

  const userName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || "User";

  const activeAlerts = alerts?.filter((alert: any) => !alert.resolvedAt) || [];
  const activeProjects = projects?.filter((project: any) => project.status === 'active') || [];
  const totalPersonnel = personnel?.length || 0;

  const quickActions = [
    { 
      icon: Users, 
      title: "Manage Personnel", 
      description: "Add, edit, or view personnel records",
      href: "/personnel",
      color: "text-blue-600"
    },
    { 
      icon: ClipboardList, 
      title: "Work Orders", 
      description: "Create and manage work orders",
      href: "/work-orders",
      color: "text-green-600"
    },
    { 
      icon: Shield, 
      title: "Safety & Compliance", 
      description: "Monitor compliance and safety",
      href: "/compliance",
      color: "text-orange-600"
    },
    { 
      icon: Zap, 
      title: "Field Operations", 
      description: "Manage crews and routes",
      href: "/crews",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your operations today.
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          GC Electric - PROSECU System
        </Badge>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You have {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''} 
            that require attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Personnel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalPersonnel || totalPersonnel}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Crews</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalCrews || "0"}</div>
            <p className="text-xs text-muted-foreground">Field crews available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalWorkOrders || "0"}</div>
            <p className="text-xs text-muted-foreground">Active work orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.complianceRate || "95%"}</div>
            <p className="text-xs text-muted-foreground">Safety compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-5 w-5 ${action.color}`} />
                    <CardTitle className="text-sm">{action.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs mb-3">
                    {action.description}
                  </CardDescription>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = action.href}
                  >
                    Open
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Active Projects</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeProjects.length > 0 ? (
              <div className="space-y-3">
                {activeProjects.slice(0, 3).map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{project.name}</p>
                      <p className="text-xs text-gray-600">{project.location}</p>
                    </div>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                ))}
                {activeProjects.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{activeProjects.length - 3} more projects
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No active projects</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Recent Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeAlerts.length > 0 ? (
              <div className="space-y-3">
                {activeAlerts.slice(0, 3).map((alert: any) => (
                  <div key={alert.id} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs text-gray-600">{alert.alertType}</p>
                    </div>
                  </div>
                ))}
                {activeAlerts.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{activeAlerts.length - 3} more alerts
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <p className="text-sm">No active alerts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}