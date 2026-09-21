'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, PackageCheck, Clock, ArrowRight } from 'lucide-react';

export default function SearchOrderPage() {
  const [orderCode, setOrderCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = orderCode.trim();
    if (!cleanCode) {
      setError('Por favor escribe el código de tu encargo (ej: PED-20260919-0001)');
      return;
    }
    router.push(`/pedidos/${cleanCode}`);
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 mx-auto flex items-center justify-center">
          <Search className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Rastrear mi Encargo</h1>
        <p className="text-xs text-slate-500">
          Consulta en tiempo real si tu pedido ya fue aceptado, está en preparación o listo para entrega en el colegio.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <Input
            label="Código del Encargo"
            placeholder="Ej: PED-20260919-0001"
            value={orderCode}
            onChange={e => {
              setOrderCode(e.target.value);
              setError(null);
            }}
            error={error ?? undefined}
            autoFocus
          />

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
            Consultar Estado <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>
      </div>

      <div className="bg-slate-100/70 rounded-2xl p-4 text-xs text-slate-500 text-center space-y-1">
        <p className="font-semibold text-slate-700">💡 ¿Dónde encuentro mi código?</p>
        <p>Aparece en la pantalla final cuando confirmas tu encargo.</p>
      </div>
    </div>
  );
}
