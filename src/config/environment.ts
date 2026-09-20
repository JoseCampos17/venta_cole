const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  dataProvider: (process.env.DATA_PROVIDER ?? 'supabase') as 'json' | 'supabase',
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? '',
  superAdminPasswordHash: process.env.SUPER_ADMIN_PASSWORD_HASH ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'VentasCole',
  appTagline: process.env.NEXT_PUBLIC_APP_TAGLINE ?? 'Accesorios y cosméticos 💗',
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};
