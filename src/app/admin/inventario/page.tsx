'use client';

import React, { useEffect, useState } from 'react';
import { InventoryMovement } from '@/types/inventory';
import { Product } from '@/types/product';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/lib/utils/format';
import {
  Package,
  ShoppingBag,
  PlusCircle,
  RotateCcw,
  SlidersHorizontal,
  RefreshCw,
  Info,
} from 'lucide-react';

export default function AdminInventoryPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = React.useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const [movRes, prodRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/products'),
      ]);

      if (movRes.ok && prodRes.ok) {
        const movData = await movRes.json();
        const prodData = await prodRes.json();
        setMovements(movData);
        setProducts(prodData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData(false);
      }
    }, 8000);

    const handleFocus = () => loadData(false);
    const handleSync = () => loadData(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('app:inventory-changed', handleSync);
    window.addEventListener('app:order-changed', handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('app:inventory-changed', handleSync);
      window.removeEventListener('app:order-changed', handleSync);
    };
  }, [loadData]);

  const filteredMovements = movements.filter(m =>
    selectedProductId === 'ALL' ? true : m.productId === selectedProductId
  );

  const getFriendlyExplanation = (mov: InventoryMovement) => {
    switch (mov.reason) {
      case 'SALE':
        return {
          title: `Se vendieron ${Math.abs(mov.quantity)} unidades 🛍️`,
          desc: mov.referenceId ? `Por el encargo ${mov.referenceId}` : 'Venta a un compañero',
          badge: 'Venta',
          badgeColor: 'bg-brand-100 text-brand-700',
          icon: <ShoppingBag className="w-5 h-5 text-brand-600" />,
          isPositive: false,
        };
      case 'INITIAL':
        return {
          title: `Agregaste ${mov.quantity} unidades iniciales 📦`,
          desc: 'Cuando creaste el producto por primera vez',
          badge: 'Inventario inicial',
          badgeColor: 'bg-emerald-100 text-emerald-700',
          icon: <Package className="w-5 h-5 text-emerald-600" />,
          isPositive: true,
        };
      case 'PURCHASE':
        return {
          title: `Compraste ${mov.quantity} unidades nuevas 🚚`,
          desc: 'Reposición de mercancía que llegó',
          badge: 'Compraste más',
          badgeColor: 'bg-emerald-100 text-emerald-700',
          icon: <PlusCircle className="w-5 h-5 text-emerald-600" />,
          isPositive: true,
        };
      case 'RETURN':
        return {
          title: `Se devolvieron ${mov.quantity} unidades al stock ↩️`,
          desc: mov.referenceId ? `Porque se canceló el encargo ${mov.referenceId}` : 'Devolución de pedido',
          badge: 'Devuelto',
          badgeColor: 'bg-sky-100 text-sky-700',
          icon: <RotateCcw className="w-5 h-5 text-sky-600" />,
          isPositive: true,
        };
      case 'ADJUSTMENT':
      default:
        return {
          title: `Ajuste de ${mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity} unidades ✏️`,
          desc: mov.notes || 'Cambio manual de stock en el producto',
          badge: 'Ajuste manual',
          badgeColor: 'bg-amber-100 text-amber-700',
          icon: <SlidersHorizontal className="w-5 h-5 text-amber-600" />,
          isPositive: mov.quantity > 0,
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Header with clear plain language */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">¿Qué pasó con mis productos?</h1>
          <p className="text-xs text-slate-500">
            Mira cuándo se vendió cada cosa, cuándo compraste más o cuándo cambiaste el stock
          </p>
        </div>

        <button
          onClick={() => loadData(false)}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-colors self-start"
          title="Recargar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Friendly Explanatory Note */}
      <div className="bg-brand-50/70 border border-brand-100 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-brand-900">
        <Info className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
        <div>
          <strong>¿Cómo funciona?</strong> Cada vez que aceptas un pedido, el sistema descuenta solito el producto de tu stock y lo anota aquí para que nunca te pierdas cuántas cosas tienes.
        </div>
      </div>

      {/* Filter by Specific Product */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Ver producto:</span>
        <select
          value={selectedProductId}
          onChange={e => setSelectedProductId(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-400"
        >
          <option value="ALL">✨ Ver todos los productos</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.stock} disponibles)
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingState message="Cargando historial..." />
      ) : filteredMovements.length === 0 ? (
        <EmptyState
          icon={<Package className="w-12 h-12 text-slate-300" />}
          title="Aún no hay movimientos para este producto"
          description="Aparecerán aquí cuando aceptes pedidos o agregues unidades."
        />
      ) : (
        /* Friendly Story Cards */
        <div className="space-y-3">
          {filteredMovements.map(mov => {
            const info = getFriendlyExplanation(mov);

            return (
              <div
                key={mov.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-start justify-between gap-3 hover:border-brand-200 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      info.isPositive ? 'bg-emerald-50' : 'bg-brand-50'
                    }`}
                  >
                    {info.icon}
                  </div>

                  <div className="min-w-0">
                    <span className="font-black text-slate-900 text-sm block">
                      {mov.productName}
                    </span>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">
                      {info.title}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {info.desc} • {formatDateTime(mov.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-base font-black ${
                      info.isPositive ? 'text-emerald-600' : 'text-brand-600'
                    }`}
                  >
                    {info.isPositive ? `+${mov.quantity}` : `-${Math.abs(mov.quantity)}`}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">unidades</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
