import { ICategoryRepository } from '../interfaces/ICategoryRepository';
import { Category, CreateCategoryInput } from '@/types/category';
import { readJsonFile, writeJsonFile } from '@/lib/db/json/json-client';
import { generateId } from '@/lib/utils/id-generator';

const FILE = 'categories.json';

export class JsonCategoryRepository implements ICategoryRepository {
  async findAll(): Promise<Category[]> {
    return await readJsonFile<Category[]>(FILE, []);
  }

  async findById(id: string): Promise<Category | null> {
    const categories = await readJsonFile<Category[]>(FILE, []);
    return categories.find(c => c.id === id) || null;
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const categories = await readJsonFile<Category[]>(FILE, []);
    const newCategory: Category = {
      ...input,
      id: `cat-${generateId()}`,
      createdAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    await writeJsonFile(FILE, categories);
    return newCategory;
  }

  async update(id: string, input: Partial<CreateCategoryInput>): Promise<Category | null> {
    const categories = await readJsonFile<Category[]>(FILE, []);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    categories[index] = {
      ...categories[index],
      ...input,
    };
    await writeJsonFile(FILE, categories);
    return categories[index];
  }
}
