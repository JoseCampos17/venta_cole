import { NextResponse } from 'next/server';
import { destroySession, verifySession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  await destroySession();
  return NextResponse.json({ success: true, message: 'Sesión cerrada' });
}

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: session });
}
