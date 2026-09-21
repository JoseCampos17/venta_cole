'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SalesChart } from '@/components/charts/SalesChart';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { PriceDisplay } from '@/components/products/PriceDisplay';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { DashboardStats, TopProduct, SalesChartPoint } from '@/types/dashboard';
import { OrderWithItems } from '@/types/order';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [chartData, setChartData] = useState<SalesChartPoint[]>([]);
  const [pendingOrders, setPendingOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadDashboard = React.useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    setHasError(false);
    try {
      const [dashRes, ordersRes] = await Promise.all([
        fetch('/api/dashboard?period=month'),
        fetch('/api/orders?status=PENDIENTE'),
      ]);

      if (dashRes.ok && ordersRes.ok) {
        const dashData = await dashRes.json();
        const ordersData = await ordersRes.json();
        setStats(dashData.stats);
        setTopProducts(dashData.topProducts);
        setChartData(dashData.chart);
        setPendingOrders(ordersData);
      } else {
        if (isInitial) setHasError(true);
      }
    } catch (e) {
      console.error(e);
      if (isInitial) setHasError(true);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(true);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadDashboard(false);
      }
    }, 8000);

    const handleFocus = () => loadDashboard(false);
    const handleOrderChange = () => loadDashboard(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('app:order-changed', handleOrderChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('app:order-changed', handleOrderChange);
    };
  }, [loadDashboard]);

  const handleQuickStatusChange = async (orderId: string, status: 'ACEPTADO' | 'RECHAZADO') => {
    // Instant optimistic removal from pending list
    setPendingOrders(prev => prev.filter(o => o.id !== orderId));
    if (stats) {
      setStats(prev =>
        prev
          ? {
              ...prev,
              pendingOrders: Math.max(0, prev.pendingOrders - 1),
              acceptedOrders: status === 'ACEPTADO' ? prev.acceptedOrders + 1 : prev.acceptedOrders,
            }
          : prev
      );
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        window.dispatchEvent(new Event('app:order-changed'));
        window.dispatchEvent(new Event('app:inventory-changed'));
        await loadDashboard(false);
      } else {
        const err = await res.json();
        alert(err.error || 'Error al cambiar estado');
        await loadDashboard(false);
      }
    } catch (e) {
      console.error(e);
      await loadDashboard(false);
    }
  };

  if (isLoading && !stats) {
    return <LoadingState message="Cargando resumen..." />;
  }

  if (hasError && !stats) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">No se pudo cargar el resumen</h2>
        <p className="text-xs text-slate-500">
          Ocurrió un problema conectando con la base de datos.
        </p>
        <Button variant="primary" size="sm" onClick={() => loadDashboard(true)}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!stats) {
    return <LoadingState message="Cargando resumen..." />;
  }

  return (
    <div className="space-y-6">
      {/* Clean Greeting without misplaced icons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            ¡Hola Administradora! 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aquí tienes el resumen de tu negocio hoy
          </p>
        </div>

        <Link href="/admin/pedidos" className="self-start">
          <Button variant="primary" size="sm" className="font-bold text-xs shadow-xs">
            <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Ver todos los pedidos
          </Button>
        </Link>
      </div>

      {/* KPI Cards Grid - Perfectly balanced 2x2 on mobile, 4 in a row on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Ventas Mes"
          value={formatCurrency(stats.salesMonth)}
          subtitle={`Hoy: ${formatCurrency(stats.salesToday)}`}
          icon={<DollarSign className="w-4 h-4" />}
          color="pink"
        />

        <StatsCard
          title="Ganancias"
          value={formatCurrency(stats.profitMonth)}
          subtitle={`Hoy: ${formatCurrency(stats.profitToday)}`}
          icon={<TrendingUp className="w-4 h-4" />}
          color="green"
        />

        <StatsCard
          title="Pendientes"
          value={stats.pendingOrders}
          subtitle={`${stats.acceptedOrders} en preparación`}
          icon={<Clock className="w-4 h-4" />}
          color="purple"
        />

        <StatsCard
          title="Poco Stock"
          value={stats.lowStockProducts}
          subtitle={`${stats.activeProducts} productos activos`}
          icon={<AlertTriangle className="w-4 h-4" />}
          color="yellow"
        />
      </div>

      {/* Pending Orders Action Section */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${pendingOrders.length > 0 ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
              Encargos por Responder ({pendingOrders.length})
            </h2>
          </div>
          <Link
            href="/admin/pedidos"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="py-6 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-700">¡Al día! No tienes pedidos pendientes</p>
            <p className="text-[11px] text-slate-400">Te avisaremos cuando tus compañeros hagan un encargo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingOrders.map(order => (
              <div
                key={order.id}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                      {order.id}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>

                  <div className="text-sm font-extrabold text-slate-900">
                    {order.customerName} <span className="text-xs text-brand-600 font-bold">({order.customerClassroom})</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Entrega: <strong>{order.deliveryDate}</strong> ({order.deliveryTime})
                  </div>

                  <div className="mt-2 text-xs text-slate-700 font-medium">
                    {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <PriceDisplay price={order.totalAmount} size="md" />

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickStatusChange(order.id, 'RECHAZADO')}
                      className="px-2.5 py-1.5 rounded-xl text-brand-600 hover:bg-brand-100 text-xs font-bold transition-colors"
                    >
                      Rechazar
                    </button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleQuickStatusChange(order.id, 'ACEPTADO')}
                      className="text-xs px-3 py-1.5 font-bold rounded-xl"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aceptar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart & Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
            📊 Ventas vs Ganancias (Este Mes)
          </h2>
          <SalesChart data={chartData} />
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5">
            🏆 Más Vendidos
          </h2>

          {topProducts.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              Aún no hay ventas registradas
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {topProducts.map((p, idx) => (
                <div key={p.productId} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center text-[10px] flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 truncate">{p.productName}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">
                      {p.unitsSold} {p.unitsSold === 1 ? 'vendido' : 'vendidos'}
                    </span>
                    <div className="text-[11px] text-emerald-600 font-bold">
                      +{formatCurrency(p.profit)} ganancia
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
