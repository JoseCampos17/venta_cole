export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  subtotalRevenue: number;
  subtotalCost: number;
  subtotalProfit: number;
}

export interface Sale {
  id: string;
  orderId: string;
  createdAt: string;
  customerName: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}

export interface SaleWithItems extends Sale {
  items: SaleItem[];
}
