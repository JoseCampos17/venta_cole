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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100">
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-pink-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md shadow-pink-200">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-gray-900">Panel Administradora</h2>
          <p className="text-xs text-gray-500">Ingresa tu contraseña para administrar tus ventas</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-2xl text-center">
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
            className="w-full font-bold shadow-md shadow-pink-200"
          >
            <Lock className="w-4 h-4 mr-1.5" /> Entrar al Panel
          </Button>
        </form>

        <div className="text-center">
          <a
            href="/"
            className="text-xs text-pink-500 hover:text-pink-700 font-semibold transition-colors"
          >
            ← Volver a la tienda pública
          </a>
        </div>
      </div>
    </div>
  );
}
