import { Pool } from 'pg';

const globalForDb = globalThis as unknown as { pgPool?: Pool };

export function getPool(): Pool {
  if (globalForDb.pgPool) {
    return globalForDb.pgPool;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  const poolInstance = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForDb.pgPool = poolInstance;
  }

  return poolInstance;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  try {
    const p = getPool();
    const res = await p.query(text, params);
    return res.rows;
  } catch (error) {
    console.error('Database query error:', error, 'Query was:', text);
    throw error;
  }
}
