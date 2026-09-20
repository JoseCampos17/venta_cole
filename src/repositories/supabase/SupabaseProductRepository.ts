import { IProductRepository } from '../interfaces/IProductRepository';
import { Product, CreateProductInput, UpdateProductInput, ProductFilters } from '@/types/product';
import { query } from '@/lib/db/supabase/db';
import { generateId } from '@/lib/utils/id-generator';

const toIso = (d: any): string => (d instanceof Date ? d.toISOString() : String(d || ''));

const mapProduct = (row: any): Product => ({
  ...row,
  createdAt: toIso(row.createdAt),
  updatedAt: toIso(row.updatedAt),
});

export class SupabaseProductRepository implements IProductRepository {
  async findAll(filters?: ProductFilters): Promise<Product[]> {
    let sql = `
      SELECT 
        id, 
        name, 
        description, 
        category_id as "categoryId", 
        sale_price::float as "salePrice", 
        cost_price::float as "costPrice", 
        stock, 
        image_url as "imageUrl", 
        is_active as "isActive", 
        is_deleted as "isDeleted", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM products
      WHERE is_deleted = false
    `;
    const params: any[] = [];
    let idx = 1;

    if (filters) {
      if (filters.isActive !== undefined) {
        sql += ` AND is_active = $${idx++}`;
        params.push(filters.isActive);
      }
      if (filters.categoryId) {
        sql += ` AND category_id = $${idx++}`;
        params.push(filters.categoryId);
      }
      if (filters.search) {
        sql += ` AND (name ILIKE $${idx} OR description ILIKE $${idx})`;
        params.push(`%${filters.search}%`);
        idx++;
      }
    }

    sql += ` ORDER BY created_at DESC`;

    // Backend SQL pagination
    if (filters?.pageSize) {
      const limit = Math.max(1, Math.min(100, filters.pageSize));
      const page = Math.max(1, filters.page || 1);
      const offset = (page - 1) * limit;
      sql += ` LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(limit, offset);
    }

    const rows = await query(sql, params);
    return rows.map(mapProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const rows = await query(
      `SELECT 
        id, 
        name, 
        description, 
        category_id as "categoryId", 
        sale_price::float as "salePrice", 
        cost_price::float as "costPrice", 
        stock, 
        image_url as "imageUrl", 
        is_active as "isActive", 
        is_deleted as "isDeleted", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM products 
      WHERE id = $1 AND is_deleted = false`,
      [id]
    );
    return rows[0] ? mapProduct(rows[0]) : null;
  }

  async create(input: CreateProductInput): Promise<Product> {
    const id = `prod-${generateId()}`;
    const now = new Date().toISOString();

    const rows = await query(
      `INSERT INTO products (
        id, name, description, category_id, sale_price, cost_price, stock, image_url, is_active, is_deleted, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, $10, $10)
      RETURNING 
        id, 
        name, 
        description, 
        category_id as "categoryId", 
        sale_price::float as "salePrice", 
        cost_price::float as "costPrice", 
        stock, 
        image_url as "imageUrl", 
        is_active as "isActive", 
        is_deleted as "isDeleted", 
        created_at as "createdAt", 
        updated_at as "updatedAt"`,
      [
        id,
        input.name,
        input.description,
        input.categoryId,
        input.salePrice,
        input.costPrice,
        input.stock,
        input.imageUrl,
        input.isActive,
        now,
      ]
    );
    return mapProduct(rows[0]);
  }

  async update(id: string, input: UpdateProductInput): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(input.name);
    }
    if (input.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(input.description);
    }
    if (input.categoryId !== undefined) {
      fields.push(`category_id = $${idx++}`);
      values.push(input.categoryId);
    }
    if (input.salePrice !== undefined) {
      fields.push(`sale_price = $${idx++}`);
      values.push(input.salePrice);
    }
    if (input.costPrice !== undefined) {
      fields.push(`cost_price = $${idx++}`);
      values.push(input.costPrice);
    }
    if (input.stock !== undefined) {
      fields.push(`stock = $${idx++}`);
      values.push(input.stock);
    }
    if (input.imageUrl !== undefined) {
      fields.push(`image_url = $${idx++}`);
      values.push(input.imageUrl);
    }
    if (input.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(input.isActive);
    }

    fields.push(`updated_at = $${idx++}`);
    values.push(new Date().toISOString());

    values.push(id);

    const rows = await query(
      `UPDATE products SET ${fields.join(', ')}
       WHERE id = $${idx} AND is_deleted = false
       RETURNING 
        id, 
        name, 
        description, 
        category_id as "categoryId", 
        sale_price::float as "salePrice", 
        cost_price::float as "costPrice", 
        stock, 
        image_url as "imageUrl", 
        is_active as "isActive", 
        is_deleted as "isDeleted", 
        created_at as "createdAt", 
        updated_at as "updatedAt"`,
      values
    );
    return rows[0] ? mapProduct(rows[0]) : null;
  }

  async updateStock(id: string, delta: number): Promise<Product | null> {
    const rows = await query(
      `UPDATE products 
       SET stock = GREATEST(0, stock + $1), updated_at = NOW()
       WHERE id = $2 AND is_deleted = false
       RETURNING 
        id, 
        name, 
        description, 
        category_id as "categoryId", 
        sale_price::float as "salePrice", 
        cost_price::float as "costPrice", 
        stock, 
        image_url as "imageUrl", 
        is_active as "isActive", 
        is_deleted as "isDeleted", 
        created_at as "createdAt", 
        updated_at as "updatedAt"`,
      [delta, id]
    );
    return rows[0] ? mapProduct(rows[0]) : null;
  }

  async softDelete(id: string): Promise<boolean> {
    const rows = await query(
      `UPDATE products 
       SET is_deleted = true, is_active = false, updated_at = NOW()
       WHERE id = $1 RETURNING id`,
      [id]
    );
    return rows.length > 0;
  }
}
