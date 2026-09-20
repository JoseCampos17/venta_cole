import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { env } from '@/config/environment';
import { query } from '@/lib/db/supabase/db';
import { writeJsonFile } from '@/lib/db/json/json-client';
import fs from 'fs/promises';
import path from 'path';

import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '@/lib/db/seed-data';

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
        for (const cat of INITIAL_CATEGORIES) {
          await query(
            `INSERT INTO categories (id, name, slug, is_active, created_at)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE 
             SET name = EXCLUDED.name, slug = EXCLUDED.slug, is_active = EXCLUDED.is_active`,
            [cat.id, cat.name, cat.slug, cat.isActive, cat.createdAt]
          );
        }

        for (const prod of INITIAL_PRODUCTS) {
          await query(
            `INSERT INTO products (id, name, description, category_id, sale_price, cost_price, stock, image_url, is_active, is_deleted, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             ON CONFLICT (id) DO UPDATE 
             SET name = EXCLUDED.name, description = EXCLUDED.description, category_id = EXCLUDED.category_id,
                 sale_price = EXCLUDED.sale_price, cost_price = EXCLUDED.cost_price, stock = EXCLUDED.stock,
                 image_url = EXCLUDED.image_url, is_active = EXCLUDED.is_active, is_deleted = EXCLUDED.is_deleted,
                 updated_at = EXCLUDED.updated_at`,
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
      } else {
        await writeJsonFile('categories.json', INITIAL_CATEGORIES);
        await writeJsonFile('products.json', INITIAL_PRODUCTS);
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
