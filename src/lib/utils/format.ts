import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d 'de' MMMM yyyy", { locale: es });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d MMM yyyy, HH:mm", { locale: es });
  } catch {
    return dateStr;
  }
}

export function formatTime(time: string): string {
  return time;
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function calcMargin(salePrice: number, costPrice: number): number {
  if (salePrice === 0) return 0;
  return (salePrice - costPrice) / salePrice;
}

export function calcProfit(salePrice: number, costPrice: number): number {
  return salePrice - costPrice;
}
