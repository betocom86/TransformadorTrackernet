import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Sin fecha";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return "Fecha inválida";
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'valid':
    case 'vigente':
    case 'active':
    case 'activo':
      return 'bg-green-100 text-green-800';
    case 'expired':
    case 'vencido':
    case 'vencida':
      return 'bg-red-100 text-red-800';
    case 'expiring_soon':
    case 'por_vencer':
      return 'bg-yellow-100 text-yellow-800';
    case 'planning':
    case 'planificando':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
    case 'completado':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export function getStatusText(status: string): string {
  switch (status.toLowerCase()) {
    case 'valid': return 'Válido';
    case 'expired': return 'Vencido';
    case 'expiring_soon': return 'Por Vencer';
    case 'active': return 'Activo';
    case 'inactive': return 'Inactivo';
    case 'planning': return 'Planificando';
    case 'completed': return 'Completado';
    case 'on_hold': return 'En Espera';
    case 'cancelled': return 'Cancelado';
    case 'assigned': return 'Asignado';
    case 'confirmed': return 'Confirmado';
    case 'traveling': return 'Viajando';
    case 'on_site': return 'En Sitio';
    default: return status;
  }
}

export function getDaysUntilExpiration(expirationDate: string | null | undefined): number {
  if (!expirationDate) return Infinity;
  
  try {
    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return Infinity;
  }
}

export function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return "$0.00";
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100); // assuming stored in cents
}

export function getAlertSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
