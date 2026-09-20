import { getInventoryRepository, getProductRepository } from '@/lib/db/provider';
import { InventoryMovement, CreateInventoryMovementInput } from '@/types/inventory';
import { ServiceError } from '@/lib/utils/errors';

export class InventoryService {
  async getMovements(productId?: string, page?: number, pageSize?: number): Promise<InventoryMovement[]> {
    const inventoryRepo = getInventoryRepository();
    return await inventoryRepo.findAll(productId, page, pageSize);
  }

  async addMovement(input: CreateInventoryMovementInput): Promise<InventoryMovement> {
    const productRepo = getProductRepository();
    const inventoryRepo = getInventoryRepository();

    const product = await productRepo.findById(input.productId);
    if (!product) {
      throw new ServiceError({ type: 'NOT_FOUND', message: 'Producto no encontrado' });
    }

    const delta = input.type === 'OUT' ? -Math.abs(input.quantity) : Math.abs(input.quantity);

    if (input.type === 'OUT' && product.stock < Math.abs(input.quantity)) {
      throw new ServiceError({
        type: 'INSUFFICIENT_STOCK',
        message: `No hay suficiente stock. Stock actual: ${product.stock}`,
      });
    }

    await productRepo.updateStock(input.productId, delta);
    return await inventoryRepo.create(input);
  }
}
