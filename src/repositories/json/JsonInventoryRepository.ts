import { IInventoryRepository } from '../interfaces/IInventoryRepository';
import { InventoryMovement, CreateInventoryMovementInput } from '@/types/inventory';
import { readJsonFile, writeJsonFile } from '@/lib/db/json/json-client';
import { generateId } from '@/lib/utils/id-generator';

const FILE = 'inventory-movements.json';

export class JsonInventoryRepository implements IInventoryRepository {
  async findAll(productId?: string, page?: number, pageSize?: number): Promise<InventoryMovement[]> {
    let movements = await readJsonFile<InventoryMovement[]>(FILE, []);
    if (productId) {
      movements = movements.filter(m => m.productId === productId);
    }
    movements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (pageSize) {
      const limit = Math.max(1, Math.min(100, pageSize));
      const p = Math.max(1, page || 1);
      const start = (p - 1) * limit;
      movements = movements.slice(start, start + limit);
    }

    return movements;
  }

  async create(input: CreateInventoryMovementInput): Promise<InventoryMovement> {
    const movements = await readJsonFile<InventoryMovement[]>(FILE, []);
    const newMovement: InventoryMovement = {
      ...input,
      id: `mov-${generateId()}`,
      createdAt: new Date().toISOString(),
    };
    movements.push(newMovement);
    await writeJsonFile(FILE, movements);
    return newMovement;
  }
}
