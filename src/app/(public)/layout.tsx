'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/features/cart/CartContext';
import { ShoppingBag, Search, ShieldCheck } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/config/constants';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { totalItems } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800 antialiased">
      {/* Top Banner Notice */}
      <div className="bg-rose-500 text-white text-[11px] sm:text-xs font-semibold py-1.5 px-4 text-center">
        <span>🎒 Encargos escolares directos • Pagas al recibir en efectivo o Nequi</span>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight block">
                {APP_NAME}
              </span>
              <p className="text-[11px] text-slate-400 font-medium leading-none hidden sm:block">
                {APP_TAGLINE}
              </p>
            </div>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Track Order link */}
            <Link
              href="/pedidos"
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Rastrear mi encargo</span>
              <span className="sm:hidden">Rastrear</span>
            </Link>

            {/* Cart Button */}
            <Link
              href="/carrito"
              className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Carrito</span>
              {totalItems > 0 && (
                <span className="bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <span>Tienda y catálogo para el colegio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/pedidos"
              className="text-slate-500 hover:text-rose-600 font-semibold transition-colors"
            >
              Consultar un encargo
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1 text-slate-400 hover:text-rose-600 font-semibold transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acceso Administradora</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
