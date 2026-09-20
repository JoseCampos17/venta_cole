import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { env } from '@/config/environment';
import { SessionPayload, UserRole } from '@/types/auth';

const SECRET = new TextEncoder().encode(env.jwtSecret);
const COOKIE_NAME = 'ventas_admin_session';

export async function createSession(userId = 'admin', role: UserRole = 'admin'): Promise<string> {
  const token = await new SignJWT({
    userId,
    role,
    email: role === 'superadmin' ? 'superadmin@ventascole.local' : 'admin@ventascole.local',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

export async function verifySession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: (payload.role as UserRole) || 'admin',
      expiresAt: new Date((payload.exp as number) * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
