import { IProductRepository } from '../interfaces/IProductRepository';
import { Product, CreateProductInput, UpdateProductInput, ProductFilters } from '@/types/product';
import { supabase } from '@/lib/db/supabase/client';
import { generateId } from '@/lib/utils/id-generator';

const mapProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  description: row.description,
  categoryId: row.category_id,
  salePrice: Number(row.sale_price),
  costPrice: Number(row.cost_price),
  stock: Number(row.stock),
  imageUrl: row.image_url || null,
  isActive: Boolean(row.is_active),
  isDeleted: Boolean(row.is_deleted),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class SupabaseProductRepository implements IProductRepository {
  async findAll(filters?: ProductFilters): Promise<Product[]> {
    let q = supabase
      .from('products')
      .select('*')
      .eq('is_deleted', false);

    if (filters) {
      if (filters.isActive !== undefined) {
        q = q.eq('is_active', filters.isActive);
      }
      if (filters.categoryId) {
        q = q.eq('category_id', filters.categoryId);
      }
      if (filters.search) {
        q = q.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
    }

    q = q.order('created_at', { ascending: false });

    if (filters?.pageSize) {
      const limit = Math.max(1, Math.min(100, filters.pageSize));
      const page = Math.max(1, filters.page || 1);
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      q = q.range(from, to);
    }

    const { data, error } = await q;
    if (error) {
      console.error('Error fetching products from Supabase:', error);
      throw error;
    }

    return (data || []).map(mapProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .maybeSingle();

    if (error || !data) return null;
    return mapProduct(data);
  }

  async create(input: CreateProductInput): Promise<Product> {
    const id = `prod-${generateId()}`;
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('products')
      .insert({
        id,
        name: input.name,
        description: input.description,
        category_id: input.categoryId,
        sale_price: input.salePrice,
        cost_price: input.costPrice,
        stock: input.stock,
        image_url: input.imageUrl || null,
        is_active: input.isActive,
        is_deleted: false,
        created_at: now,
        updated_at: now,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating product in Supabase:', error);
      throw error;
    }

    return mapProduct(data);
  }

  async update(id: string, input: UpdateProductInput): Promise<Product | null> {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.categoryId !== undefined) updateData.category_id = input.categoryId;
    if (input.salePrice !== undefined) updateData.sale_price = input.salePrice;
    if (input.costPrice !== undefined) updateData.cost_price = input.costPrice;
    if (input.stock !== undefined) updateData.stock = input.stock;
    if (input.imageUrl !== undefined) updateData.image_url = input.imageUrl;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('is_deleted', false)
      .select('*')
      .maybeSingle();

    if (error || !data) return null;
    return mapProduct(data);
  }

  async updateStock(id: string, delta: number): Promise<Product | null> {
    const current = await this.findById(id);
    if (!current) return null;

    const newStock = Math.max(0, current.stock + delta);
    return await this.update(id, { stock: newStock });
  }

  async softDelete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .update({ is_deleted: true, is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  }
}
