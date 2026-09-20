import {
  getSaleRepository,
  getOrderRepository,
  getProductRepository,
} from '@/lib/db/provider';
import { DashboardStats, TopProduct, SalesChartPoint, StatsPeriod } from '@/types/dashboard';
import { startOfDay, startOfWeek, startOfMonth, subMonths, format, parseISO } from 'date-fns';
import { LOW_STOCK_THRESHOLD } from '@/config/constants';

const safeParseDate = (dateVal: string | Date): Date => {
  if (dateVal instanceof Date) return dateVal;
  try {
    return parseISO(dateVal);
  } catch {
    return new Date(dateVal);
  }
};

export class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const saleRepo = getSaleRepository();
    const orderRepo = getOrderRepository();
    const productRepo = getProductRepository();

    const now = new Date();
    const todayStart = startOfDay(now).getTime();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }).getTime();
    const monthStart = startOfMonth(now);
    const monthStartIso = monthStart.toISOString();
    const monthStartTime = monthStart.getTime();

    // Query sales only from monthStart to avoid pulling all historical sales into memory
    const [sales, orders, products] = await Promise.all([
      saleRepo.findAll(monthStartIso),
      orderRepo.findAll(),
      productRepo.findAll({ isDeleted: false }),
    ]);

    let salesToday = 0;
    let profitToday = 0;
    let salesWeek = 0;
    let profitWeek = 0;
    let salesMonth = 0;
    let profitMonth = 0;

    for (const sale of sales) {
      const saleTime = safeParseDate(sale.createdAt).getTime();
      if (saleTime >= todayStart) {
        salesToday += sale.totalRevenue;
        profitToday += sale.totalProfit;
      }
      if (saleTime >= weekStart) {
        salesWeek += sale.totalRevenue;
        profitWeek += sale.totalProfit;
      }
      if (saleTime >= monthStartTime) {
        salesMonth += sale.totalRevenue;
        profitMonth += sale.totalProfit;
      }
    }

    const pendingOrders = orders.filter(o => o.status === 'PENDIENTE').length;
    const acceptedOrders = orders.filter(o => o.status === 'ACEPTADO' || o.status === 'PREPARANDO').length;
    const activeProducts = products.filter(p => p.isActive).length;
    const lowStockProducts = products.filter(p => p.isActive && p.stock <= LOW_STOCK_THRESHOLD).length;

    return {
      salesToday,
      salesWeek,
      salesMonth,
      profitToday,
      profitWeek,
      profitMonth,
      pendingOrders,
      acceptedOrders,
      activeProducts,
      lowStockProducts,
    };
  }

  async getTopProducts(limit = 5): Promise<TopProduct[]> {
    const saleRepo = getSaleRepository();
    const sales = await saleRepo.findAll();
    const map = new Map<string, TopProduct>();

    for (const sale of sales) {
      for (const item of sale.items) {
        const existing = map.get(item.productId) || {
          productId: item.productId,
          productName: item.productName,
          unitsSold: 0,
          revenue: 0,
          profit: 0,
        };

        existing.unitsSold += item.quantity;
        existing.revenue += item.subtotalRevenue;
        existing.profit += item.subtotalProfit;
        map.set(item.productId, existing);
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, limit);
  }

  async getSalesChart(period: StatsPeriod = 'month'): Promise<SalesChartPoint[]> {
    const saleRepo = getSaleRepository();
    let fromDate: Date;
    const now = new Date();

    if (period === 'today') {
      fromDate = startOfDay(now);
    } else if (period === 'week') {
      fromDate = startOfWeek(now, { weekStartsOn: 1 });
    } else if (period === 'last_month') {
      fromDate = startOfMonth(subMonths(now, 1));
    } else {
      fromDate = startOfMonth(now);
    }

    const sales = await saleRepo.findAll(fromDate.toISOString());
    const dayMap = new Map<string, SalesChartPoint>();

    for (const sale of sales) {
      const dateKey = format(safeParseDate(sale.createdAt), 'yyyy-MM-dd');
      const existing = dayMap.get(dateKey) || {
        date: dateKey,
        revenue: 0,
        cost: 0,
        profit: 0,
        orders: 0,
      };

      existing.revenue += sale.totalRevenue;
      existing.cost += sale.totalCost;
      existing.profit += sale.totalProfit;
      existing.orders += 1;
      dayMap.set(dateKey, existing);
    }

    return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }
}
