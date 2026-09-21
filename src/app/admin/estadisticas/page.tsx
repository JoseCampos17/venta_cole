'use client';

import React, { useEffect, useState } from 'react';
import { SalesChart } from '@/components/charts/SalesChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { formatCurrency } from '@/lib/utils/format';
import { DashboardStats, TopProduct, SalesChartPoint, StatsPeriod } from '@/types/dashboard';
import { DollarSign, TrendingUp, BarChart3, Trophy } from 'lucide-react';

const PERIOD_OPTIONS: { label: string; value: StatsPeriod }[] = [
  { label: 'Hoy', value: 'today' },
  { label: '7 días', value: 'week' },
  { label: 'Este Mes', value: 'month' },
  { label: 'Mes Anterior', value: 'last_month' },
];

export default function AdminStatsPage() {
  const [period, setPeriod] = useState<StatsPeriod>('month');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [chartData, setChartData] = useState<SalesChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = React.useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setTopProducts(data.topProducts);
        setChartData(data.chart);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadStats(true);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadStats(false);
      }
    }, 10000);

    const handleFocus = () => loadStats(false);
    const handleOrderChange = () => loadStats(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('app:order-changed', handleOrderChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('app:order-changed', handleOrderChange);
    };
  }, [loadStats]);

  const getPeriodKpis = () => {
    if (!stats) return { sales: 0, profit: 0, label: 'del período' };
    if (period === 'today') {
      return { sales: stats.salesToday, profit: stats.profitToday, label: 'de hoy' };
    }
    if (period === 'week') {
      return { sales: stats.salesWeek, profit: stats.profitWeek, label: 'esta semana' };
    }
    return { sales: stats.salesMonth, profit: stats.profitMonth, label: 'este mes' };
  };

  const currentKpis = getPeriodKpis();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Estadísticas y Ganancias</h1>
          <p className="text-xs text-slate-500">
            Descubre cuánto ganas y cuáles son tus productos más vendidos
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs self-start overflow-x-auto no-scrollbar">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                period === opt.value
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading || !stats ? (
        <LoadingState message="Calculando estadísticas..." />
      ) : (
        <div className="space-y-5">
          {/* Summary KPIs dynamic according to selected period */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatsCard
              title={`Ventas (${currentKpis.label})`}
              value={formatCurrency(currentKpis.sales)}
              subtitle="Ingresos cobrados"
              icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />}
              color="pink"
            />

            <StatsCard
              title={`Ganancia (${currentKpis.label})`}
              value={formatCurrency(currentKpis.profit)}
              subtitle="Ganancia neta"
              icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
              color="green"
            />

            <StatsCard
              title="Margen"
              value={
                currentKpis.sales > 0
                  ? `${((currentKpis.profit / currentKpis.sales) * 100).toFixed(0)}%`
                  : '0%'
              }
              subtitle="Rentabilidad"
              icon={<BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />}
              color="purple"
            />
          </div>

          {/* Main Chart */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900">
              📊 Evolución de Ventas vs Ganancia
            </h2>
            <SalesChart data={chartData} />
          </div>

          {/* Top Products Cards List */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" /> Rendimiento de Productos
            </h2>

            {topProducts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Aún no hay suficientes ventas registradas para este período.
              </div>
            ) : (
              <div className="space-y-2">
                {topProducts.map((p, idx) => (
                  <div
                    key={p.productId}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-black flex items-center justify-center text-xs flex-shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                          {p.productName}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-bold">
                          {p.unitsSold} unidades vendidas
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-slate-900 block">
                        {formatCurrency(p.revenue)}
                      </span>
                      <span className="text-[11px] font-black text-emerald-600 block">
                        +{formatCurrency(p.profit)} ganancia
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
