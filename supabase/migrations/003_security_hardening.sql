-- ============================================================
-- Security Hardening Migration
-- Fixes: PII exposure, missing RBAC, client-side price trust
-- Run this migration in your Supabase SQL editor
-- ============================================================

-- ============================================================
-- 1. ADMIN ROLE SYSTEM
-- ============================================================

-- User roles table (admin whitelist)
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write user_roles
CREATE POLICY "Admins can read user_roles" ON public.user_roles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage user_roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 2. FIX ORDERS TABLE RLS
-- Customers can only see their own orders (by email match)
-- Admins can see all orders
-- ============================================================

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view orders" ON orders;

-- Customers see only orders matching their email (works for both guest and logged-in)
-- Anon users can still read orders by direct ID lookup (for order confirmation page)
-- but only if they know the exact order ID (UUID is unguessable)
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    -- Admin can see all
    public.is_admin()
    -- Logged-in user can see orders matching their email
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    -- Anon users: allow select but only via RPC (see below)
  );

-- For the order confirmation page (anon/guest access by order ID),
-- we create a secure RPC function instead of a wide-open SELECT policy
CREATE OR REPLACE FUNCTION public.get_order_by_id(order_id UUID)
RETURNS SETOF orders AS $$
  SELECT * FROM orders WHERE id = order_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Also drop and recreate the UPDATE policy to require admin
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- 3. FIX ADMIN-WRITE POLICIES ON ALL TABLES
-- Replace "authenticated" with "is_admin()" checks
-- ============================================================

-- Reviews: restrict write operations to admin
DROP POLICY IF EXISTS "Authenticated can view all reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated can update reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated can delete reviews" ON reviews;

CREATE POLICY "Admins can view all reviews" ON reviews
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update reviews" ON reviews
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete reviews" ON reviews
  FOR DELETE USING (public.is_admin());

-- Products: restrict write to admin (if policies exist)
DO $$ BEGIN
  -- Drop existing permissive policies if they exist
  DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
  DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
  DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
  DROP POLICY IF EXISTS "Authenticated can insert products" ON products;
  DROP POLICY IF EXISTS "Authenticated can update products" ON products;
  DROP POLICY IF EXISTS "Authenticated can delete products" ON products;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

-- Create admin-only product write policies
CREATE POLICY "Admins can insert products" ON products
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (public.is_admin());

-- Featured sections: restrict write to admin
DROP POLICY IF EXISTS "Authenticated users can insert featured_sections" ON featured_sections;
DROP POLICY IF EXISTS "Authenticated users can update featured_sections" ON featured_sections;
DROP POLICY IF EXISTS "Authenticated users can delete featured_sections" ON featured_sections;

CREATE POLICY "Admins can insert featured_sections" ON featured_sections
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update featured_sections" ON featured_sections
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete featured_sections" ON featured_sections
  FOR DELETE USING (public.is_admin());

-- Bestseller products: restrict write to admin
DROP POLICY IF EXISTS "Authenticated users can insert bestseller_products" ON bestseller_products;
DROP POLICY IF EXISTS "Authenticated users can update bestseller_products" ON bestseller_products;
DROP POLICY IF EXISTS "Authenticated users can delete bestseller_products" ON bestseller_products;

CREATE POLICY "Admins can insert bestseller_products" ON bestseller_products
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update bestseller_products" ON bestseller_products
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete bestseller_products" ON bestseller_products
  FOR DELETE USING (public.is_admin());

-- Collections: restrict write to admin (if table exists)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can insert collections" ON collections;
  DROP POLICY IF EXISTS "Authenticated users can update collections" ON collections;
  DROP POLICY IF EXISTS "Authenticated users can delete collections" ON collections;
  DROP POLICY IF EXISTS "Authenticated can insert collections" ON collections;
  DROP POLICY IF EXISTS "Authenticated can update collections" ON collections;
  DROP POLICY IF EXISTS "Authenticated can delete collections" ON collections;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

DO $$ BEGIN
  EXECUTE 'CREATE POLICY "Admins can insert collections" ON collections FOR INSERT WITH CHECK (public.is_admin())';
  EXECUTE 'CREATE POLICY "Admins can update collections" ON collections FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin())';
  EXECUTE 'CREATE POLICY "Admins can delete collections" ON collections FOR DELETE USING (public.is_admin())';
EXCEPTION WHEN undefined_table THEN
  NULL;
WHEN duplicate_object THEN
  NULL;
END $$;

-- collection_products join table
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can insert collection_products" ON collection_products;
  DROP POLICY IF EXISTS "Authenticated users can delete collection_products" ON collection_products;
  DROP POLICY IF EXISTS "Authenticated can insert collection_products" ON collection_products;
  DROP POLICY IF EXISTS "Authenticated can delete collection_products" ON collection_products;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

