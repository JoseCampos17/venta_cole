import { ICategoryRepository } from '../interfaces/ICategoryRepository';
import { Category, CreateCategoryInput } from '@/types/category';
import { query } from '@/lib/db/supabase/db';
import { generateId } from '@/lib/utils/id-generator';

const toIso = (d: any): string => (d instanceof Date ? d.toISOString() : String(d || ''));

export class SupabaseCategoryRepository implements ICategoryRepository {
  async findAll(): Promise<Category[]> {
    const rows = await query(`
      SELECT id, name, slug, is_active as "isActive", created_at as "createdAt"
      FROM categories
      ORDER BY name ASC
    `);
    return rows.map(r => ({
      ...r,
      createdAt: toIso(r.createdAt),
    }));
  }

  async findById(id: string): Promise<Category | null> {
    const rows = await query(
      `SELECT id, name, slug, is_active as "isActive", created_at as "createdAt"
       FROM categories WHERE id = $1`,
      [id]
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      createdAt: toIso(rows[0].createdAt),
    };
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const id = `cat-${generateId()}`;
    const rows = await query(
      `INSERT INTO categories (id, name, slug, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, slug, is_active as "isActive", created_at as "createdAt"`,
      [id, input.name, input.slug, input.isActive]
    );
    return {
      ...rows[0],
      createdAt: toIso(rows[0].createdAt),
    };
  }

  async update(id: string, input: Partial<CreateCategoryInput>): Promise<Category | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(input.name);
    }
    if (input.slug !== undefined) {
      fields.push(`slug = $${idx++}`);
      values.push(input.slug);
    }
    if (input.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(input.isActive);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const rows = await query(
      `UPDATE categories SET ${fields.join(', ')}
       WHERE id = $${idx}
       RETURNING id, name, slug, is_active as "isActive", created_at as "createdAt"`,
      values
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      createdAt: toIso(rows[0].createdAt),
    };
  }
}
