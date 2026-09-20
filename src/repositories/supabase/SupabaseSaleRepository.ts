import { ISaleRepository } from '../interfaces/ISaleRepository';
import { Sale, SaleItem, SaleWithItems } from '@/types/sale';
import { query } from '@/lib/db/supabase/db';
import { generateId } from '@/lib/utils/id-generator';

const toIso = (d: any): string => (d instanceof Date ? d.toISOString() : String(d || ''));

export class SupabaseSaleRepository implements ISaleRepository {
  async findAll(from?: string, to?: string, page?: number, pageSize?: number): Promise<SaleWithItems[]> {
    let sql = `
      SELECT 
        id, 
        order_id as "orderId", 
        created_at as "createdAt", 
        customer_name as "customerName", 
        total_revenue::float as "totalRevenue", 
        total_cost::float as "totalCost", 
        total_profit::float as "totalProfit"
      FROM sales
    `;
    const params: any[] = [];
    let idx = 1;

    if (from && to) {
      sql += ` WHERE created_at >= $${idx++} AND created_at <= $${idx++}`;
      params.push(from, to);
    } else if (from) {
      sql += ` WHERE created_at >= $${idx++}`;
      params.push(from);
    } else if (to) {
      sql += ` WHERE created_at <= $${idx++}`;
      params.push(to);
    }

    sql += ` ORDER BY created_at DESC`;

    if (pageSize) {
      const limit = Math.max(1, Math.min(100, pageSize));
      const p = Math.max(1, page || 1);
      const offset = (p - 1) * limit;
      sql += ` LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(limit, offset);
    }

    const sales = await query(sql, params);
    if (sales.length === 0) return [];

    const saleIds = sales.map(s => s.id);
    const items = await query(
      `SELECT 
        id, 
        sale_id as "saleId", 
        product_id as "productId", 
        product_name as "productName", 
        quantity, 
        unit_price::float as "unitPrice", 
        unit_cost::float as "unitCost", 
        subtotal_revenue::float as "subtotalRevenue", 
        subtotal_cost::float as "subtotalCost", 
        subtotal_profit::float as "subtotalProfit"
       FROM sale_items
       WHERE sale_id = ANY($1)`,
      [saleIds]
    );

    const itemsBySale = new Map<string, SaleItem[]>();
    for (const item of items) {
      const list = itemsBySale.get(item.saleId) || [];
      list.push(item);
      itemsBySale.set(item.saleId, list);
    }

    return sales.map(s => ({
      ...s,
      createdAt: toIso(s.createdAt),
      items: itemsBySale.get(s.id) || [],
    }));
  }

  async findById(id: string): Promise<SaleWithItems | null> {
    const sales = await query(
      `SELECT 
        id, 
        order_id as "orderId", 
        created_at as "createdAt", 
        customer_name as "customerName", 
        total_revenue::float as "totalRevenue", 
        total_cost::float as "totalCost", 
        total_profit::float as "totalProfit"
       FROM sales WHERE id = $1`,
      [id]
    );
    if (sales.length === 0) return null;

    const items = await query(
      `SELECT 
        id, 
        sale_id as "saleId", 
        product_id as "productId", 
        product_name as "productName", 
        quantity, 
        unit_price::float as "unitPrice", 
        unit_cost::float as "unitCost", 
        subtotal_revenue::float as "subtotalRevenue", 
        subtotal_cost::float as "subtotalCost", 
        subtotal_profit::float as "subtotalProfit"
       FROM sale_items WHERE sale_id = $1`,
      [id]
    );

    return {
      ...sales[0],
      createdAt: toIso(sales[0].createdAt),
      items,
    };
  }

  async findByOrderId(orderId: string): Promise<SaleWithItems | null> {
    const sales = await query(
      `SELECT 
        id, 
        order_id as "orderId", 
        created_at as "createdAt", 
        customer_name as "customerName", 
        total_revenue::float as "totalRevenue", 
        total_cost::float as "totalCost", 
        total_profit::float as "totalProfit"
       FROM sales WHERE order_id = $1`,
      [orderId]
    );
    if (sales.length === 0) return null;

    const items = await query(
      `SELECT 
        id, 
        sale_id as "saleId", 
        product_id as "productId", 
        product_name as "productName", 
        quantity, 
        unit_price::float as "unitPrice", 
        unit_cost::float as "unitCost", 
        subtotal_revenue::float as "subtotalRevenue", 
        subtotal_cost::float as "subtotalCost", 
        subtotal_profit::float as "subtotalProfit"
       FROM sale_items WHERE sale_id = $1`,
      [sales[0].id]
    );

    return {
      ...sales[0],
      createdAt: toIso(sales[0].createdAt),
      items,
    };
  }

  async create(
    saleData: Omit<Sale, 'id' | 'createdAt'>,
    itemsData: Omit<SaleItem, 'id' | 'saleId'>[]
  ): Promise<SaleWithItems> {
    const saleId = `sale-${generateId()}`;
    const now = new Date().toISOString();

    const saleRows = await query(
      `INSERT INTO sales (
        id, order_id, customer_name, total_revenue, total_cost, total_profit, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id, order_id as "orderId", created_at as "createdAt", customer_name as "customerName", total_revenue::float as "totalRevenue", total_cost::float as "totalCost", total_profit::float as "totalProfit"`,
      [
        saleId,
        saleData.orderId,
        saleData.customerName,
        saleData.totalRevenue,
        saleData.totalCost,
        saleData.totalProfit,
        now,
      ]
    );

    const createdSale = saleRows[0];
    const createdItems: SaleItem[] = [];

    for (const item of itemsData) {
      const itemId = `sitem-${generateId()}`;
      const itemRows = await query(
        `INSERT INTO sale_items (
          id, sale_id, product_id, product_name, quantity, unit_price, unit_cost, subtotal_revenue, subtotal_cost, subtotal_profit
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING 
          id, sale_id as "saleId", product_id as "productId", product_name as "productName", quantity, unit_price::float as "unitPrice", unit_cost::float as "unitCost", subtotal_revenue::float as "subtotalRevenue", subtotal_cost::float as "subtotalCost", subtotal_profit::float as "subtotalProfit"`,
        [
          itemId,
          createdSale.id,
          item.productId,
          item.productName,
          item.quantity,
          item.unitPrice,
          item.unitCost,
          item.subtotalRevenue,
          item.subtotalCost,
          item.subtotalProfit,
        ]
      );
      createdItems.push(itemRows[0]);
    }

    return {
      ...createdSale,
      createdAt: toIso(createdSale.createdAt),
      items: createdItems,
    };
  }
}