DO $$ BEGIN
  EXECUTE 'CREATE POLICY "Admins can insert collection_products" ON collection_products FOR INSERT WITH CHECK (public.is_admin())';
  EXECUTE 'CREATE POLICY "Admins can delete collection_products" ON collection_products FOR DELETE USING (public.is_admin())';
EXCEPTION WHEN undefined_table THEN
  NULL;
WHEN duplicate_object THEN
  NULL;
END $$;

-- ============================================================
-- 4. SERVER-SIDE PRICE VALIDATION
-- Database function that validates prices before inserting orders
-- ============================================================

-- Price matrix stored in the database for server-side validation
CREATE TABLE IF NOT EXISTS public.print_prices (
  print_type TEXT NOT NULL CHECK (print_type IN ('canvas', 'roll', 'framed')),
  size_id TEXT NOT NULL,
  price_mkd INTEGER NOT NULL,
  PRIMARY KEY (print_type, size_id)
);

ALTER TABLE public.print_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read print_prices" ON public.print_prices
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage print_prices" ON public.print_prices
  FOR ALL USING (public.is_admin());

-- Seed the price matrix (must match printOptions.ts)
INSERT INTO public.print_prices (print_type, size_id, price_mkd) VALUES
  ('canvas', '50x70', 2640),
  ('canvas', '60x90', 2930),
  ('canvas', '70x100', 3260),
  ('canvas', '80x120', 3460),
  ('canvas', '100x150', 3800),
  ('roll', '50x70', 1000),
  ('roll', '60x90', 1150),
  ('roll', '70x100', 1300),
  ('roll', '80x120', 1700),
  ('roll', '100x150', 2150),
  ('framed', '50x70', 5043),
  ('framed', '60x90', 5596),
  ('framed', '70x100', 6150),
  ('framed', '80x120', 6765),
  ('framed', '100x150', 7749)
ON CONFLICT (print_type, size_id) DO UPDATE SET price_mkd = EXCLUDED.price_mkd;

-- Secure order creation function with server-side price validation
CREATE OR REPLACE FUNCTION public.create_validated_order(
  p_customer_email TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_shipping_address JSONB,
  p_items JSONB,
  p_notes TEXT DEFAULT NULL
)
RETURNS orders AS $$
DECLARE
  v_order orders;
  v_item JSONB;
  v_server_price INTEGER;
  v_validated_items JSONB := '[]'::JSONB;
  v_subtotal INTEGER := 0;
  v_item_total INTEGER;
  v_order_number TEXT;
BEGIN
  -- Validate each item's price against the server-side price matrix
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Look up the correct price
    SELECT price_mkd INTO v_server_price
    FROM public.print_prices
    WHERE print_type = v_item->>'printType'
      AND size_id = v_item->>'sizeId';

    IF v_server_price IS NULL THEN
      RAISE EXCEPTION 'Invalid print type/size combination: % / %',
        v_item->>'printType', v_item->>'sizeId';
    END IF;

    -- Calculate line total with server price
    v_item_total := v_server_price * (v_item->>'quantity')::INTEGER;
    v_subtotal := v_subtotal + v_item_total;

    -- Build validated item with server-side price
    v_validated_items := v_validated_items || jsonb_build_object(
      'productId', v_item->>'productId',
      'productTitle', v_item->>'productTitle',
      'productSlug', v_item->>'productSlug',
      'imageUrl', v_item->>'imageUrl',
      'printType', v_item->>'printType',
      'sizeId', v_item->>'sizeId',
      'sizeLabel', v_item->>'sizeLabel',
      'quantity', (v_item->>'quantity')::INTEGER,
      'unitPrice', v_server_price
    );
  END LOOP;

  -- Generate order number
  v_order_number := 'DYS-' || upper(to_hex(extract(epoch FROM now())::INTEGER)) || '-' ||
                    upper(substring(md5(random()::TEXT) FROM 1 FOR 4));

  -- Insert the order with validated prices
  INSERT INTO orders (
    order_number, customer_email, customer_name, customer_phone,
    shipping_address, items, subtotal, shipping_cost, total_amount,
    currency, status, notes
  ) VALUES (
    v_order_number, p_customer_email, p_customer_name, p_customer_phone,
    p_shipping_address, v_validated_items, v_subtotal, 0, v_subtotal,
    'MKD', 'pending', p_notes
  ) RETURNING * INTO v_order;

  RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. SEED YOUR ADMIN USER
-- Replace the UUID below with your actual admin user ID from
-- Supabase Auth > Users, then run this INSERT.
-- ============================================================

-- IMPORTANT: Uncomment and replace with your admin user's UUID:
-- INSERT INTO public.user_roles (user_id, role) VALUES
--   ('YOUR-ADMIN-USER-UUID-HERE', 'admin');
