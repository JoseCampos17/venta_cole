import React from 'react';
import { PriceDisplay } from '../products/PriceDisplay';
import { formatCurrency } from '@/lib/utils/format';

interface CartSummaryProps {
  totalAmount: number;
  totalItems: number;
}

export function CartSummary({ totalAmount, totalItems }: CartSummaryProps) {
  return (
    <div className="bg-brand-50/60 rounded-3xl p-5 border border-brand-100">
      <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
        <span>Artículos ({totalItems})</span>
        <span className="font-semibold text-gray-800">{formatCurrency(totalAmount)}</span>
      </div>

      <div className="border-t border-brand-200/60 my-3 pt-3 flex justify-between items-center">
        <span className="text-base font-extrabold text-gray-900">Total a pagar:</span>
        <PriceDisplay price={totalAmount} size="xl" />
      </div>

      <div className="mt-3 bg-white/80 rounded-2xl p-3 border border-brand-100 text-xs text-gray-500 flex items-start gap-2">
        <span className="text-brand-500 font-bold">ℹ️</span>
        <span>
          Este es un <strong>encargo/reserva</strong>. El pago se realiza después en efectivo o por Nequi al recibir tu pedido.
        </span>
      </div>
    </div>
  );
}
