'use client';

import React from 'react';
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

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout, isSuperAdmin } = useAuth();
  const [pendingCount, setPendingCount] = React.useState(0);

  const fetchPendingCount = React.useCallback(() => {
    fetch('/api/orders?status=PENDIENTE')
      .then(res => (res.ok ? res.json() : []))
      .then(orders => setPendingCount(orders.length))
      .catch(() => {});
  }, []);

  React.useEffect(() => {
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
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center text-white font-black text-sm shadow-xs">
            VC
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-base leading-tight">VentasCole</h1>
            <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">
              {isSuperAdmin ? '👑 Super Admin' : 'Tu Negocio 💗'}
            </span>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 ${
                isActive
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.href === '/admin/pedidos' && pendingCount > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-amber-300 text-slate-950' : 'bg-amber-400 text-slate-950 animate-pulse'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}

        {/* SuperAdmin Special Maintenance Tab */}
        {isSuperAdmin && (
          <Link
            href="/admin/superadmin"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 ${
              pathname === '/admin/superadmin'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>👑 Limpiar BD (Super Admin)</span>
          </Link>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Store className="w-4 h-4 text-rose-500" />
          <span>Ver tienda pública</span>
        </Link>

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
