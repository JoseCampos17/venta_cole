import { IOrderRepository } from '../interfaces/IOrderRepository';
import { Order, OrderItem, OrderWithItems, OrderStatus } from '@/types/order';
import { readJsonFile, writeJsonFile } from '@/lib/db/json/json-client';
import { generateId } from '@/lib/utils/id-generator';

const ORDERS_FILE = 'orders.json';
const ORDER_ITEMS_FILE = 'order-items.json';

export class JsonOrderRepository implements IOrderRepository {
  async findAll(status?: OrderStatus, page?: number, pageSize?: number): Promise<OrderWithItems[]> {
    let orders = await readJsonFile<Order[]>(ORDERS_FILE, []);
    const orderItems = await readJsonFile<OrderItem[]>(ORDER_ITEMS_FILE, []);

    if (status) {
      orders = orders.filter(o => o.status === status);
    }

    // Sort newest first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (pageSize) {
      const limit = Math.max(1, Math.min(100, pageSize));
      const p = Math.max(1, page || 1);
      const start = (p - 1) * limit;
      orders = orders.slice(start, start + limit);
    }

    return orders.map(order => ({
      ...order,
      items: orderItems.filter(item => item.orderId === order.id),
    }));
  }

  async findById(id: string): Promise<OrderWithItems | null> {
    const orders = await readJsonFile<Order[]>(ORDERS_FILE, []);
    const order = orders.find(o => o.id === id);
    if (!order) return null;

    const orderItems = await readJsonFile<OrderItem[]>(ORDER_ITEMS_FILE, []);
    return {
      ...order,
      items: orderItems.filter(item => item.orderId === order.id),
    };
  }

  async create(
    orderData: Omit<Order, 'createdAt'>,
    itemsData: Omit<OrderItem, 'id' | 'orderId'>[]
  ): Promise<OrderWithItems> {
    const orders = await readJsonFile<Order[]>(ORDERS_FILE, []);
    const orderItems = await readJsonFile<OrderItem[]>(ORDER_ITEMS_FILE, []);

    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      createdAt: now,
    };

    const newItems: OrderItem[] = itemsData.map(item => ({
      ...item,
      id: `item-${generateId()}`,
      orderId: newOrder.id,
    }));

    orders.push(newOrder);
    orderItems.push(...newItems);

    await writeJsonFile(ORDERS_FILE, orders);
    await writeJsonFile(ORDER_ITEMS_FILE, orderItems);

    return {
      ...newOrder,
      items: newItems,
    };
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const orders = await readJsonFile<Order[]>(ORDERS_FILE, []);
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return null;

    orders[index] = {
      ...orders[index],
      status,
    };

    await writeJsonFile(ORDERS_FILE, orders);
    return orders[index];
  }
}
