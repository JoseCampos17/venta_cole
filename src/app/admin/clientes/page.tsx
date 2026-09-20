'use client';

import React, { useEffect, useState } from 'react';
import { CustomerSummary } from '@/types/customer';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { createWhatsAppLink } from '@/lib/whatsapp/whatsapp.utils';
import {
  Users,
  Search,
  MessageCircle,
  ShoppingBag,
  Heart,
  Trophy,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomers = React.useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers(true);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadCustomers(false);
      }
    }, 10000);

    const handleFocus = () => loadCustomers(false);
    const handleOrderChange = () => loadCustomers(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('app:order-changed', handleOrderChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('app:order-changed', handleOrderChange);
    };
  }, [loadCustomers]);

  const filteredCustomers = customers.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.whatsapp.toLowerCase().includes(query) ||
      c.classroom.toLowerCase().includes(query)
    );
  });

  const handleOpenWhatsApp = (customer: CustomerSummary) => {
    const msg = `¡Hola ${customer.name}! 😊 Te escribo de VentasCole 💗`;
    const link = createWhatsAppLink(customer.whatsapp, msg);
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Directorio de Clientes</h1>
          <p className="text-xs text-slate-500">
            {customers.length} compañeros registrados • Historial de compras y contacto
          </p>
        </div>

        <button
          onClick={() => loadCustomers(false)}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-50 transition-colors self-start"
          title="Recargar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar cliente por nombre, salón o número de WhatsApp..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 placeholder:text-slate-400"
        />
      </div>

      {isLoading ? (
        <LoadingState message="Cargando directorio de clientes..." />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-12 h-12 text-slate-300" />}
          title="No hay clientes registrados"
          description="Aparecerán automáticamente aquí cada vez que un compañero haga un encargo."
        />
      ) : (
        /* Mobile-First Customer Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCustomers.map((customer, idx) => {
            const isTopBuyer = idx < 3 && customer.totalSpent > 0;

            return (
              <div
                key={customer.whatsapp || customer.name}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3 hover:border-rose-200 transition-colors"
              >
                {/* Top Profile Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 font-black text-sm flex items-center justify-center flex-shrink-0">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-sm truncate flex items-center gap-1.5">
                        {customer.name}
                        {isTopBuyer && (
                          <span title="Cliente VIP / Top Comprador">👑</span>
                        )}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Salón: <strong>{customer.classroom}</strong> • {customer.whatsapp}
                      </span>
                    </div>
                  </div>

                  {isTopBuyer && (
                    <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                      VIP
                    </span>
                  )}
                </div>

                {/* Purchase Stats Summary */}
                <div className="bg-slate-50 p-2.5 rounded-xl grid grid-cols-2 gap-2 text-center text-xs border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Encargos</span>
                    <strong className="text-slate-900 text-sm font-black">
                      {customer.totalOrders} {customer.totalOrders === 1 ? 'pedido' : 'pedidos'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Comprado</span>
                    <strong className="text-emerald-600 text-sm font-black">
                      {formatCurrency(customer.totalSpent)}
                    </strong>
                  </div>
                </div>

                {/* Last Order Date & WhatsApp Quick Button */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-400">
                    Último encargo: {formatDateTime(customer.lastOrderDate)}
                  </span>

                  <button
                    onClick={() => handleOpenWhatsApp(customer)}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold flex items-center gap-1 transition-colors border border-emerald-200"
                    title="Escribir por WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Contactar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
