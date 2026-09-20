const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  dataProvider: (process.env.DATA_PROVIDER ?? 'supabase') as 'json' | 'supabase',
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? '$2a$10$PLACEHOLDER_HASH_CHANGE_THIS',
  superAdminPasswordHash: process.env.SUPER_ADMIN_PASSWORD_HASH ?? '$2a$10$PLACEHOLDER_HASH_CHANGE_THIS',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'VentasCole',
  appTagline: process.env.NEXT_PUBLIC_APP_TAGLINE ?? 'Accesorios y cosméticos 💗',
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://ogduluwvhezpvwimffdi.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_12LXN3py4GpVU1uD3lW0uQ_M4e1teg2',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'sb_secret_cXZ-ISlGDluxVWYZQ4j-tQ_QE2p8RJe',
  },
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};
