import { ICategoryRepository } from '../interfaces/ICategoryRepository';
import { Category, CreateCategoryInput } from '@/types/category';
import { supabase } from '@/lib/db/supabase/client';
import { generateId } from '@/lib/utils/id-generator';

export class SupabaseCategoryRepository implements ICategoryRepository {
  async findAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, is_active, created_at')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories from Supabase:', error);
      throw error;
    }

    return (data || []).map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      isActive: r.is_active,
      createdAt: r.created_at,
    }));
  }

  async findById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, is_active, created_at')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const id = `cat-${generateId()}`;
    const { data, error } = await supabase
      .from('categories')
      .insert({
        id,
        name: input.name,
        slug: input.slug,
        is_active: input.isActive,
      })
      .select('id, name, slug, is_active, created_at')
      .single();

    if (error) {
      console.error('Error creating category in Supabase:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  }

  async update(id: string, input: Partial<CreateCategoryInput>): Promise<Category | null> {
    const updateData: Record<string, any> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.isActive !== undefined) updateData.is_active = input.isActive;

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select('id, name, slug, is_active, created_at')
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  }
}
