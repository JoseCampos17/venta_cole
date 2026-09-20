import { ISaleRepository } from '../interfaces/ISaleRepository';
import { Sale, SaleItem, SaleWithItems } from '@/types/sale';
import { supabase } from '@/lib/db/supabase/client';
import { generateId } from '@/lib/utils/id-generator';

const mapSaleItem = (row: any): SaleItem => ({
  id: row.id,
  saleId: row.sale_id,
  productId: row.product_id,
  productName: row.product_name,
  quantity: Number(row.quantity),
  unitPrice: Number(row.unit_price),
  unitCost: Number(row.unit_cost || 0),
  subtotalRevenue: Number(row.subtotal_revenue),
  subtotalCost: Number(row.subtotal_cost || 0),
  subtotalProfit: Number(row.subtotal_profit || 0),
});

const mapSale = (row: any, items: SaleItem[] = []): SaleWithItems => ({
  id: row.id,
  orderId: row.order_id,
  customerName: row.customer_name,
  totalRevenue: Number(row.total_revenue),
  totalCost: Number(row.total_cost || 0),
  totalProfit: Number(row.total_profit || 0),
  createdAt: row.created_at,
  items,
});

export class SupabaseSaleRepository implements ISaleRepository {
  async findAll(from?: string, to?: string, page?: number, pageSize?: number): Promise<SaleWithItems[]> {
    let q = supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (from && to) {
      q = q.gte('created_at', from).lte('created_at', to);
    } else if (from) {
      q = q.gte('created_at', from);
    } else if (to) {
      q = q.lte('created_at', to);
    }

    if (pageSize) {
      const limit = Math.max(1, Math.min(100, pageSize));
      const p = Math.max(1, page || 1);
      const start = (p - 1) * limit;
      const end = start + limit - 1;
      q = q.range(start, end);
    }

    const { data: sales, error: salesError } = await q;
    if (salesError) {
      console.error('Error fetching sales from Supabase:', salesError);
      throw salesError;
    }

    if (!sales || sales.length === 0) return [];

    const saleIds = sales.map(s => s.id);
    const { data: items, error: itemsError } = await supabase
      .from('sale_items')
      .select('*')
      .in('sale_id', saleIds);

    if (itemsError) {
      console.error('Error fetching sale items from Supabase:', itemsError);
      throw itemsError;
    }

    const itemsBySale = new Map<string, SaleItem[]>();
    for (const item of items || []) {
      const list = itemsBySale.get(item.sale_id) || [];
      list.push(mapSaleItem(item));
      itemsBySale.set(item.sale_id, list);
    }

    return sales.map(s => mapSale(s, itemsBySale.get(s.id) || []));
  }

  async findById(id: string): Promise<SaleWithItems | null> {
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (saleError || !sale) return null;

    const { data: items } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', id);

    return mapSale(sale, (items || []).map(mapSaleItem));
  }

  async findByOrderId(orderId: string): Promise<SaleWithItems | null> {
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (saleError || !sale) return null;

    const { data: items } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', sale.id);

    return mapSale(sale, (items || []).map(mapSaleItem));
  }

  async create(
    saleData: Omit<Sale, 'id' | 'createdAt'>,
    itemsData: Omit<SaleItem, 'id' | 'saleId'>[]
  ): Promise<SaleWithItems> {
    const saleId = `sale-${generateId()}`;
    const now = new Date().toISOString();

    const { data: createdSale, error: saleError } = await supabase
      .from('sales')
      .insert({
        id: saleId,
        order_id: saleData.orderId,
        customer_name: saleData.customerName,
        total_revenue: saleData.totalRevenue,
        total_cost: saleData.totalCost,
        total_profit: saleData.totalProfit,
        created_at: now,
      })
      .select('*')
      .single();

    if (saleError) {
      console.error('Error creating sale in Supabase:', saleError);
      throw saleError;
    }

    const itemsToInsert = itemsData.map(item => ({
      id: `sitem-${generateId()}`,
      sale_id: createdSale.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      unit_cost: item.unitCost || 0,
      subtotal_revenue: item.subtotalRevenue,
      subtotal_cost: item.subtotalCost || 0,
      subtotal_profit: item.subtotalProfit || 0,
    }));

    let insertedItems: SaleItem[] = [];
    if (itemsToInsert.length > 0) {
      const { data: items, error: itemsError } = await supabase
        .from('sale_items')
        .insert(itemsToInsert)
        .select('*');

      if (itemsError) {
        console.error('Error inserting sale items in Supabase:', itemsError);
        throw itemsError;
      }
      insertedItems = (items || []).map(mapSaleItem);
    }

    return mapSale(createdSale, insertedItems);
  }
}
