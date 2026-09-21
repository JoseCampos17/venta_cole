'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  TrendingUp,
  BarChart3,
  Users,
  LogOut,
  Store,
  Menu,
  X,
  ShieldAlert,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Inicio', icon: LayoutDashboard },
  { href: '/admin/pedidos', label: 'Encargos / Pedidos', icon: ShoppingBag },
  { href: '/admin/productos', label: 'Mis Productos', icon: Package },
  { href: '/admin/clientes', label: 'Mis Clientes', icon: Users },
  { href: '/admin/inventario', label: '¿Qué pasó con mi stock?', icon: Layers },
  { href: '/admin/ventas', label: 'Historial de Ventas', icon: TrendingUp },
  { href: '/admin/estadisticas', label: 'Mis Ganancias', icon: BarChart3 },
];

export function AdminHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const pathname = usePathname();
  const { logout, isSuperAdmin } = useAuth();

  const fetchPendingCount = React.useCallback(() => {
    fetch('/api/orders?status=PENDIENTE')
      .then(res => (res.ok ? res.json() : []))
      .then(orders => setPendingCount(orders.length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPendingCount();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchPendingCount();
      }
    }, 8000);

    const handleFocus = () => fetchPendingCount();
    const handleOrderChange = () => fetchPendingCount();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('app:order-changed', handleOrderChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('app:order-changed', handleOrderChange);
    };
  }, [pathname, fetchPendingCount]);

  return (
    <>
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between md:hidden shadow-xs">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-xs shadow-xs">
            VC
          </div>
          <div>
            <span className="font-black text-slate-900 text-sm block leading-none">VentasCole</span>
            <span className="text-[9px] text-brand-500 font-bold uppercase block mt-0.5">
              {isSuperAdmin ? '👑 Super Admin' : 'Admin'}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:text-brand-600 text-xs font-bold flex items-center gap-1"
          >
            <Store className="w-3.5 h-3.5 text-brand-500" />
            <span>Tienda</span>
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Abrir menú"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Fullscreen Drawer Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-white animate-in slide-in-from-top duration-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="font-extrabold text-slate-900 text-base">
              {isSuperAdmin ? '👑 Menú Super Administrador' : 'Menú Administradora'}
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-xl bg-slate-100 text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.href === '/admin/pedidos' && pendingCount > 0 && (
                    <span className="bg-amber-400 text-slate-950 text-xs px-2 py-0.5 rounded-full font-black">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}

            {isSuperAdmin && (
              <Link
                href="/admin/superadmin"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                  pathname === '/admin/superadmin'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>👑 Limpiar Base de Datos</span>
              </Link>
            )}
          </nav>

          <div className="p-4 border-t border-slate-100 space-y-2">
            <Link
              href="/"
              target="_blank"
              onClick={() => setIsMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-100 text-slate-800 font-bold text-sm"
            >
              <Store className="w-4 h-4 text-brand-500" />
              <span>Ver tienda pública</span>
            </Link>

            <button
              onClick={() => {
                setIsMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-brand-50 text-brand-600 font-bold text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sticky Tab Bar for Fast Mobile Thumb Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1 px-2 flex items-center justify-around md:hidden shadow-lg">
        {/* 1. Dashboard */}
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center min-w-[50px] py-1 text-[10px] font-bold transition-colors ${
            pathname === '/admin' ? 'text-brand-600' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Inicio</span>
        </Link>

        {/* 2. Pedidos */}
        <Link
          href="/admin/pedidos"
          className={`relative flex flex-col items-center justify-center min-w-[50px] py-1 text-[10px] font-bold transition-colors ${
            pathname.startsWith('/admin/pedidos') ? 'text-brand-600' : 'text-slate-400'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span>Pedidos</span>
          {pendingCount > 0 && (
            <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-brand-600 text-white text-[8px] font-black flex items-center justify-center animate-pulse">
              {pendingCount}
            </span>
          )}
        </Link>

        {/* 3. Productos */}
        <Link
          href="/admin/productos"
          className={`flex flex-col items-center justify-center min-w-[50px] py-1 text-[10px] font-bold transition-colors ${
            pathname.startsWith('/admin/productos') ? 'text-brand-600' : 'text-slate-400'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Productos</span>
        </Link>

        {/* 4. Clientes */}
        <Link
          href="/admin/clientes"
          className={`flex flex-col items-center justify-center min-w-[50px] py-1 text-[10px] font-bold transition-colors ${
            pathname.startsWith('/admin/clientes') ? 'text-brand-600' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Clientes</span>
        </Link>

        {/* 5. Menú / Más */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center justify-center min-w-[50px] py-1 text-[10px] font-bold text-slate-400 hover:text-slate-700"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>Menú</span>
        </button>
      </nav>
    </>
  );
}
