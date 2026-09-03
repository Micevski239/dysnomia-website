-- ============================================================
-- Storage Policies & Rate Limiting
-- Run this migration in your Supabase SQL editor
-- ============================================================

-- ============================================================
-- 1. STORAGE BUCKET POLICIES (on storage.objects)
-- Restrict upload/delete to admins only
-- ============================================================

-- Drop existing permissive storage policies on product-images
-- (Policy names may vary — drop common defaults)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "authenticated can upload" ON storage.objects;
DROP POLICY IF EXISTS "authenticated can update" ON storage.objects;
DROP POLICY IF EXISTS "authenticated can delete" ON storage.objects;

-- Drop our own policies if re-running
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product-images" ON storage.objects;

-- Public read access (needed for serving images)
CREATE POLICY "Public read product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Admin-only upload
CREATE POLICY "Admins can upload product-images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND public.is_admin()
  );

-- Admin-only update
CREATE POLICY "Admins can update product-images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND public.is_admin()
  );

-- Admin-only delete
CREATE POLICY "Admins can delete product-images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND public.is_admin()
  );

-- ============================================================
-- 2. RATE LIMITING
-- Simple IP/email-based rate limiting using a tracking table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,           -- 'order' or 'review'
  identifier TEXT NOT NULL,       -- email address or IP
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON public.rate_limits (action, identifier, created_at DESC);

-- Auto-cleanup: delete entries older than 24 hours
-- (Run via pg_cron or call periodically)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void AS $$
  DELETE FROM public.rate_limits
  WHERE created_at < NOW() - INTERVAL '24 hours';
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS: the table is only accessed via SECURITY DEFINER functions
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No direct access policies — all access through functions below

-- ============================================================
-- 2a. RATE-LIMITED ORDER CREATION
-- Max 5 orders per email per hour
-- ============================================================

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
  v_recent_count INTEGER;
BEGIN
  -- Rate limit: max 5 orders per email per hour
  SELECT COUNT(*) INTO v_recent_count
  FROM public.rate_limits
  WHERE action = 'order'
    AND identifier = lower(p_customer_email)
    AND created_at > NOW() - INTERVAL '1 hour';

  IF v_recent_count >= 5 THEN
    RAISE EXCEPTION 'Too many orders. Please try again later.';
  END IF;

  -- Record this attempt
  INSERT INTO public.rate_limits (action, identifier)
  VALUES ('order', lower(p_customer_email));

  -- Validate each item's price against the server-side price matrix
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT price_mkd INTO v_server_price
    FROM public.print_prices
    WHERE print_type = v_item->>'printType'
      AND size_id = v_item->>'sizeId';

    IF v_server_price IS NULL THEN
      RAISE EXCEPTION 'Invalid print type/size combination: % / %',
        v_item->>'printType', v_item->>'sizeId';
    END IF;

    v_item_total := v_server_price * (v_item->>'quantity')::INTEGER;
    v_subtotal := v_subtotal + v_item_total;

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
-- 2b. RATE-LIMITED REVIEW CREATION
-- Max 3 reviews per email per hour
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_review(
  p_product_id UUID,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_rating INTEGER,
  p_title TEXT DEFAULT NULL,
  p_content TEXT DEFAULT NULL
)
RETURNS reviews AS $$
DECLARE
  v_review reviews;
  v_recent_count INTEGER;
BEGIN
  -- Validate rating
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  -- Validate product exists and is published
  IF NOT EXISTS (
    SELECT 1 FROM products WHERE id = p_product_id AND status IN ('published', 'sold')
  ) THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Rate limit: max 3 reviews per email per hour
  SELECT COUNT(*) INTO v_recent_count
  FROM public.rate_limits
  WHERE action = 'review'
    AND identifier = lower(p_customer_email)
    AND created_at > NOW() - INTERVAL '1 hour';

  IF v_recent_count >= 3 THEN
    RAISE EXCEPTION 'Too many reviews. Please try again later.';
  END IF;

  -- Record this attempt
  INSERT INTO public.rate_limits (action, identifier)
  VALUES ('review', lower(p_customer_email));

  -- Insert review (unapproved by default)
  INSERT INTO reviews (product_id, customer_name, customer_email, rating, title, content, is_approved)
  VALUES (p_product_id, p_customer_name, p_customer_email, p_rating, p_title, p_content, false)
  RETURNING * INTO v_review;

  RETURN v_review;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
