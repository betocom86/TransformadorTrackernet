import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Award,
  Shield,
  FolderOpen,
  Calendar,
  HardHat,
  BarChart3,
  Download,
  UsersIcon,
  Zap,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

const menuItems = [
  {
    title: "Panel Principal",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Gestión de Personal",
    items: [
      {
        name: "Personal",
        href: "/personal",
        icon: Users,
        badge: "personalAlerts",
      },
      {
        name: "Documentos",
        href: "/documentos",
        icon: FileText,
      },
      {
        name: "Certificaciones",
        href: "/certificaciones",
        icon: Award,
      },
      {
        name: "Cumplimiento",
        href: "/cumplimiento",
        icon: Shield,
      },
    ],
  },
  {
    title: "Operaciones",
    items: [
      {
        name: "Proyectos",
        href: "/proyectos",
        icon: FolderOpen,
      },
      {
        name: "Cuadrillas",
        href: "/cuadrillas",
        icon: UsersIcon,
      },
      {
        name: "Órdenes de Trabajo",
        href: "/ordenes-trabajo",
        icon: Zap,
      },
      {
        name: "Rutas Optimizadas",
        href: "/rutas",
        icon: MapPin,
      },
      {
        name: "Asignaciones",
        href: "/asignaciones",
        icon: Calendar,
      },
      {
        name: "Equipo de Seguridad",
        href: "/equipos",
        icon: HardHat,
      },
    ],
  },
  {
    title: "Reportes",
    items: [
      {
        name: "Reportes",
        href: "/reportes",
        icon: BarChart3,
      },
      {
        name: "Exportar Datos",
        href: "/exportar",
        icon: Download,
      },
    ],
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const personalAlerts = (stats as any)?.expiredDocs || 0;

  return (
    <aside className="w-64 bg-white shadow-lg">
      <nav className="mt-4">
        {menuItems.map((section) => (
          <div key={section.title}>
            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              const alertCount = item.badge === "personalAlerts" ? personalAlerts : 0;
              
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer",
                      isActive && "bg-blue-50 border-r-2 border-primary text-primary"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="ml-3">{item.name}</span>
                    {alertCount > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-auto bg-warning text-white"
                      >
                        {alertCount}
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
