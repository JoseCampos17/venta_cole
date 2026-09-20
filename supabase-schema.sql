-- ==============================================================================
-- SCHEMA SUPABASE / POSTGRESQL PARA VENTASCOLE
-- ==============================================================================

-- 1. Categorías
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Productos
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Pedidos (Encargos)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY, -- Formato: PED-YYYYMMDD-XXXX
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  customer_classroom TEXT NOT NULL,
  delivery_date TEXT NOT NULL,
  delivery_time TEXT NOT NULL,
  payment_method TEXT NOT NULL, -- 'cash' | 'nequi'
  status TEXT NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE, ACEPTADO, RECHAZADO, PREPARANDO, LISTO, ENTREGADO, CANCELADO
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Ítems del Pedido (Snapshot inmutable)
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0
);

-- 5. Ventas Consolidadas (Se crean al pasar a ENTREGADO)
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  total_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_profit NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Ítems de Venta (Histórico inmutable)
CREATE TABLE IF NOT EXISTS sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  subtotal_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  subtotal_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  subtotal_profit NUMERIC(12, 2) NOT NULL DEFAULT 0
);

-- 7. Trazabilidad de Movimientos de Inventario
CREATE TABLE IF NOT EXISTS inventory_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'SALE' | 'PURCHASE' | 'ADJUSTMENT' | 'RETURN' | 'INITIAL'
  reference_id TEXT, -- ID del pedido si aplica
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Registro de Comunicaciones WhatsApp
CREATE TABLE IF NOT EXISTS communications (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  type TEXT NOT NULL, -- 'SURVEY' | 'THANKS' | 'NEW_PRODUCTS' | 'FOLLOWUP'
  status TEXT NOT NULL DEFAULT 'LINK_OPENED', -- 'LINK_OPENED' | 'MARKED_SENT'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  marked_sent_at TIMESTAMPTZ
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_movements(product_id);
