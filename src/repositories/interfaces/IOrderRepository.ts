import { Order, OrderItem, OrderWithItems, OrderStatus } from '@/types/order';

export interface IOrderRepository {
  findAll(status?: OrderStatus, page?: number, pageSize?: number): Promise<OrderWithItems[]>;
  findById(id: string): Promise<OrderWithItems | null>;
  create(order: Omit<Order, 'createdAt'>, items: Omit<OrderItem, 'id' | 'orderId'>[]): Promise<OrderWithItems>;
  updateStatus(id: string, status: OrderStatus): Promise<Order | null>;
}
