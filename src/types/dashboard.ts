export interface DashboardStats {
  salesToday: number;
  salesWeek: number;
  salesMonth: number;
  profitToday: number;
  profitWeek: number;
  profitMonth: number;
  pendingOrders: number;
  acceptedOrders: number;
  activeProducts: number;
  lowStockProducts: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
  profit: number;
}

export interface SalesChartPoint {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  orders: number;
}

export type StatsPeriod = 'today' | 'week' | 'month' | 'last_month' | 'custom';

export interface StatsFilter {
  period: StatsPeriod;
  from?: string;
  to?: string;
}
