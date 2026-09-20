import { IProductRepository } from '../interfaces/IProductRepository';
import { Product, CreateProductInput, UpdateProductInput, ProductFilters } from '@/types/product';
import { readJsonFile, writeJsonFile } from '@/lib/db/json/json-client';
import { generateId } from '@/lib/utils/id-generator';

const FILE = 'products.json';

export class JsonProductRepository implements IProductRepository {
  async findAll(filters?: ProductFilters): Promise<Product[]> {
    let products = await readJsonFile<Product[]>(FILE, []);
    
    if (filters) {
      if (filters.isDeleted !== undefined) {
        products = products.filter(p => p.isDeleted === filters.isDeleted);
      } else {
        // By default exclude soft-deleted
        products = products.filter(p => !p.isDeleted);
      }

      if (filters.isActive !== undefined) {
        products = products.filter(p => p.isActive === filters.isActive);
      }

      if (filters.categoryId) {
        products = products.filter(p => p.categoryId === filters.categoryId);
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query)
        );
      }
    } else {
      products = products.filter(p => !p.isDeleted);
    }

    if (filters?.pageSize) {
      const limit = Math.max(1, Math.min(100, filters.pageSize));
      const page = Math.max(1, filters.page || 1);
      const start = (page - 1) * limit;
      return products.slice(start, start + limit);
    }

    return products;
  }

  async findById(id: string): Promise<Product | null> {
    const products = await readJsonFile<Product[]>(FILE, []);
    return products.find(p => p.id === id) || null;
  }

  async create(input: CreateProductInput): Promise<Product> {
    const products = await readJsonFile<Product[]>(FILE, []);
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...input,
      id: `prod-${generateId()}`,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    products.push(newProduct);
    await writeJsonFile(FILE, products);
    return newProduct;
  }

  async update(id: string, input: UpdateProductInput): Promise<Product | null> {
    const products = await readJsonFile<Product[]>(FILE, []);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    await writeJsonFile(FILE, products);
    return products[index];
  }

  async updateStock(id: string, delta: number): Promise<Product | null> {
    const products = await readJsonFile<Product[]>(FILE, []);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const newStock = Math.max(0, products[index].stock + delta);
    products[index] = {
      ...products[index],
      stock: newStock,
      updatedAt: new Date().toISOString(),
    };
    await writeJsonFile(FILE, products);
    return products[index];
  }

  async softDelete(id: string): Promise<boolean> {
    const products = await readJsonFile<Product[]>(FILE, []);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;

    products[index] = {
      ...products[index],
      isDeleted: true,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };
    await writeJsonFile(FILE, products);
    return true;
  }
}
