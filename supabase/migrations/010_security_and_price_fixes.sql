-- ============================================================
-- Security & price fixes found in the October 2026 audit.
-- REVIEW BEFORE APPLYING. First check the live state with:
--   select tablename, policyname, cmd, qual from pg_policies where schemaname = 'public' order by 1, 2;
--   select * from public.print_prices order by print_type, size_id;
-- Safe to run more than once.
-- ============================================================

-- ------------------------------------------------------------
-- A. Remove old "any logged-in user" policies.
-- Created by supabase-schema.sql / supabase-collections.sql, never dropped by
-- migration 003 (it dropped differently named policies). Policies are OR-ed, so
-- while these exist ANY registered customer can edit/delete products and
-- collections. Admin access keeps working through the is_admin() policies.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admin full access" ON public.products;
DROP POLICY IF EXISTS "Admin manage collections" ON public.collections;
DROP POLICY IF EXISTS "Admin manage collection mappings" ON public.collection_products;

-- Admins still need to read drafts and inactive collections
DROP POLICY IF EXISTS "Admins read all products" ON public.products;
CREATE POLICY "Admins read all products" ON public.products FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins read all collections" ON public.collections;
CREATE POLICY "Admins read all collections" ON public.collections FOR SELECT USING (public.is_admin());

-- ------------------------------------------------------------
-- B. Align the server price table with the prices shown on the site
-- (src/config/printOptions.ts → priceMatrix). create_validated_order() charges
-- from print_prices; migration 003 seeded the OLD prices (canvas 50x70 = 2640
-- while the site shows 1299). If the live table already has the new prices
-- this is a no-op.
-- ------------------------------------------------------------
INSERT INTO public.print_prices (print_type, size_id, price_mkd) VALUES
  ('canvas', '50x70', 1299), ('canvas', '60x90', 1649), ('canvas', '70x100', 1959),
  ('canvas', '80x120', 2249), ('canvas', '100x150', 3099),
  ('roll', '50x70', 749), ('roll', '60x90', 899), ('roll', '70x100', 1099),
  ('roll', '80x120', 1549), ('roll', '100x150', 2049),
  ('framed', '50x70', 3599), ('framed', '60x90', 4299), ('framed', '70x100', 4899),
  ('framed', '80x120', 5549), ('framed', '100x150', 7039)
ON CONFLICT (print_type, size_id) DO UPDATE SET price_mkd = EXCLUDED.price_mkd;

-- ------------------------------------------------------------
-- C. Admin can actually delete orders (the admin "Delete order" button
-- currently reports success but RLS silently deletes 0 rows).
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING (public.is_admin());
