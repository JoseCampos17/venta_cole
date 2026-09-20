import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { env } from '@/config/environment';
import { query } from '@/lib/db/supabase/db';
import { writeJsonFile } from '@/lib/db/json/json-client';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de Super Administrador.' },
        { status: 403 }
      );
    }

    const { action } = (await req.json()) as { action: 'orders_only' | 'full_wipe' | 'seed_demo' };

    if (action === 'orders_only') {
      // 1. Wipe test transactions (orders, sales, inventory, communications)
      if (env.dataProvider === 'supabase') {
        await query('DELETE FROM communications');
        await query('DELETE FROM inventory_movements');
        await query('DELETE FROM sale_items');
        await query('DELETE FROM sales');
        await query('DELETE FROM order_items');
        await query('DELETE FROM orders');
      } else {
        await writeJsonFile('communications.json', []);
        await writeJsonFile('inventory-movements.json', []);
        await writeJsonFile('sales.json', []);
        await writeJsonFile('orders.json', []);
      }

      return NextResponse.json({
        success: true,
        message: '¡Historial de pruebas limpiado con éxito! (Tus productos y categorías se mantuvieron intactos).',
      });
    }

    if (action === 'full_wipe') {
      // 2. Wipe everything (products + transactions)
      if (env.dataProvider === 'supabase') {
        await query('DELETE FROM communications');
        await query('DELETE FROM inventory_movements');
        await query('DELETE FROM sale_items');
        await query('DELETE FROM sales');
        await query('DELETE FROM order_items');
        await query('DELETE FROM orders');
        await query('DELETE FROM products');
      } else {
        await writeJsonFile('communications.json', []);
        await writeJsonFile('inventory-movements.json', []);
        await writeJsonFile('sales.json', []);
        await writeJsonFile('orders.json', []);
        await writeJsonFile('products.json', []);
      }

      return NextResponse.json({
        success: true,
        message: '¡Base de datos completamente vaciada! Lista para registrar los productos reales.',
      });
    }

    if (action === 'seed_demo') {
      // 3. Re-seed default demo items
      if (env.dataProvider === 'supabase') {
        const sqlPath = path.join(process.cwd(), 'supabase-schema.sql');
        const sql = await fs.readFile(sqlPath, 'utf-8');
        await query(sql);

        const categoriesData = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data', 'categories.json'), 'utf-8'));
        for (const cat of categoriesData) {
          await query(
            `INSERT INTO categories (id, name, slug, is_active, created_at)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO NOTHING`,
            [cat.id, cat.name, cat.slug, cat.isActive, cat.createdAt]
          );
        }

        const productsData = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data', 'products.json'), 'utf-8'));
        for (const prod of productsData) {
          await query(
            `INSERT INTO products (id, name, description, category_id, sale_price, cost_price, stock, image_url, is_active, is_deleted, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             ON CONFLICT (id) DO NOTHING`,
            [
              prod.id,
              prod.name,
              prod.description,
              prod.categoryId,
              prod.salePrice,
              prod.costPrice,
              prod.stock,
              prod.imageUrl || null,
              prod.isActive,
              prod.isDeleted || false,
              prod.createdAt,
              prod.updatedAt,
            ]
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: '¡Datos de prueba restablecidos correctamente!',
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error: any) {
    console.error('Error during database reset:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al limpiar la base de datos' },
      { status: 500 }
    );
  }
}
