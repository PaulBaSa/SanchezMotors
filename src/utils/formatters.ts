// =============================================
// Utility formatters for the Workshop Manager
// =============================================

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function calculateMargin(sale: number, cost: number): number {
  if (sale === 0) return 0;
  return ((sale - cost) / sale) * 100;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    reception: 'Recepción',
    in_progress: 'En Proceso',
    completed: 'Finalizado',
    delivered: 'Entregado',
    pending: 'Pendiente',
  };
  return labels[status] || status;
}
