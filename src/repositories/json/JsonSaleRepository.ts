import { ISaleRepository } from '../interfaces/ISaleRepository';
import { Sale, SaleItem, SaleWithItems } from '@/types/sale';
import { readJsonFile, writeJsonFile } from '@/lib/db/json/json-client';
import { generateId } from '@/lib/utils/id-generator';

const SALES_FILE = 'sales.json';
const SALE_ITEMS_FILE = 'sale-items.json';

export class JsonSaleRepository implements ISaleRepository {
  async findAll(from?: string, to?: string, page?: number, pageSize?: number): Promise<SaleWithItems[]> {
    let sales = await readJsonFile<Sale[]>(SALES_FILE, []);
    const saleItems = await readJsonFile<SaleItem[]>(SALE_ITEMS_FILE, []);

    if (from) {
      sales = sales.filter(s => new Date(s.createdAt) >= new Date(from));
    }
    if (to) {
      sales = sales.filter(s => new Date(s.createdAt) <= new Date(to));
    }

    sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (pageSize) {
      const limit = Math.max(1, Math.min(100, pageSize));
      const p = Math.max(1, page || 1);
      const start = (p - 1) * limit;
      sales = sales.slice(start, start + limit);
    }

    return sales.map(sale => ({
      ...sale,
      items: saleItems.filter(item => item.saleId === sale.id),
    }));
  }

  async findById(id: string): Promise<SaleWithItems | null> {
    const sales = await readJsonFile<Sale[]>(SALES_FILE, []);
    const sale = sales.find(s => s.id === id);
    if (!sale) return null;

    const saleItems = await readJsonFile<SaleItem[]>(SALE_ITEMS_FILE, []);
    return {
      ...sale,
      items: saleItems.filter(item => item.saleId === sale.id),
    };
  }

  async findByOrderId(orderId: string): Promise<SaleWithItems | null> {
    const sales = await readJsonFile<Sale[]>(SALES_FILE, []);
    const sale = sales.find(s => s.orderId === orderId);
    if (!sale) return null;

    const saleItems = await readJsonFile<SaleItem[]>(SALE_ITEMS_FILE, []);
    return {
      ...sale,
      items: saleItems.filter(item => item.saleId === sale.id),
    };
  }

  async create(
    saleData: Omit<Sale, 'id' | 'createdAt'>,
    itemsData: Omit<SaleItem, 'id' | 'saleId'>[]
  ): Promise<SaleWithItems> {
    const sales = await readJsonFile<Sale[]>(SALES_FILE, []);
    const saleItems = await readJsonFile<SaleItem[]>(SALE_ITEMS_FILE, []);

    const newSale: Sale = {
      ...saleData,
      id: `sale-${generateId()}`,
      createdAt: new Date().toISOString(),
    };

    const newItems: SaleItem[] = itemsData.map(item => ({
      ...item,
      id: `sitem-${generateId()}`,
      saleId: newSale.id,
    }));

    sales.push(newSale);
    saleItems.push(...newItems);

    await writeJsonFile(SALES_FILE, sales);
    await writeJsonFile(SALE_ITEMS_FILE, saleItems);

    return {
      ...newSale,
      items: newItems,
    };
  }
}
