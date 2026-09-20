export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';
export type MovementReason = 'SALE' | 'PURCHASE' | 'ADJUSTMENT' | 'RETURN' | 'INITIAL';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  reason: MovementReason;
  referenceId: string | null;
  notes: string | null;
  createdAt: string;
}

export type CreateInventoryMovementInput = Omit<InventoryMovement, 'id' | 'createdAt'>;
