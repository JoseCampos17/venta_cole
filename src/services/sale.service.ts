import { getSaleRepository } from '@/lib/db/provider';
import { SaleWithItems } from '@/types/sale';
import { ServiceError } from '@/lib/utils/errors';

export class SaleService {
  async getSales(from?: string, to?: string, page?: number, pageSize?: number): Promise<SaleWithItems[]> {
    const saleRepo = getSaleRepository();
    return await saleRepo.findAll(from, to, page, pageSize);
  }

  async getSaleById(id: string): Promise<SaleWithItems> {
    const saleRepo = getSaleRepository();
    const sale = await saleRepo.findById(id);
    if (!sale) {
      throw new ServiceError({ type: 'NOT_FOUND', message: 'Venta no encontrada' });
    }
    return sale;
  }
}
