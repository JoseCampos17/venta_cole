import { Product, CreateProductInput, UpdateProductInput, ProductFilters } from '@/types/product';

export interface IProductRepository {
  findAll(filters?: ProductFilters): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(input: CreateProductInput): Promise<Product>;
  update(id: string, input: UpdateProductInput): Promise<Product | null>;
  updateStock(id: string, delta: number): Promise<Product | null>;
  softDelete(id: string): Promise<boolean>;
}
