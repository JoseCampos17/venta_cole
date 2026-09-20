import { Sale, SaleItem, SaleWithItems } from '@/types/sale';

export interface ISaleRepository {
  findAll(from?: string, to?: string, page?: number, pageSize?: number): Promise<SaleWithItems[]>;
  findById(id: string): Promise<SaleWithItems | null>;
  findByOrderId(orderId: string): Promise<SaleWithItems | null>;
  create(sale: Omit<Sale, 'id' | 'createdAt'>, items: Omit<SaleItem, 'id' | 'saleId'>[]): Promise<SaleWithItems>;
}
