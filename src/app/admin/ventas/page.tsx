'use client';

import React, { useEffect, useState } from 'react';
import { SaleWithItems } from '@/types/sale';
import { PriceDisplay } from '@/components/products/PriceDisplay';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminSalesPage() {
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSales = React.useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const res = await fetch('/api/sales');
      if (res.ok) {
        const data = await res.json();
        setSales(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales(true);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadSales(false);
      }
    }, 8000);

    const handleFocus = () => loadSales(false);
    const handleOrderChange = () => loadSales(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('app:order-changed', handleOrderChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('app:order-changed', handleOrderChange);
    };
  }, [loadSales]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalProfit = sales.reduce((sum, s) => sum + s.totalProfit, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Historial de Ventas</h1>
          <p className="text-xs text-slate-500">
            Registro inmutable de todas las ventas entregadas y cobradas
          </p>
        </div>

        <button
          onClick={() => loadSales(false)}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-50 transition-colors self-start"
          title="Recargar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-rose-500 rounded-2xl p-4 text-white shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-rose-100 uppercase tracking-wider block">
            Facturado
          </span>
          <div className="text-xl sm:text-2xl font-black mt-0.5">
            {formatCurrency(totalRevenue)}
          </div>
          <span className="text-[10px] text-rose-100 mt-0.5 block">{sales.length} ventas</span>
        </div>

        <div className="bg-emerald-600 rounded-2xl p-4 text-white shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-emerald-100 uppercase tracking-wider block">
            Ganancia Neta
          </span>
          <div className="text-xl sm:text-2xl font-black mt-0.5">
            +{formatCurrency(totalProfit)}
          </div>
          <span className="text-[10px] text-emerald-100 mt-0.5 block">Ganancia real</span>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Cargando historial de ventas..." />
      ) : sales.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="w-12 h-12 text-slate-300" />}
          title="Aún no hay ventas registradas"
          description="Cuando marques un encargo como ENTREGADO, se convertirá automáticamente en una venta aquí."
        />
      ) : (
        /* Mobile-First Sales Receipts */
        <div className="space-y-3.5">
          {sales.map(sale => (
            <div
              key={sale.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3"
            >
              {/* Top row */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm block">
                    {sale.customerName}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    {sale.orderId}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {formatDateTime(sale.createdAt)}
                </span>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-1 text-xs">
                {sale.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-0.5 text-slate-700">
                    <div>
                      <span className="font-bold text-slate-800">{item.productName}</span>
                      <span className="text-slate-400 ml-1.5 font-mono">x{item.quantity}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{formatCurrency(item.subtotalRevenue)}</span>
                      <span className="text-emerald-600 font-bold ml-1.5 text-[11px]">
                        (+{formatCurrency(item.subtotalProfit)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between text-xs border border-slate-100">
                <div className="text-slate-500 text-[11px]">
                  Costo: <strong>{formatCurrency(sale.totalCost)}</strong>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-slate-500 mr-1">Venta:</span>
                    <strong className="text-slate-900 font-extrabold">{formatCurrency(sale.totalRevenue)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 mr-1">Ganancia:</span>
                    <strong className="text-emerald-600 font-black">+{formatCurrency(sale.totalProfit)}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
