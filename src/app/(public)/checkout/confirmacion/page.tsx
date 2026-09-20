'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { OrderWithItems } from '@/types/order';
import { Button } from '@/components/ui/Button';
import { PriceDisplay } from '@/components/products/PriceDisplay';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { CheckCircle2, ShoppingBag, Search, ArrowRight, Copy, Check } from 'lucide-react';
import { LoadingState } from '@/components/ui/LoadingState';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then(res => (res.ok ? res.json() : null))
        .then(data => setOrder(data))
        .catch(e => console.error(e))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [orderId]);

  const copyCode = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <LoadingState message="Cargando confirmación..." />;
  }

  if (!order) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">No encontramos los detalles de este encargo</h2>
        <Link href="/">
          <Button variant="primary" size="md">Volver a la tienda</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Success Badge Banner */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 sm:p-8 text-white text-center shadow-lg shadow-emerald-100 space-y-3">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full mx-auto flex items-center justify-center text-white">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black">¡Encargo Recibido!</h2>
        <p className="text-xs sm:text-sm text-emerald-100">
          Tu pedido ya fue registrado con éxito. Pronto lo prepararemos para entregártelo en el colegio.
        </p>

        {/* Order Code Pill with Copy */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-mono font-bold tracking-wider">
          <span>{order.id}</span>
          <button
            onClick={copyCode}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            title="Copiar código"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
          </button>
        </div>
      </div>

      {/* Live Order Tracking Button */}
      <Link href={`/pedidos/${order.id}`} className="block">
        <div className="bg-white hover:bg-rose-50/50 border-2 border-rose-200 rounded-2xl p-4 flex items-center justify-between transition-colors shadow-xs group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm group-hover:text-rose-600">
                Rastrear estado de mi encargo
              </div>
              <div className="text-xs text-slate-500">
                Mira en vivo cuándo esté listo para entrega
              </div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-rose-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* Order Summary Receipt */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="text-xs font-bold text-slate-400 uppercase">Detalle del Encargo</div>
          <div className="text-xs text-slate-400">{formatDateTime(order.createdAt)}</div>
        </div>

        {/* Customer & Delivery Summary */}
        <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <div><strong>Cliente:</strong> {order.customerName} ({order.customerClassroom})</div>
          <div><strong>Entrega solicitada:</strong> {order.deliveryDate} — {order.deliveryTime}</div>
          <div><strong>Pago:</strong> {order.paymentMethod === 'cash' ? '💵 Efectivo al recibir' : '📱 Nequi al recibir'}</div>
          {order.notes && <div><strong>Notas:</strong> {order.notes}</div>}
        </div>

        {/* Items List */}
        <div className="divide-y divide-slate-100">
          {order.items.map(item => (
            <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-800">{item.productName}</span>
                <span className="text-slate-400 ml-2">x{item.quantity}</span>
              </div>
              <span className="font-bold text-slate-800">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
          <span className="text-sm font-extrabold text-slate-900">Total a pagar al recibir:</span>
          <PriceDisplay price={order.totalAmount} size="lg" />
        </div>
      </div>

      {/* Action to Catalog */}
      <Link href="/" className="block">
        <Button variant="outline" size="lg" className="w-full font-bold">
          ← Volver a la tienda
        </Button>
      </Link>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<LoadingState message="Cargando..." />}>
      <ConfirmationContent />
    </Suspense>
  );
}
