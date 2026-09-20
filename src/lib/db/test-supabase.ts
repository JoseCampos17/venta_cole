import { Client } from 'pg';
import fs from 'fs/promises';
import path from 'path';

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('⚠️ DATABASE_URL no está definida en las variables de entorno.');
    return;
  }
  console.log('Connecting to Supabase PostgreSQL at:', connectionString.replace(/:[^:@]+@/, ':****@'));

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ CONEXIÓN EXITOSA a Supabase PostgreSQL!');

    // Read SQL schema file
    const sqlPath = path.join(process.cwd(), 'supabase-schema.sql');
    const sql = await fs.readFile(sqlPath, 'utf-8');

    console.log('Executing database migrations/tables creation...');
    await client.query(sql);
    console.log('✅ TABLAS CREADAS CORRECTAMENTE EN SUPABASE!');

    // Check existing tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tablas existentes en tu Supabase:', res.rows.map(r => r.table_name));

    await client.end();
  } catch (err) {
    console.error('❌ Error conectando a Supabase:', err);
  }
}

testConnection();
