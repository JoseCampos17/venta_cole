import { Client } from 'pg';
import fs from 'fs/promises';
import path from 'path';

async function seedSupabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('⚠️ DATABASE_URL no está configurada.');
    return;
  }
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log(' Conectado a Supabase PostgreSQL para migración y seed');

    // 1. Run schema first
    const sqlPath = path.join(process.cwd(), 'supabase-schema.sql');
    const sql = await fs.readFile(sqlPath, 'utf-8');
    await client.query(sql);
    console.log(' Tablas creadas/verificadas');

    // 2. Categories
    const categoriesData = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data', 'categories.json'), 'utf-8'));
    for (const cat of categoriesData) {
      await client.query(
        `INSERT INTO categories (id, name, slug, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE 
         SET name = EXCLUDED.name, slug = EXCLUDED.slug, is_active = EXCLUDED.is_active`,
        [cat.id, cat.name, cat.slug, cat.isActive, cat.createdAt]
      );
    }
    console.log(` Categorías sincronizadas: ${categoriesData.length}`);

    // 3. Products
    const productsData = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data', 'products.json'), 'utf-8'));
    for (const prod of productsData) {
      await client.query(
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
    console.log(` Productos sincronizados: ${productsData.length}`);

    // 4. Orders & Order Items
    const ordersData = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data', 'orders.json'), 'utf-8'));
    for (const order of ordersData) {
      await client.query(
        `INSERT INTO orders (id, customer_name, customer_whatsapp, customer_classroom, delivery_date, delivery_time, payment_method, status, total_amount, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE 
         SET customer_name = EXCLUDED.customer_name, customer_whatsapp = EXCLUDED.customer_whatsapp,
             customer_classroom = EXCLUDED.customer_classroom, delivery_date = EXCLUDED.delivery_date,
             delivery_time = EXCLUDED.delivery_time, payment_method = EXCLUDED.payment_method,
             status = EXCLUDED.status, total_amount = EXCLUDED.total_amount, notes = EXCLUDED.notes`,
        [
          order.id,
          order.customerName,
          order.customerWhatsapp,
          order.customerClassroom,
          order.deliveryDate,
          order.deliveryTime,
          order.paymentMethod,
          order.status,
          order.totalAmount,
          order.notes || null,
          order.createdAt,
        ]
      );

      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          await client.query(
            `INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, unit_cost, quantity, subtotal)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO UPDATE
             SET unit_price = EXCLUDED.unit_price, quantity = EXCLUDED.quantity, subtotal = EXCLUDED.subtotal`,
            [
              item.id,
              order.id,
              item.productId,
              item.productName,
              item.unitPrice,
              item.unitCost || 0,
              item.quantity,
              item.subtotal,
            ]
          );
        }
      }
    }
    console.log(` Encargos sincronizados: ${ordersData.length}`);

    // 5. Sales & Sale Items
    const salesData = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data', 'sales.json'), 'utf-8'));
    for (const sale of salesData) {
      await client.query(
        `INSERT INTO sales (id, order_id, customer_name, total_revenue, total_cost, total_profit, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE 
         SET total_revenue = EXCLUDED.total_revenue, total_cost = EXCLUDED.total_cost, total_profit = EXCLUDED.total_profit`,
        [
          sale.id,
          sale.orderId,
          sale.customerName,
          sale.totalRevenue,
          sale.totalCost,
          sale.totalProfit,
          sale.createdAt,
        ]
      );

      if (sale.items && Array.isArray(sale.items)) {
        for (const item of sale.items) {
          await client.query(
            `INSERT INTO sale_items (id, sale_id, product_id, product_name, quantity, unit_price, unit_cost, subtotal_revenue, subtotal_cost, subtotal_profit)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO UPDATE 
             SET quantity = EXCLUDED.quantity, unit_price = EXCLUDED.unit_price, subtotal_revenue = EXCLUDED.subtotal_revenue`,
            [
              item.id,
              sale.id,
              item.productId,
              item.productName,
              item.quantity,
              item.unitPrice,
              item.unitCost || 0,
              item.subtotalRevenue,
              item.subtotalCost || 0,
              item.subtotalProfit || 0,
            ]
          );
        }
      }
    }
    console.log(` Ventas sincronizadas: ${salesData.length}`);

    // 6. Inventory movements
    const movementsData = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data', 'inventory-movements.json'), 'utf-8'));
    for (const mov of movementsData) {
      await client.query(
        `INSERT INTO inventory_movements (id, product_id, product_name, type, quantity, reason, reference_id, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          mov.id,
          mov.productId,
          mov.productName,
          mov.type,
          mov.quantity,
          mov.reason,
          mov.referenceId || null,
          mov.notes || null,
          mov.createdAt,
        ]
      );
    }
    console.log(` Movimientos de inventario sincronizados: ${movementsData.length}`);

    // 7. Communications
    const commsData = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data', 'communications.json'), 'utf-8'));
    for (const comm of commsData) {
      await client.query(
        `INSERT INTO communications (id, order_id, customer_name, customer_whatsapp, type, status, created_at, marked_sent_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          comm.id,
          comm.orderId,
          comm.customerName,
          comm.customerWhatsapp,
          comm.type,
          comm.status,
          comm.createdAt,
          comm.markedSentAt || null,
        ]
      );
    }
    console.log(` Comunicaciones sincronizadas: ${commsData.length}`);

    console.log(' TODO SE HA SINCRONIZADO CORRECTAMENTE CON SUPABASE!');
    await client.end();
  } catch (err) {
    console.error(' Error en seed:', err);
    process.exit(1);
  }
}

seedSupabase();
