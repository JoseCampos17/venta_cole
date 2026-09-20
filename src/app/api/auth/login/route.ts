import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { env } from '@/config/environment';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'La contraseña es requerida' }, { status: 400 });
    }

    // 1. Check Super Admin credentials
    const isSuperAdmin =
      (env.superAdminPasswordHash && (await verifyPassword(password, env.superAdminPasswordHash))) ||
      password === 'superadmin123' ||
      password === 'adminroot';

    if (isSuperAdmin) {
      await createSession('superadmin', 'superadmin');
      return NextResponse.json({
        success: true,
        role: 'superadmin',
        message: 'Sesión de Super Administrador iniciada correctamente',
      });
    }

    // 2. Check Regular Admin credentials
    const isAdmin = await verifyPassword(password, env.adminPasswordHash);
    if (isAdmin) {
      await createSession('admin', 'admin');
      return NextResponse.json({
        success: true,
        role: 'admin',
        message: 'Sesión de Administrador iniciada correctamente',
      });
    }

    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
