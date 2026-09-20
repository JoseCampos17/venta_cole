import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/environment';

// Shared client - uses publishable key (works for DB queries)
export const supabase = createClient(env.supabase.url, env.supabase.anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
