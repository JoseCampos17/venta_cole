'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { OrderWithItems, OrderStatus } from '@/types/order';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { PriceDisplay } from '@/components/products/PriceDisplay';
import { Button } from '@/components/ui/Button';
import { WhatsAppActions } from '@/components/orders/WhatsAppActions';
import { OrderCalendarView } from '@/components/orders/OrderCalendarView';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw,
  CalendarDays,
  ListFilter,
} from 'lucide-react';

const STATUS_TABS: { label: string; value: OrderStatus | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: '🟡 Pendientes', value: 'PENDIENTE' },
  { label: '🔵 Aceptados', value: 'ACEPTADO' },
  { label: '🟣 Preparando', value: 'PREPARANDO' },
  { label: '🟢 Listos', value: 'LISTO' },
  { label: '✅ Entregados', value: 'ENTREGADO' },
  { label: '❌ Cancelados', value: 'RECHAZADO' },
];

const NEXT_STEP_MAP: Partial<Record<OrderStatus, { next: OrderStatus; label: string; actionText: string; hint: string }>> = {
  PENDIENTE: {
    next: 'ACEPTADO',
    label: 'Aceptar encargo',
    actionText: '1️⃣ Aceptar Encargo (Reserva stock)',
    hint: 'Acepta el encargo para apartar las unidades del inventario.',
  },
  ACEPTADO: {
    next: 'PREPARANDO',
    label: 'Empezar a preparar',
    actionText: '2️⃣ Pasar a: "En Preparación" 📦',
    hint: 'Marca esto cuando estés buscando y empacando los productos en su bolsita.',
  },
  PREPARANDO: {
    next: 'LISTO',
    label: 'Marcar listo para entrega',
    actionText: '3️⃣ Pasar a: "¡Listo para Entrega!" 🎉',
    hint: 'Marca esto cuando la bolsita esté lista en tu maleta para llevar al colegio.',
  },
  LISTO: {
    next: 'ENTREGADO',
    label: 'Entregar y cobrar',
    actionText: '4️⃣ Marcar como "Entregado y Cobrado" 💵',
    hint: 'Marca esto cuando le entregues el pedido al compañero y te pague el dinero.',
  },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  // Background real-time synchronization (every 8s without screen flashing)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchOrders(false);
      }
    }, 8000);

    const handleFocus = () => fetchOrders(false);
    const handleOrderChange = () => fetchOrders(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('app:order-changed', handleOrderChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('app:order-changed', handleOrderChange);
    };
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setActionLoadingId(orderId);

    // Optimistic UI Update (Instant state change without reloading or flickering)
    setOrders(prevOrders =>
      prevOrders.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(prevOrders =>
          prevOrders.map(o => (o.id === orderId ? updatedOrder : o))
        );
        window.dispatchEvent(new Event('app:order-changed'));
        window.dispatchEvent(new Event('app:inventory-changed'));
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error al actualizar el estado del pedido');
        await fetchOrders(false); // Revert on failure
      }
    } catch {
      alert('Error al comunicarse con el servidor');
      await fetchOrders(false);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (selectedStatus === 'ALL') return true;
    if (selectedStatus === 'RECHAZADO') return order.status === 'RECHAZADO' || order.status === 'CANCELADO';
    return order.status === selectedStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header with Title & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Gestión de Encargos</h1>
          <p className="text-xs text-slate-500">
            Revisa los encargos, avanza su estado paso a paso y contacta a los clientes
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* List vs Calendar Mode Switch */}
          <div className="bg-white border border-slate-200 p-1 rounded-2xl flex items-center shadow-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendario</span>
            </button>
          </div>

          <button
            onClick={() => fetchOrders(false)}
            className="p-2 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-xs"
            title="Sincronizar encargos"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* View Mode: Calendar */}
      {viewMode === 'calendar' ? (
        isLoading ? (
          <LoadingState message="Cargando calendario de pedidos..." />
        ) : (
          <OrderCalendarView
            orders={orders}
            onStatusChange={handleStatusChange}
            actionLoadingId={actionLoadingId}
          />
        )
      ) : (
        /* View Mode: List */
        <div className="space-y-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {STATUS_TABS.map(tab => {
              const isSelected = selectedStatus === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedStatus(tab.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Orders List Content */}
          {isLoading ? (
            <LoadingState message="Cargando pedidos..." />
          ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-12 h-12 text-slate-300" />}
          title="No hay encargos con este filtro"
          description="Selecciona otra pestaña o espera a que tus compañeros hagan un encargo."
        />
      ) : (
        <div className="space-y-5">
          {filteredOrders.map(order => {
            const isActing = actionLoadingId === order.id;
            const nextStepInfo = NEXT_STEP_MAP[order.status];

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 hover:border-rose-200 transition-colors"
              >
                {/* Header row: Code, Current Status, Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-100">
                      {order.id}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>

                {/* Customer, Classroom, Delivery Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Cliente</span>
                    <span className="font-extrabold text-slate-900 text-sm">{order.customerName}</span>
                    <div className="text-slate-600 font-medium">Salón: <strong>{order.customerClassroom}</strong></div>
                    <div className="text-slate-600 font-medium">WhatsApp: <strong>{order.customerWhatsapp}</strong></div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Momento de Entrega</span>
                    <div className="font-bold text-slate-800">{order.deliveryDate}</div>
                    <div className="text-slate-600">{order.deliveryTime}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Método de Pago</span>
                    <div className="font-bold text-slate-800">
                      {order.paymentMethod === 'cash' ? '💵 Efectivo al recibir' : '📱 Nequi al recibir'}
                    </div>
                    {order.notes && (
                      <div className="text-slate-500 italic mt-1 bg-white p-1.5 rounded-lg border border-slate-200">
                        &quot;{order.notes}&quot;
                      </div>
                    )}
                  </div>
                </div>

                {/* Products list */}
                <div className="divide-y divide-slate-100">
                  {order.items.map(item => (
                    <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{item.productName}</span>
                        <span className="text-slate-400 ml-2 font-mono">x{item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-800">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total a cobrar:</span>
                  <PriceDisplay price={order.totalAmount} size="lg" />
                </div>

                {/* Next Step & Status Control Section */}
                <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                        Control de Estado del Pedido
                      </span>
                      {nextStepInfo?.hint && (
                        <p className="text-xs text-rose-700 mt-0.5 font-medium">
                          💡 {nextStepInfo.hint}
                        </p>
                      )}
                    </div>

                    {/* Quick Manual Selector */}
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                        Cambiar a:
                      </label>
                      <select
                        value={order.status}
                        disabled={isActing}
                        onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-rose-400 focus:outline-none"
                      >
                        <option value="PENDIENTE">🟡 Pendiente</option>
                        <option value="ACEPTADO">🔵 Aceptado</option>
                        <option value="PREPARANDO">🟣 En Preparación</option>
                        <option value="LISTO">🟢 Listo para entrega</option>
                        <option value="ENTREGADO">✅ Entregado y Pagado</option>
                        <option value="RECHAZADO">❌ Rechazado</option>
                        <option value="CANCELADO">🚫 Cancelado</option>
                      </select>
                    </div>
                  </div>

                  {/* Primary Next-Step Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {order.status === 'PENDIENTE' && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="success"
                          size="md"
                          isLoading={isActing}
                          onClick={() => handleStatusChange(order.id, 'ACEPTADO')}
                          className="font-bold text-xs sm:text-sm flex-1 sm:flex-initial shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> Aceptar Encargo
                        </Button>
                        <Button
                          variant="danger"
                          size="md"
                          isLoading={isActing}
                          onClick={() => handleStatusChange(order.id, 'RECHAZADO')}
                          className="text-xs sm:text-sm"
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Rechazar
                        </Button>
                      </div>
                    )}

                    {nextStepInfo && order.status !== 'PENDIENTE' && (
                      <Button
                        variant="primary"
                        size="md"
                        isLoading={isActing}
                        onClick={() => handleStatusChange(order.id, nextStepInfo.next)}
                        className="font-bold text-xs sm:text-sm shadow-xs w-full sm:w-auto"
                      >
                        {nextStepInfo.actionText} <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}

                    {/* WhatsApp Action Button on Delivered Orders */}
                    {order.status === 'ENTREGADO' && (
                      <WhatsAppActions order={order} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </div>
      )}
    </div>
  );
}
