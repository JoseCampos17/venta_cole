export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'VentasCole';
export const APP_TAGLINE = process.env.NEXT_PUBLIC_APP_TAGLINE ?? 'Accesorios y cosméticos 💗';

export const LOW_STOCK_THRESHOLD = 3;

export const PAYMENT_METHOD_LABELS = {
  cash: '💵 Efectivo',
  nequi: '📱 Nequi',
} as const;

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACEPTADO: 'bg-blue-100 text-blue-800 border-blue-200',
  RECHAZADO: 'bg-red-100 text-red-800 border-red-200',
  PREPARANDO: 'bg-purple-100 text-purple-800 border-purple-200',
  LISTO: 'bg-green-100 text-green-800 border-green-200',
  ENTREGADO: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELADO: 'bg-gray-100 text-gray-800 border-gray-200',
};
