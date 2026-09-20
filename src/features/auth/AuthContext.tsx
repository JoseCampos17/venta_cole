'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  isSuperAdmin: boolean;
  login: (password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
        setRole(data.user?.role || 'admin');
      } else {
        setIsAuthenticated(false);
        setRole(null);
      }
    } catch {
      setIsAuthenticated(false);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Contraseña incorrecta' };
      }

      setIsAuthenticated(true);
      setRole(data.role || 'admin');
      return { success: true, role: data.role };
    } catch {
      return { success: false, error: 'Error al conectar con el servidor' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setIsAuthenticated(false);
      setRole(null);
      router.push('/admin/login');
    }
  };

  const isSuperAdmin = role === 'superadmin';

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        role,
        isSuperAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
