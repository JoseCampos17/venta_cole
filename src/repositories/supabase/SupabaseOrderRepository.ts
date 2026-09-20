import { IOrderRepository } from '../interfaces/IOrderRepository';
import { Order, OrderItem, OrderWithItems, OrderStatus } from '@/types/order';
import { query } from '@/lib/db/supabase/db';

const toIso = (d: any): string => (d instanceof Date ? d.toISOString() : String(d || ''));

export class SupabaseOrderRepository implements IOrderRepository {
  async findAll(status?: OrderStatus, page?: number, pageSize?: number): Promise<OrderWithItems[]> {
    let sql = `
      SELECT 
        id, 
        created_at as "createdAt", 
        customer_name as "customerName", 
        customer_whatsapp as "customerWhatsapp", 
        customer_classroom as "customerClassroom", 
        delivery_date as "deliveryDate", 
        delivery_time as "deliveryTime", 
        payment_method as "paymentMethod", 
        status, 
        total_amount::float as "totalAmount", 
        notes
      FROM orders
    `;
    const params: any[] = [];
    let idx = 1;

    if (status) {
      sql += ` WHERE status = $${idx++}`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC`;

    if (pageSize) {
      const limit = Math.max(1, Math.min(100, pageSize));
      const p = Math.max(1, page || 1);
      const offset = (p - 1) * limit;
      sql += ` LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(limit, offset);
    }

    const orders = await query(sql, params);
    if (orders.length === 0) return [];

    const orderIds = orders.map(o => o.id);
    const items = await query(
      `SELECT 
        id, 
        order_id as "orderId", 
        product_id as "productId", 
        product_name as "productName", 
        unit_price::float as "unitPrice", 
        unit_cost::float as "unitCost", 
        quantity, 
        subtotal::float as "subtotal"
       FROM order_items
       WHERE order_id = ANY($1)`,
      [orderIds]
    );

    const itemsByOrder = new Map<string, OrderItem[]>();
    for (const item of items) {
      const list = itemsByOrder.get(item.orderId) || [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    return orders.map(o => ({
      ...o,
      createdAt: toIso(o.createdAt),
      items: itemsByOrder.get(o.id) || [],
    }));
  }

  async findById(id: string): Promise<OrderWithItems | null> {
    const orders = await query(
      `SELECT 
        id, 
        created_at as "createdAt", 
        customer_name as "customerName", 
        customer_whatsapp as "customerWhatsapp", 
        customer_classroom as "customerClassroom", 
        delivery_date as "deliveryDate", 
        delivery_time as "deliveryTime", 
        payment_method as "paymentMethod", 
        status, 
        total_amount::float as "totalAmount", 
        notes
       FROM orders WHERE id = $1`,
      [id]
    );
    if (orders.length === 0) return null;

    const items = await query(
      `SELECT 
        id, 
        order_id as "orderId", 
        product_id as "productId", 
        product_name as "productName", 
        unit_price::float as "unitPrice", 
        unit_cost::float as "unitCost", 
        quantity, 
        subtotal::float as "subtotal"
       FROM order_items WHERE order_id = $1`,
      [id]
    );

    return {
      ...orders[0],
      createdAt: toIso(orders[0].createdAt),
      items,
    };
  }

  async create(
    orderData: Omit<Order, 'createdAt'>,
    itemsData: Omit<OrderItem, 'id' | 'orderId'>[]
  ): Promise<OrderWithItems> {
    const now = new Date().toISOString();

    const orderRows = await query(
      `INSERT INTO orders (
        id, customer_name, customer_whatsapp, customer_classroom, delivery_date, delivery_time, payment_method, status, total_amount, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING 
        id, created_at as "createdAt", customer_name as "customerName", customer_whatsapp as "customerWhatsapp", customer_classroom as "customerClassroom", delivery_date as "deliveryDate", delivery_time as "deliveryTime", payment_method as "paymentMethod", status, total_amount::float as "totalAmount", notes`,
      [
        orderData.id,
        orderData.customerName,
        orderData.customerWhatsapp,
        orderData.customerClassroom,
        orderData.deliveryDate,
        orderData.deliveryTime,
        orderData.paymentMethod,
        orderData.status,
        orderData.totalAmount,
        orderData.notes,
        now,
      ]
    );

    const createdOrder = orderRows[0];
    const createdItems: OrderItem[] = [];

    for (const item of itemsData) {
      const itemId = `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const itemRows = await query(
        `INSERT INTO order_items (
          id, order_id, product_id, product_name, unit_price, unit_cost, quantity, subtotal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING 
          id, order_id as "orderId", product_id as "productId", product_name as "productName", unit_price::float as "unitPrice", unit_cost::float as "unitCost", quantity, subtotal::float as "subtotal"`,
        [
          itemId,
          createdOrder.id,
          item.productId,
          item.productName,
          item.unitPrice,
          item.unitCost,
          item.quantity,
          item.subtotal,
        ]
      );
      createdItems.push(itemRows[0]);
    }

    return {
      ...createdOrder,
      createdAt: toIso(createdOrder.createdAt),
      items: createdItems,
    };
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const rows = await query(
      `UPDATE orders SET status = $1 WHERE id = $2
       RETURNING 
        id, created_at as "createdAt", customer_name as "customerName", customer_whatsapp as "customerWhatsapp", customer_classroom as "customerClassroom", delivery_date as "deliveryDate", delivery_time as "deliveryTime", payment_method as "paymentMethod", status, total_amount::float as "totalAmount", notes`,
      [status, id]
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      createdAt: toIso(rows[0].createdAt),
    };
  }
}
