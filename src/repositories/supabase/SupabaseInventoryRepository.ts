import { IInventoryRepository } from '../interfaces/IInventoryRepository';
import { InventoryMovement, CreateInventoryMovementInput } from '@/types/inventory';
import { query } from '@/lib/db/supabase/db';
import { generateId } from '@/lib/utils/id-generator';

const toIso = (d: any): string => (d instanceof Date ? d.toISOString() : String(d || ''));

export class SupabaseInventoryRepository implements IInventoryRepository {
  async findAll(productId?: string, page?: number, pageSize?: number): Promise<InventoryMovement[]> {
    let sql = `
      SELECT 
        id,
        product_id as "productId",
        product_name as "productName",
        type,
        quantity,
        reason,
        reference_id as "referenceId",
        notes,
        created_at as "createdAt"
      FROM inventory_movements
    `;
    const params: any[] = [];
    let idx = 1;

    if (productId) {
      sql += ` WHERE product_id = $${idx++}`;
      params.push(productId);
    }

    sql += ` ORDER BY created_at DESC`;

    if (pageSize) {
      const limit = Math.max(1, Math.min(100, pageSize));
      const p = Math.max(1, page || 1);
      const offset = (p - 1) * limit;
      sql += ` LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(limit, offset);
    }

    const rows = await query(sql, params);
    return rows.map(r => ({
      ...r,
      createdAt: toIso(r.createdAt),
    }));
  }

  async create(input: CreateInventoryMovementInput): Promise<InventoryMovement> {
    const id = `mov-${generateId()}`;
    const now = new Date().toISOString();

    const rows = await query(
      `INSERT INTO inventory_movements (
        id, product_id, product_name, type, quantity, reason, reference_id, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
        id,
        product_id as "productId",
        product_name as "productName",
        type,
        quantity,
        reason,
        reference_id as "referenceId",
        notes,
        created_at as "createdAt"`,
      [
        id,
        input.productId,
        input.productName,
        input.type,
        input.quantity,
        input.reason,
        input.referenceId || null,
        input.notes || null,
        now,
      ]
    );

    return {
      ...rows[0],
      createdAt: toIso(rows[0].createdAt),
    };
  }
}
