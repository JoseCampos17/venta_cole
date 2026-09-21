'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/features/cart/CartContext';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CheckoutPage() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-8">
        <EmptyState
          icon={<ShoppingBag className="w-12 h-12 text-brand-300" />}
          title="Tu carrito está vacío"
          description="Agrega algunos productos antes de realizar tu encargo."
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
      <div className="flex items-center gap-3">
        <Link
          href="/carrito"
          className="p-2 rounded-2xl bg-white border border-brand-100 text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">
            Realizar Encargo ✨
          </h1>
          <p className="text-xs text-gray-500">
            Completa tus datos para apartar tus productos
          </p>
        </div>
      </div>

      <CheckoutForm />
    </div>
  );
}
