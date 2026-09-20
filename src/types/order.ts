export type OrderStatus =
  | 'PENDIENTE'
  | 'ACEPTADO'
  | 'RECHAZADO'
  | 'PREPARANDO'
  | 'LISTO'
  | 'ENTREGADO'
  | 'CANCELADO';

export type PaymentMethod = 'cash' | 'nequi';

export interface Order {
  id: string; // PED-YYYYMMDD-XXXX
  createdAt: string;
  customerName: string;
  customerWhatsapp: string;
  customerClassroom: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  totalAmount: number;
  notes: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;   // snapshot
  unitPrice: number;     // snapshot
  unitCost: number;      // snapshot
  quantity: number;
  subtotal: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CreateOrderInput {
  customerName: string;
  customerWhatsapp: string;
  customerClassroom: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDIENTE: 'Pendiente',
  ACEPTADO: 'Aceptado',
  RECHAZADO: 'Rechazado',
  PREPARANDO: 'Preparando',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

export const ORDER_STATUS_FLOW: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDIENTE: ['ACEPTADO', 'RECHAZADO', 'CANCELADO'],
  ACEPTADO: ['PREPARANDO', 'CANCELADO'],
  PREPARANDO: ['LISTO', 'CANCELADO'],
  LISTO: ['ENTREGADO', 'CANCELADO'],
};
