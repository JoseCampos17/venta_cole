'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  ShieldAlert,
  Trash2,
  RefreshCw,
  Sparkles,
  Database,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShoppingBag,
  Package,
  TrendingUp,
} from 'lucide-react';

export default function SuperAdminPage() {
  const { isSuperAdmin, isLoading: isAuthLoading } = useAuth();
  const [isActing, setIsActing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [counts, setCounts] = useState<{ products: number; orders: number; sales: number } | null>(null);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const [prodRes, orderRes, saleRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/sales'),
      ]);
      const products = prodRes.ok ? await prodRes.json() : [];
      const orders = orderRes.ok ? await orderRes.json() : [];
      const sales = saleRes.ok ? await saleRes.json() : [];
      setCounts({
        products: products.length,
        orders: orders.length,
        sales: sales.length,
      });
    } catch {
      // ignore
    }
  };

  const handleReset = async (action: 'orders_only' | 'full_wipe' | 'seed_demo', confirmPrompt: string) => {
    if (!window.confirm(confirmPrompt)) {
      return;
    }

    setIsActing(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/database/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ text: data.message, type: 'success' });
        await loadCounts();
      } else {
        setStatusMessage({ text: data.error || 'Error al ejecutar la acción', type: 'error' });
      }
    } catch {
      setStatusMessage({ text: 'Error de conexión con el servidor', type: 'error' });
    } finally {
      setIsActing(false);
    }
  };

  if (isAuthLoading) {
    return <LoadingState message="Verificando permisos de Super Administrador..." />;
  }

  if (!isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-slate-900">Acceso Exclusivo de Super Admin</h1>
        <p className="text-xs text-slate-500">
          Para acceder a esta zona de mantenimiento y limpieza de base de datos, debes iniciar sesión con la clave de <strong>Super Administrador</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            👑
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
              Panel de Mantenimiento
            </span>
            <h1 className="text-2xl font-black">Zona de Super Administrador</h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Desde aquí puedes limpiar los pedidos de prueba realizados durante la fase de demostración, o vaciar la base de datos para comenzar a registrar los productos y ventas reales del colegio.
        </p>
      </div>

      {/* Database Quick Counters */}
      {counts && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
            <Package className="w-5 h-5 mx-auto text-rose-500" />
            <span className="text-xl font-black text-slate-900 block">{counts.products}</span>
            <span className="text-[11px] text-slate-500 font-bold">Productos</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
            <ShoppingBag className="w-5 h-5 mx-auto text-amber-500" />
            <span className="text-xl font-black text-slate-900 block">{counts.orders}</span>
            <span className="text-[11px] text-slate-500 font-bold">Encargos</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
            <TrendingUp className="w-5 h-5 mx-auto text-emerald-500" />
            <span className="text-xl font-black text-slate-900 block">{counts.sales}</span>
            <span className="text-[11px] text-slate-500 font-bold">Ventas</span>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Option 1: Clean transactions only (Keep catalog) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 hover:border-amber-300 transition-colors flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              🧹
            </div>
            <h3 className="text-base font-black text-slate-900">
              1. Limpiar sólo Encargos y Ventas de prueba
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Borra todos los pedidos, ventas históricas, registros de WhatsApp y movimientos de inventario de prueba.
            </p>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 font-semibold">
              ✨ <strong>Conserva tus productos y fotos:</strong> Tus categorías y productos creados se mantienen listos para usarse.
            </div>
          </div>

          <Button
            variant="secondary"
            size="md"
            isLoading={isActing}
            onClick={() =>
              handleReset(
                'orders_only',
                '¿Estás seguro de que deseas borrar todos los pedidos y ventas de prueba? (Los productos y categorías NO se borrarán).'
              )
            }
            className="w-full font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 border-0"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Limpiar Transacciones de Prueba
          </Button>
        </div>

        {/* Option 2: Full Factory Reset */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 hover:border-rose-300 transition-colors flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              🗑️
            </div>
            <h3 className="text-base font-black text-slate-900">
              2. Limpieza Total (Reinicio de Fábrica)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Borra absolutamente todo: encargos, ventas, movimientos y <strong>todos los productos</strong>.
            </p>
            <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100 text-[11px] text-rose-800 font-semibold">
              ⚠️ Deja la base de datos 100% en blanco para ingresar el inventario real desde cero.
            </div>
          </div>

          <Button
            variant="danger"
            size="md"
            isLoading={isActing}
            onClick={() =>
              handleReset(
                'full_wipe',
                '⚠️ ¡ATENCIÓN! Esto borrará TODOS los productos, fotos, pedidos y ventas. ¿Deseas continuar?'
              )
            }
            className="w-full font-bold"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Vaciar Base de Datos Completa
          </Button>
        </div>

        {/* Option 3: Seed Demo Data */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 hover:border-purple-300 transition-colors flex flex-col justify-between md:col-span-2">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              📦
            </div>
            <h3 className="text-base font-black text-slate-900">
              3. Restablecer Catálogo de Demostración
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Carga automáticamente los 6 productos de prueba iniciales (Gloss, Ganchos Mariposa, Coleteros, etc.) con sus categorías para que puedas mostrar la aplicación en cualquier momento.
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            isLoading={isActing}
            onClick={() =>
              handleReset(
                'seed_demo',
                '¿Deseas restaurar los productos de prueba de ejemplo?'
              )
            }
            className="w-full sm:w-auto font-bold self-start"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" /> Cargar Productos de Ejemplo
          </Button>
        </div>
      </div>
    </div>
  );
}
