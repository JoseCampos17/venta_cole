import { getProductRepository, getCategoryRepository, getInventoryRepository } from '@/lib/db/provider';
import { Product, CreateProductInput, UpdateProductInput, ProductFilters, ProductWithCategory } from '@/types/product';
import { ServiceError } from '@/lib/utils/errors';

export class ProductService {
  private productRepo = getProductRepository();
  private categoryRepo = getCategoryRepository();
  private inventoryRepo = getInventoryRepository();

  async getProducts(filters?: ProductFilters): Promise<ProductWithCategory[]> {
    const [products, categories] = await Promise.all([
      this.productRepo.findAll(filters),
      this.categoryRepo.findAll(),
    ]);

    const catMap = new Map(categories.map(c => [c.id, c]));

    return products.map(p => ({
      ...p,
      category: catMap.get(p.categoryId) ?? {
        id: p.categoryId,
        name: 'Sin categoría',
        slug: 'sin-categoria',
      },
    }));
  }

  async getProductById(id: string): Promise<ProductWithCategory> {
    const product = await this.productRepo.findById(id);
    if (!product || product.isDeleted) {
      throw new ServiceError({ type: 'NOT_FOUND', message: 'Producto no encontrado' });
    }

    const category = await this.categoryRepo.findById(product.categoryId);
    return {
      ...product,
      category: category ?? {
        id: product.categoryId,
        name: 'Sin categoría',
        slug: 'sin-categoria',
      },
    };
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    if (input.salePrice < 0 || input.costPrice < 0) {
      throw new ServiceError({
        type: 'VALIDATION',
        message: 'Los precios y costos no pueden ser negativos',
      });
    }

    const product = await this.productRepo.create(input);

    if (input.stock > 0) {
      await this.inventoryRepo.create({
        productId: product.id,
        productName: product.name,
        type: 'IN',
        quantity: input.stock,
        reason: 'INITIAL',
        referenceId: null,
        notes: 'Inventario inicial al crear producto',
      });
    }

    return product;
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    const existing = await this.productRepo.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ServiceError({ type: 'NOT_FOUND', message: 'Producto no encontrado' });
    }

    // Check if stock changed directly in form
    if (input.stock !== undefined && input.stock !== existing.stock) {
      const diff = input.stock - existing.stock;
      await this.inventoryRepo.create({
        productId: id,
        productName: input.name ?? existing.name,
        type: diff > 0 ? 'IN' : 'OUT',
        quantity: Math.abs(diff),
        reason: 'ADJUSTMENT',
        referenceId: null,
        notes: `Ajuste manual de stock de ${existing.stock} a ${input.stock}`,
      });
    }

    const updated = await this.productRepo.update(id, input);
    if (!updated) {
      throw new ServiceError({ type: 'INTERNAL', message: 'No se pudo actualizar el producto' });
    }
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    const existing = await this.productRepo.findById(id);
    if (!existing) {
      throw new ServiceError({ type: 'NOT_FOUND', message: 'Producto no encontrado' });
    }
    await this.productRepo.softDelete(id);
  }
}
