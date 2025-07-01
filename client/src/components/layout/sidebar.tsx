import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  ClipboardList,
  Shield,
  Zap,
  FileText,
  Settings,
  Calendar,
  BarChart3,
  Wrench,
  BookOpen,
  AlertTriangle,
  Menu,
  X,
  Building,
  Route,
  Camera
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
    badge: null
  },
  {
    title: "Personal",
    href: "/personnel",
    icon: Users,
    badge: null
  },
  {
    title: "Proyectos",
    href: "/projects",
    icon: Building,
    badge: null
  },
  {
    title: "Documentos",
    href: "/documents",
    icon: FileText,
    badge: null
  },
  {
    title: "Cumplimiento",
    href: "/compliance",
    icon: Shield,
    badge: null
  },
  {
    title: "Equipos",
    href: "/crews",
    icon: Zap,
    badge: null
  },
  {
    title: "Órdenes de Trabajo",
    href: "/work-orders",
    icon: ClipboardList,
    badge: null
  },
  {
    title: "Rutas",
    href: "/routes",
    icon: Route,
    badge: null
  },
  {
    title: "Transformadores",
    href: "/transformers",
    icon: Wrench,
    badge: null
  },
  {
    title: "Procedimientos",
    href: "/procedures",
    icon: BookOpen,
    badge: null
  },
  {
    title: "Alertas",
    href: "/alerts",
    icon: AlertTriangle,
    badge: "new"
  },
  {
    title: "Reportes",
    href: "/reports",
    icon: BarChart3,
    badge: null
  },
  {
    title: "Configuración",
    href: "/settings",
    icon: Settings,
    badge: null
  }
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();

  return (
    <div className={cn(
      "relative bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">PROSECU</h2>
            <p className="text-xs text-gray-500">GC Electric</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.href;
            
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                      "hover:bg-gray-100",
                      isActive 
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                        : "text-gray-700"
                    )}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-sm font-medium">
                          {item.title}
                        </span>
                        {item.badge && (
                          <Badge 
                            variant={item.badge === "new" ? "destructive" : "secondary"} 
                            className="text-xs"
                          >
                            {item.badge === "new" ? "!" : item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="text-xs text-gray-500 text-center">
            <p>Sistema de Gestión</p>
            <p>Versión 2.0</p>
          </div>
        )}
      </div>
    </div>
  );
}