'use client';

import React, { useState, useMemo } from 'react';
import { OrderWithItems, OrderStatus } from '@/types/order';
import { OrderStatusBadge } from './OrderStatusBadge';
import { PriceDisplay } from '@/components/products/PriceDisplay';
import { Button } from '@/components/ui/Button';
import { WhatsAppActions } from './WhatsAppActions';
import { formatCurrency } from '@/lib/utils/format';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight as ChevronRightIcon,
  ShoppingBag,
} from 'lucide-react';

interface OrderCalendarViewProps {
  orders: OrderWithItems[];
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  actionLoadingId: string | null;
}

const NEXT_STEP_MAP: Partial<Record<OrderStatus, { next: OrderStatus; label: string; actionText: string; hint: string }>> = {
  PENDIENTE: {
    next: 'ACEPTADO',
    label: 'Aceptar encargo',
    actionText: '1️⃣ Aceptar (Reserva stock)',
    hint: 'Acepta el encargo para apartar las unidades del inventario.',
  },
  ACEPTADO: {
    next: 'PREPARANDO',
    label: 'Empezar a preparar',
    actionText: '2️⃣ Pasar a: "En Preparación" 📦',
    hint: 'Marca esto cuando estés buscando y empacando los productos.',
  },
  PREPARANDO: {
    next: 'LISTO',
    label: 'Marcar listo para entrega',
    actionText: '3️⃣ Pasar a: "¡Listo para Entrega!" 🎉',
    hint: 'Marca esto cuando la bolsita esté lista en tu maleta.',
  },
  LISTO: {
    next: 'ENTREGADO',
    label: 'Entregar y cobrar',
    actionText: '4️⃣ Marcar como "Entregado y Cobrado" 💵',
    hint: 'Marca esto cuando le entregues el pedido al compañero.',
  },
};

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function getISODateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function OrderCalendarView({
  orders,
  onStatusChange,
  actionLoadingId,
}: OrderCalendarViewProps) {
  const today = useMemo(() => new Date(), []);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => getISODateKey(new Date()));

  // Map orders by YYYY-MM-DD
  const ordersByDate = useMemo(() => {
    const map: Record<string, OrderWithItems[]> = {};
    for (const order of orders) {
      const dateKey = order.createdAt ? order.createdAt.substring(0, 10) : getISODateKey(new Date());
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(order);
    }
    return map;
  }, [orders]);

  // Dates with orders in this month for quick navigation
  const datesWithOrders = useMemo(() => {
    return Object.keys(ordersByDate).sort();
  }, [ordersByDate]);

  // Calendar matrix calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday = 0, Sunday = 6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const days: { dateKey: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const pDate = new Date(year, month - 1, pDay);
      days.push({
        dateKey: getISODateKey(pDate),
        dayNum: pDay,
        isCurrentMonth: false,
        isToday: getISODateKey(pDate) === getISODateKey(today),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const cDate = new Date(year, month, day);
      days.push({
        dateKey: getISODateKey(cDate),
        dayNum: day,
        isCurrentMonth: true,
        isToday: getISODateKey(cDate) === getISODateKey(today),
      });
    }

    // Next month padding to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nDate = new Date(year, month + 1, i);
      days.push({
        dateKey: getISODateKey(nDate),
        dayNum: i,
        isCurrentMonth: false,
        isToday: getISODateKey(nDate) === getISODateKey(today),
      });
    }

    return days;
  }, [year, month, today]);

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    const t = new Date();
    setCurrentMonthDate(t);
    setSelectedDateKey(getISODateKey(t));
  };

  // Orders for the selected date
  const selectedDateOrders = useMemo(() => {
    return ordersByDate[selectedDateKey] || [];
  }, [ordersByDate, selectedDateKey]);

  const selectedDateTotalRevenue = useMemo(() => {
    const list = ordersByDate[selectedDateKey] || [];
    return list.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [ordersByDate, selectedDateKey]);

  // Formatted date title for selected day (e.g., "Domingo, 20 de Septiembre")
  const selectedDateLabel = useMemo(() => {
    const parts = selectedDateKey.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    return selectedDateKey;
  }, [selectedDateKey]);

  return (
    <div className="space-y-5">
      {/* 1. Mobile-First Interactive Calendar Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        {/* Month Header & Quick Navigation */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 capitalize leading-tight">
                {MONTH_NAMES[month]} {year}
              </h2>
              <span className="text-[11px] text-slate-400 font-semibold">
                Toca cualquier día para ver sus pedidos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={jumpToToday}
              className="px-2.5 py-1 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Hoy
            </button>
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
                title="Mes anterior"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
                title="Mes siguiente"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {DAYS_OF_WEEK.map((d, i) => (
            <div
              key={d}
              className={`text-[11px] font-black uppercase py-1 ${
                i >= 5 ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Day Grid (Touch-friendly 7 columns) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map(item => {
            const isSelected = item.dateKey === selectedDateKey;
            const dayOrders = ordersByDate[item.dateKey] || [];
            const hasOrders = dayOrders.length > 0;
            const hasPending = dayOrders.some(o => o.status === 'PENDIENTE');
            const hasReady = dayOrders.some(o => o.status === 'LISTO');
            const hasDelivered = dayOrders.some(o => o.status === 'ENTREGADO');

            return (
              <button
                key={item.dateKey}
                onClick={() => setSelectedDateKey(item.dateKey)}
                className={`min-h-[52px] sm:min-h-[64px] rounded-2xl p-1 flex flex-col items-center justify-between transition-all relative border cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md scale-102 z-10'
                    : item.isToday
                    ? 'bg-rose-50/70 border-rose-300 text-rose-700 font-black'
                    : item.isCurrentMonth
                    ? 'bg-slate-50/70 hover:bg-rose-50/40 text-slate-800 border-slate-200/60'
                    : 'bg-white/40 text-slate-300 border-transparent opacity-60'
                }`}
              >
                {/* Day Number */}
                <span
                  className={`text-xs sm:text-sm font-extrabold ${
                    isSelected ? 'text-white' : item.isToday ? 'text-rose-600' : ''
                  }`}
                >
                  {item.dayNum}
                </span>

                {/* Orders Indicators & Dots */}
                {hasOrders ? (
                  <div className="flex flex-col items-center gap-0.5 w-full">
                    {/* Compact Order Counter Badge */}
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-full leading-tight ${
                        isSelected
                          ? 'bg-white text-rose-600'
                          : hasPending
                          ? 'bg-amber-400 text-slate-950 animate-pulse'
                          : hasReady
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {dayOrders.length} {dayOrders.length === 1 ? 'ped' : 'peds'}
                    </span>

                    {/* Colored Status Dots */}
                    <div className="flex items-center justify-center gap-0.5 mt-0.5">
                      {hasPending && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-amber-300' : 'bg-amber-400'
                          }`}
                        />
                      )}
                      {hasReady && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-emerald-300' : 'bg-emerald-500'
                          }`}
                        />
                      )}
                      {hasDelivered && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-slate-300' : 'bg-slate-400'
                          }`}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="h-3" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-100 text-[10px] sm:text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Pendientes</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Listos para entrega</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Entregados</span>
          </div>
        </div>
      </div>

      {/* 2. Selected Day Detail Section */}
      <div className="space-y-3.5">
        {/* Selected Day Header Card */}
        <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
              📅 Encargos Programados
            </span>
            <h3 className="text-base sm:text-lg font-black capitalize text-white">
              {selectedDateLabel}
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-white/10 px-3.5 py-1.5 rounded-2xl backdrop-blur-md">
            <span className="text-xs text-slate-300">
              {selectedDateOrders.length} {selectedDateOrders.length === 1 ? 'encargo' : 'encargos'}
            </span>
            <span className="text-slate-400">•</span>
            <strong className="text-sm font-black text-rose-300">
              {formatCurrency(selectedDateTotalRevenue)}
            </strong>
          </div>
        </div>

        {/* Orders for Selected Day */}
        {selectedDateOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              No hay encargos registrados para este día
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Selecciona otro día con el indicador de pedidos (🟡) en el calendario para revisar sus detalles.
            </p>

            {datesWithOrders.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  Días con encargos este mes:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {datesWithOrders.map(dKey => (
                    <button
                      key={dKey}
                      onClick={() => setSelectedDateKey(dKey)}
                      className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors border border-rose-200/60 cursor-pointer"
                    >
                      {dKey} ({ordersByDate[dKey]?.length})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {selectedDateOrders.map(order => {
              const isActing = actionLoadingId === order.id;
              const nextStepInfo = NEXT_STEP_MAP[order.status];

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 hover:border-rose-200 transition-colors"
                >
                  {/* Header row: Code, Current Status, Delivery Time */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-100">
                        {order.id}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>{order.deliveryTime}</span>
                    </div>
                  </div>

                  {/* Customer, Classroom, Delivery Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Cliente</span>
                      <span className="font-extrabold text-slate-900 text-sm">{order.customerName}</span>
                      <div className="text-slate-600 font-medium">Salón: <strong>{order.customerClassroom}</strong></div>
                      <div className="text-slate-600 font-medium">WhatsApp: <strong>{order.customerWhatsapp}</strong></div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Momento de Entrega</span>
                      <div className="font-bold text-slate-800">{order.deliveryDate}</div>
                      <div className="text-slate-600">{order.deliveryTime}</div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Pago</span>
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

                  {/* Status Actions */}
                  <div className="bg-rose-50/50 rounded-2xl p-3.5 border border-rose-100 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                        Control de Estado
                      </span>

                      {/* Quick Selector */}
                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                          Cambiar a:
                        </label>
                        <select
                          value={order.status}
                          disabled={isActing}
                          onChange={e => onStatusChange(order.id, e.target.value as OrderStatus)}
                          className="rounded-xl border border-rose-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none"
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

                    {/* Step buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {order.status === 'PENDIENTE' && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button
                            variant="success"
                            size="md"
                            isLoading={isActing}
                            onClick={() => onStatusChange(order.id, 'ACEPTADO')}
                            className="font-bold text-xs sm:text-sm flex-1 sm:flex-initial shadow-xs"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Aceptar Encargo
                          </Button>
                          <Button
                            variant="danger"
                            size="md"
                            isLoading={isActing}
                            onClick={() => onStatusChange(order.id, 'RECHAZADO')}
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
                          onClick={() => onStatusChange(order.id, nextStepInfo.next)}
                          className="font-bold text-xs sm:text-sm shadow-xs w-full sm:w-auto"
                        >
                          {nextStepInfo.actionText} <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </Button>
                      )}

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
    </div>
  );
}
