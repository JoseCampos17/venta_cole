'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { OrderWithItems, OrderStatus, ORDER_STATUS_LABELS } from '@/types/order';
import { PriceDisplay } from '@/components/products/PriceDisplay';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from 'lucide-react';

const STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'PENDIENTE', label: 'Encargo Recibido', description: 'Esperando que la tienda revise y acepte tu encargo' },
  { status: 'ACEPTADO', label: 'Aceptado', description: 'Tu encargo fue aprobado y se apartaron tus productos' },
  { status: 'PREPARANDO', label: 'En Preparación', description: 'Estamos empacando tus productos' },
  { status: 'LISTO', label: '¡Listo para Entrega!', description: 'Listo para entregarte en el descanso/colegio' },
  { status: 'ENTREGADO', label: 'Entregado y Pagado', description: '¡Gracias por tu compra!' },
];

export default function OrderTrackingDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrder = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrder(true);
    }
  }, [orderId, fetchOrder]);

  // Live auto-sync interval every 6s while customer watches the page
  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchOrder(false);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [orderId, fetchOrder]);

  if (isLoading) {
    return <LoadingState message="Buscando estado de tu encargo..." />;
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 bg-brand-100 text-brand-500 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900">Encargo no encontrado</h1>
        <p className="text-xs text-slate-500">
          No encontramos ningún encargo con el código <strong>{orderId}</strong>. Verifica el código e intenta de nuevo.
        </p>
        <Link href="/pedidos">
          <Button variant="primary" size="md">Buscar otro código</Button>
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === 'RECHAZADO' || order.status === 'CANCELADO';
  const currentStepIndex = STEPS.findIndex(s => s.status === order.status);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a la tienda
        </Link>

        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          En vivo
        </span>
      </div>

      {/* Main Status Header Card */}
      <div className={`rounded-3xl p-6 text-white text-center shadow-md space-y-2 transition-all duration-300 ${
        isCancelled
          ? 'bg-brand-600'
          : order.status === 'LISTO'
          ? 'bg-emerald-600 animate-pulse'
          : order.status === 'ENTREGADO'
          ? 'bg-slate-800'
          : 'bg-brand-500'
      }`}>
        <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full inline-block">
          Código: {order.id}
        </span>
        <h1 className="text-2xl font-black">
          {isCancelled
            ? '❌ Encargo Cancelado o Rechazado'
            : order.status === 'LISTO'
            ? '🎉 ¡Tu pedido ya está LISTO!'
            : order.status === 'ENTREGADO'
            ? '✅ Pedido Entregado'
            : `Estado: ${ORDER_STATUS_LABELS[order.status]}`}
        </h1>
        <p className="text-xs text-white/90">
          {isCancelled
            ? 'Lo sentimos, este encargo no pudo ser procesado (por falta de stock o cancelación).'
            : order.status === 'LISTO'
            ? `Búscalo en el colegio con ${order.customerName} en el horario acordado.`
            : `Entrega programada: ${order.deliveryDate} — ${order.deliveryTime}`}
        </p>
      </div>

      {/* Step by Step Timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Progreso de tu encargo
          </h2>

          <div className="space-y-4">
            {STEPS.map((step, idx) => {
              const isPast = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step.status} className="flex items-start gap-3.5 transition-all duration-300">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs transition-colors duration-300 ${
                    isPast
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  <div className="flex-1">
                    <h4 className={`text-sm font-bold ${
                      isCurrent ? 'text-brand-600' : isPast ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {step.label} {isCurrent && <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full ml-1 font-extrabold">ACTUAL</span>}
                    </h4>
                    <p className="text-xs text-slate-500">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Info & Items */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
          Resumen de lo que pediste
        </h3>

        <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl">
          <div><strong>Cliente:</strong> {order.customerName} ({order.customerClassroom})</div>
          <div><strong>Momento de entrega:</strong> {order.deliveryDate} • {order.deliveryTime}</div>
          <div><strong>Método de pago:</strong> {order.paymentMethod === 'cash' ? '💵 Efectivo al recibir' : '📱 Nequi al recibir'}</div>
        </div>

        <div className="divide-y divide-slate-100">
          {order.items.map(item => (
            <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-800">{item.productName}</span>
                <span className="text-slate-400 ml-2">x{item.quantity}</span>
              </div>
              <span className="font-bold text-slate-900">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
          <span className="text-sm font-extrabold text-slate-900">Total a pagar al recibir:</span>
          <PriceDisplay price={order.totalAmount} size="lg" />
        </div>
      </div>
    </div>
  );
}
