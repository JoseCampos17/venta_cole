import { InventoryMovement, CreateInventoryMovementInput } from '@/types/inventory';

export interface IInventoryRepository {
  findAll(productId?: string, page?: number, pageSize?: number): Promise<InventoryMovement[]>;
  create(input: CreateInventoryMovementInput): Promise<InventoryMovement>;
}
