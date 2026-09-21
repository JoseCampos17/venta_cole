'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(password);
    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || 'Contraseña incorrecta');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-100 via-brand-50 to-gold-100">
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-brand-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="Style Velaris"
            className="w-16 h-16 rounded-full object-cover mx-auto shadow-md ring-2 ring-gold-400 bg-white"
          />
          <h2 className="text-xl font-black text-gray-900">Style Velaris</h2>
          <p className="text-xs text-gray-500">Panel de Administración • Ingresa tu contraseña</p>
        </div>

        {error && (
          <div className="bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold p-3 rounded-2xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoFocus
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full font-bold shadow-md shadow-brand-200"
          >
            <Lock className="w-4 h-4 mr-1.5" /> Entrar al Panel
          </Button>
        </form>

        <div className="text-center">
          <a
            href="/"
            className="text-xs text-brand-500 hover:text-brand-700 font-semibold transition-colors"
          >
            ← Volver a la tienda pública
          </a>
        </div>
      </div>
    </div>
  );
}
