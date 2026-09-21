'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/features/cart/CartContext';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';

export default function CartPage() {
  const { items, totalAmount, totalItems, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="space-y-4 max-w-lg mx-auto">
        <EmptyState
          icon={<ShoppingBag className="w-14 h-14 text-brand-300 animate-bounce" />}
          title="Tu carrito está vacío"
          description="Aún no has seleccionado productos. Explora el catálogo y agrega lo que te guste."
          action={
            <Link href="/">
              <Button variant="primary" size="md">
                Ver catálogo
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-2xl bg-white border border-brand-100 text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-extrabold text-gray-900">
            Tu Carrito ({totalItems})
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-gray-400 hover:text-brand-500 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Vaciar
        </button>
      </div>

      {/* Cart Items List */}
      <div className="bg-white rounded-3xl p-5 border border-brand-100 shadow-xs divide-y divide-brand-50">
        {items.map(item => (
          <CartItem key={item.productId} item={item} />
        ))}
      </div>

      {/* Cart Summary */}
      <CartSummary totalAmount={totalAmount} totalItems={totalItems} />

      {/* Proceed to Checkout Button */}
      <Link href="/checkout" className="block">
        <Button variant="primary" size="lg" className="w-full shadow-md shadow-brand-200 text-base font-bold py-4">
          Continuar y hacer encargo →
        </Button>
      </Link>
    </div>
  );
}
