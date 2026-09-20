import { NextRequest, NextResponse } from 'next/server';
import { DashboardService } from '@/services/dashboard.service';
import { StatsPeriod } from '@/types/dashboard';

export const dynamic = 'force-dynamic';

const dashboardService = new DashboardService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') as StatsPeriod) || 'month';

    const [stats, topProducts, chart] = await Promise.all([
      dashboardService.getStats(),
      dashboardService.getTopProducts(5),
      dashboardService.getSalesChart(period),
    ]);

    return NextResponse.json({
      stats,
      topProducts,
      chart,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Error al obtener datos del dashboard' }, { status: 500 });
  }
}
