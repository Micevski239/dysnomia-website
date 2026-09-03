-- ============================================================
-- Fix orders SELECT RLS policy causing 403 in client queries
--
-- Root cause:
-- Previous policy referenced auth.users inside RLS:
--   customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
-- This can produce permission errors in PostgREST policy evaluation.
--
-- Fix:
-- Use JWT email claim directly and keep explicit admin access.
-- ============================================================

-- Remove previous SELECT policies that may conflict
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (public.is_admin());

-- Authenticated customers can view only their own orders by email claim
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (
    lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
