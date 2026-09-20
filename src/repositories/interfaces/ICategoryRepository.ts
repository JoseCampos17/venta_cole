import { Category, CreateCategoryInput } from '@/types/category';

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  create(input: CreateCategoryInput): Promise<Category>;
  update(id: string, input: Partial<CreateCategoryInput>): Promise<Category | null>;
}
