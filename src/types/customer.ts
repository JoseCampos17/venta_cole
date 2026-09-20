import { OrderWithItems } from './order';

export interface CustomerSummary {
  whatsapp: string;
  name: string;
  classroom: string;
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: {
    id: string;
    createdAt: string;
    totalAmount: number;
    status: string;
    itemsCount: number;
  }[];
}
