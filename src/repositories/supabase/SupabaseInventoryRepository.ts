import { IInventoryRepository } from '../interfaces/IInventoryRepository';
import { InventoryMovement, CreateInventoryMovementInput } from '@/types/inventory';
import { supabase } from '@/lib/db/supabase/client';
import { generateId } from '@/lib/utils/id-generator';

export class SupabaseInventoryRepository implements IInventoryRepository {
  async findAll(productId?: string, page?: number, pageSize?: number): Promise<InventoryMovement[]> {
    let q = supabase
      .from('inventory_movements')
      .select('*')
      .order('created_at', { ascending: false });

    if (productId) {
      q = q.eq('product_id', productId);
    }

    if (pageSize) {
      const limit = Math.max(1, Math.min(100, pageSize));
      const p = Math.max(1, page || 1);
      const start = (p - 1) * limit;
      const end = start + limit - 1;
      q = q.range(start, end);
    }

    const { data, error } = await q;
    if (error) {
      console.error('Error fetching inventory movements from Supabase:', error);
      throw error;
    }

    return (data || []).map(r => ({
      id: r.id,
      productId: r.product_id,
      productName: r.product_name,
      type: r.type,
      quantity: Number(r.quantity),
      reason: r.reason,
      referenceId: r.reference_id || null,
      notes: r.notes || null,
      createdAt: r.created_at,
    }));
  }

  async create(input: CreateInventoryMovementInput): Promise<InventoryMovement> {
    const id = `mov-${generateId()}`;
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('inventory_movements')
      .insert({
        id,
        product_id: input.productId,
        product_name: input.productName,
        type: input.type,
        quantity: input.quantity,
        reason: input.reason,
        reference_id: input.referenceId || null,
        notes: input.notes || null,
        created_at: now,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating inventory movement in Supabase:', error);
      throw error;
    }

    return {
      id: data.id,
      productId: data.product_id,
      productName: data.product_name,
      type: data.type,
      quantity: Number(data.quantity),
      reason: data.reason,
      referenceId: data.reference_id || null,
      notes: data.notes || null,
      createdAt: data.created_at,
    };
  }
}
