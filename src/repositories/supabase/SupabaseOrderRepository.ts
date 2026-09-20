import { IOrderRepository } from '../interfaces/IOrderRepository';
import { Order, OrderItem, OrderWithItems, OrderStatus } from '@/types/order';
import { supabase } from '@/lib/db/supabase/client';

const mapOrderItem = (row: any): OrderItem => ({
  id: row.id,
  orderId: row.order_id,
  productId: row.product_id,
  productName: row.product_name,
  unitPrice: Number(row.unit_price),
  unitCost: Number(row.unit_cost || 0),
  quantity: Number(row.quantity),
  subtotal: Number(row.subtotal),
});

const mapOrder = (row: any, items: OrderItem[] = []): OrderWithItems => ({
  id: row.id,
  customerName: row.customer_name,
  customerWhatsapp: row.customer_whatsapp,
  customerClassroom: row.customer_classroom,
  deliveryDate: row.delivery_date,
  deliveryTime: row.delivery_time,
  paymentMethod: row.payment_method,
  status: row.status as OrderStatus,
  totalAmount: Number(row.total_amount),
  notes: row.notes || null,
  createdAt: row.created_at,
  items,
});

export class SupabaseOrderRepository implements IOrderRepository {
  async findAll(status?: OrderStatus, page?: number, pageSize?: number): Promise<OrderWithItems[]> {
    let q = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      q = q.eq('status', status);
    }

    if (pageSize) {
      const limit = Math.max(1, Math.min(100, pageSize));
      const p = Math.max(1, page || 1);
      const from = (p - 1) * limit;
      const to = from + limit - 1;
      q = q.range(from, to);
    }

    const { data: orders, error: ordersError } = await q;
    if (ordersError) {
      console.error('Error fetching orders from Supabase:', ordersError);
      throw ordersError;
    }

    if (!orders || orders.length === 0) return [];

    const orderIds = orders.map(o => o.id);
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    if (itemsError) {
      console.error('Error fetching order items from Supabase:', itemsError);
      throw itemsError;
    }

    const itemsByOrder = new Map<string, OrderItem[]>();
    for (const item of items || []) {
      const list = itemsByOrder.get(item.order_id) || [];
      list.push(mapOrderItem(item));
      itemsByOrder.set(item.order_id, list);
    }

    return orders.map(o => mapOrder(o, itemsByOrder.get(o.id) || []));
  }

  async findById(id: string): Promise<OrderWithItems | null> {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (orderError || !order) return null;

    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    return mapOrder(order, (items || []).map(mapOrderItem));
  }

  async create(
    orderData: Omit<Order, 'createdAt'>,
    itemsData: Omit<OrderItem, 'id' | 'orderId'>[]
  ): Promise<OrderWithItems> {
    const now = new Date().toISOString();

    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderData.id,
        customer_name: orderData.customerName,
        customer_whatsapp: orderData.customerWhatsapp,
        customer_classroom: orderData.customerClassroom,
        delivery_date: orderData.deliveryDate,
        delivery_time: orderData.deliveryTime,
        payment_method: orderData.paymentMethod,
        status: orderData.status,
        total_amount: orderData.totalAmount,
        notes: orderData.notes || null,
        created_at: now,
      })
      .select('*')
      .single();

    if (orderError) {
      console.error('Error inserting order in Supabase:', orderError);
      throw orderError;
    }

    const itemsToInsert = itemsData.map(item => ({
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      order_id: createdOrder.id,
      product_id: item.productId,
      product_name: item.productName,
      unit_price: item.unitPrice,
      unit_cost: item.unitCost || 0,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    let insertedItems: OrderItem[] = [];
    if (itemsToInsert.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert)
        .select('*');

      if (itemsError) {
        console.error('Error inserting order items in Supabase:', itemsError);
        throw itemsError;
      }
      insertedItems = (items || []).map(mapOrderItem);
    }

    return mapOrder(createdOrder, insertedItems);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error || !data) return null;
    return mapOrder(data);
  }
}
