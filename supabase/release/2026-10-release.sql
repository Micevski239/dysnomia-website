-- ============================================================
-- RELEASE 2026-10 — paste this whole file into Supabase → SQL Editor → Run
-- (= migrations 009 + 010). Run BEFORE merging the code to main.
-- Pre-check: select * from public.user_roles where role = 'admin';
--            must list your admin account, otherwise admin access is lost.
-- ============================================================

BEGIN;

-- ============================================================
-- October 2026 update (spec v1.0, 1 Oct 2026)
--   1. Kids Pictures: kids collection stays publicly readable even when it is
--      hidden from the /collections page (is_active = false). Before this,
--      hiding it emptied the "Kids Pictures" menu page.
--   3. Blog: up to two extra images per post (gallery_images).
--   4. Newsletter: subscriber list with consent + unsubscribe token.
-- Safe to run more than once.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Kids collection always readable
-- Keep the slug list in sync with src/lib/kidsCollection.ts
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Public read kids collection" ON public.collections;
CREATE POLICY "Public read kids collection"
  ON public.collections FOR SELECT
  USING (
    lower(slug) = ANY (ARRAY[
      'kids', 'kid', 'kids-pictures', 'kids-room', 'kids-posters', 'kids-collection', 'detski-sliki'
    ])
  );

-- ------------------------------------------------------------
-- 3. Blog gallery images: [{ url, caption, caption_mk, after_paragraph }]
-- ------------------------------------------------------------
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_gallery_images_max2;
ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_gallery_images_max2
  CHECK (jsonb_typeof(gallery_images) = 'array' AND jsonb_array_length(gallery_images) <= 2);

-- ------------------------------------------------------------
-- 4. Newsletter subscribers
-- Written only by the `newsletter` edge function (service role).
-- Anon has no access at all; admins can read/manage the list.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  language text NOT NULL DEFAULT 'mk' CHECK (language IN ('en', 'mk')),
  status text NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  consent boolean NOT NULL DEFAULT false,
  consent_at timestamptz,
  consent_text text,
  source text NOT NULL DEFAULT 'footer',
  unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
  welcome_sent_at timestamptz,
  provider_synced_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 254)
);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_key
  ON public.newsletter_subscribers (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_token_key
  ON public.newsletter_subscribers (unsubscribe_token);
CREATE INDEX IF NOT EXISTS newsletter_subscribers_status_idx
  ON public.newsletter_subscribers (status, created_at DESC);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins read subscribers"
  ON public.newsletter_subscribers FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins update subscribers"
  ON public.newsletter_subscribers FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins delete subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins delete subscribers"
  ON public.newsletter_subscribers FOR DELETE
  USING (public.is_admin());


-- ============================================================
-- 010 — Security, data-integrity and price fixes (October 2026 audit)
--
-- Run AFTER 009. Safe to run more than once.
-- Before running, confirm your admin account is listed:
--   select * from public.user_roles where role = 'admin';
-- (every admin permission below goes through public.is_admin()).
--
-- Contents
--   1. Helper functions (is_admin, email-confirmed check)
--   2. user_roles policies without self-recursion
--   3. Canonical RLS on content tables (drops every old policy first,
--      including the "any logged-in user can edit" ones)
--   4. Reviews: hide reviewer e-mails from the public + admin RPC
--   5. Orders: admin notes, language, delete policy, own-orders needs a
--      confirmed e-mail, confirmation lookup limited in time
--   6. create_validated_order: strict validation, DB titles, IP rate limit
--   7. Atomic admin RPCs (bestsellers, product ↔ collection link)
--   8. Slug redirects (old URLs keep working after a rename)
--   9. Page views: size limits, admin-only summary
--  10. Server price table = prices shown on the site
--  11. search_path on every SECURITY DEFINER function
-- ============================================================

-- ------------------------------------------------------------
-- 1. Helpers
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_email_confirmed()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL
  );
$$;

-- ------------------------------------------------------------
-- 2. user_roles — policies referenced user_roles inside user_roles
--    (infinite recursion as soon as anything reads the table via REST)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;
CREATE POLICY "Admins can read user_roles" ON public.user_roles
  FOR SELECT USING (public.is_admin() OR user_id = auth.uid());
CREATE POLICY "Admins can manage user_roles" ON public.user_roles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- 3. Canonical RLS on content tables.
--    Every existing policy on these tables is dropped and replaced, so
--    leftovers such as "Admin full access" (auth.role() = 'authenticated')
--    can no longer let a registered customer edit the catalogue.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION pg_temp.reset_policies(p_table text, p_public_read text, p_allow_admin_all boolean DEFAULT true)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  r record;
BEGIN
  IF to_regclass('public.' || p_table) IS NULL THEN
    RAISE NOTICE 'Table % does not exist — skipped', p_table;
    RETURN;
  END IF;

  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = p_table LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, p_table);
  END LOOP;

  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', p_table);

  IF p_public_read IS NOT NULL THEN
    EXECUTE format('CREATE POLICY "Public read" ON public.%I FOR SELECT USING (%s)', p_table, p_public_read);
  END IF;
  EXECUTE format('CREATE POLICY "Admins read all" ON public.%I FOR SELECT USING (public.is_admin())', p_table);

  IF p_allow_admin_all THEN
    EXECUTE format('CREATE POLICY "Admins insert" ON public.%I FOR INSERT WITH CHECK (public.is_admin())', p_table);
  END IF;
  EXECUTE format('CREATE POLICY "Admins update" ON public.%I FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin())', p_table);
  EXECUTE format('CREATE POLICY "Admins delete" ON public.%I FOR DELETE USING (public.is_admin())', p_table);
END;
$$;

SELECT pg_temp.reset_policies('products', $q$status IN ('published', 'sold')$q$);
SELECT pg_temp.reset_policies('collections', $q$is_active OR lower(slug) = ANY (ARRAY['kids','kid','kids-pictures','kids-room','kids-posters','kids-collection','detski-sliki'])$q$);
SELECT pg_temp.reset_policies('collection_products', 'true');
SELECT pg_temp.reset_policies('blog_posts', 'is_published = true');
SELECT pg_temp.reset_policies('announcements', 'is_active = true');
SELECT pg_temp.reset_policies('featured_sections', 'true');
SELECT pg_temp.reset_policies('bestseller_products', 'true');
-- Reviews are created only through create_review() (no INSERT policy)
SELECT pg_temp.reset_policies('reviews', 'is_approved = true', false);

-- ------------------------------------------------------------
-- 4. Reviews — reviewer e-mail addresses were readable by anyone
--    (/rest/v1/reviews?select=customer_email). Column privileges hide it;
--    admins read it through admin_list_reviews().
-- ------------------------------------------------------------
REVOKE SELECT ON public.reviews FROM anon, authenticated;
GRANT SELECT (id, product_id, customer_name, rating, title, content, is_approved, created_at)
  ON public.reviews TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_reviews()
RETURNS TABLE (
  id uuid, product_id uuid, customer_name text, customer_email text, rating integer,
  title text, content text, is_approved boolean, created_at timestamptz, product_title text
)
LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
    SELECT r.id, r.product_id, r.customer_name, r.customer_email, r.rating,
           r.title, r.content, r.is_approved, r.created_at, p.title
    FROM public.reviews r
    LEFT JOIN public.products p ON p.id = r.product_id
    ORDER BY r.created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_list_reviews() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_reviews() TO authenticated;

-- ------------------------------------------------------------
-- 5. Orders
-- ------------------------------------------------------------
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'mk';
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_language_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_language_check CHECK (language IN ('mk', 'en'));

-- Admin "Delete order" reported success but RLS deleted 0 rows
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING (public.is_admin());

-- Own orders only with a CONFIRMED e-mail — otherwise anyone could register
-- with a guest's address and read their orders (name, address, phone).
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (
    lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    AND public.current_user_email_confirmed()
  );

-- Order-confirmation lookup by id (anon): limit to fresh orders (or
-- owner/admin) and never return internal admin_notes.
DROP FUNCTION IF EXISTS public.get_order_by_id(uuid);
CREATE FUNCTION public.get_order_by_id(order_id uuid)
RETURNS TABLE (
  id uuid, order_number text, customer_email text, customer_name text, customer_phone text,
  shipping_address jsonb, items jsonb, subtotal numeric, shipping_cost numeric, total_amount numeric,
  currency text, status text, notes text, tracking_number text, language text,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT o.id, o.order_number, o.customer_email, o.customer_name, o.customer_phone,
         o.shipping_address, o.items, o.subtotal::numeric, o.shipping_cost::numeric, o.total_amount::numeric,
         o.currency, o.status, o.notes, o.tracking_number, o.language,
         o.created_at, o.updated_at
  FROM public.orders o
  WHERE o.id = order_id
    AND (
      o.created_at > now() - interval '7 days'
      OR public.is_admin()
      OR lower(o.customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$$;

-- ------------------------------------------------------------
-- 6. create_validated_order — strict validation.
--    Before: negative/huge quantities, empty orders, any title/image text,
--    unknown product ids and unlimited orders (rate limit per e-mail only).
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.create_validated_order(text, text, text, jsonb, jsonb, text);

CREATE OR REPLACE FUNCTION public.create_validated_order(
  p_customer_email text,
  p_customer_name text,
  p_customer_phone text,
  p_shipping_address jsonb,
  p_items jsonb,
  p_notes text DEFAULT NULL,
  p_language text DEFAULT 'mk'
)
RETURNS public.orders
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders;
  v_item jsonb;
  v_product public.products;
  v_server_price integer;
  v_quantity integer;
  v_validated_items jsonb := '[]'::jsonb;
  v_subtotal integer := 0;
  v_order_number text;
  v_email text := lower(trim(coalesce(p_customer_email, '')));
  v_ip text;
  v_image text;
  v_key text;
BEGIN
  -- Basic field validation
  IF v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(v_email) > 254 THEN
    RAISE EXCEPTION 'Invalid email address';
  END IF;
  IF length(trim(coalesce(p_customer_name, ''))) < 2 OR length(p_customer_name) > 200 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;
  IF length(coalesce(p_customer_phone, '')) > 40 THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;
  IF length(coalesce(p_notes, '')) > 2000 THEN
    RAISE EXCEPTION 'Notes are too long';
  END IF;
  IF jsonb_typeof(p_shipping_address) <> 'object' THEN
    RAISE EXCEPTION 'Invalid shipping address';
  END IF;
  FOR v_key IN SELECT jsonb_object_keys(p_shipping_address) LOOP
    IF length(p_shipping_address ->> v_key) > 300 THEN
      RAISE EXCEPTION 'Invalid shipping address';
    END IF;
  END LOOP;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 OR jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Invalid order items';
  END IF;

  -- Rate limits: 5 orders/hour per e-mail and 10/hour per IP
  v_ip := split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1);
  IF (SELECT count(*) FROM public.rate_limits
      WHERE action = 'order' AND identifier = v_email AND created_at > now() - interval '1 hour') >= 5 THEN
    RAISE EXCEPTION 'Too many orders. Please try again later.';
  END IF;
  IF v_ip <> '' AND (SELECT count(*) FROM public.rate_limits
      WHERE action = 'order_ip' AND identifier = v_ip AND created_at > now() - interval '1 hour') >= 10 THEN
    RAISE EXCEPTION 'Too many orders. Please try again later.';
  END IF;
  INSERT INTO public.rate_limits (action, identifier) VALUES ('order', v_email);
  IF v_ip <> '' THEN
    INSERT INTO public.rate_limits (action, identifier) VALUES ('order_ip', v_ip);
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    -- Quantity: whole number 1–20
    IF coalesce(v_item ->> 'quantity', '') !~ '^[0-9]{1,3}$' THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;
    v_quantity := (v_item ->> 'quantity')::integer;
    IF v_quantity < 1 OR v_quantity > 20 THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;

    -- Product must exist and be on sale; title/slug come from the DB
    IF coalesce(v_item ->> 'productId', '') !~* '^[0-9a-f-]{36}$' THEN
      RAISE EXCEPTION 'Invalid product';
    END IF;
    SELECT * INTO v_product FROM public.products
    WHERE id = (v_item ->> 'productId')::uuid AND status IN ('published', 'sold');
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not available';
    END IF;

    SELECT price_mkd INTO v_server_price FROM public.print_prices
    WHERE print_type = v_item ->> 'printType' AND size_id = v_item ->> 'sizeId';
    IF v_server_price IS NULL THEN
      RAISE EXCEPTION 'Invalid print type/size combination: % / %', v_item ->> 'printType', v_item ->> 'sizeId';
    END IF;

    -- Keep the variant image the customer saw only if it belongs to this product
    v_image := v_item ->> 'imageUrl';
    IF v_image IS NULL OR v_image NOT IN (
      coalesce(v_product.image_url, ''),
      coalesce(to_jsonb(v_product) ->> 'image_url_canvas', ''),
      coalesce(to_jsonb(v_product) ->> 'image_url_roll', ''),
      coalesce(to_jsonb(v_product) ->> 'image_url_framed', '')
    ) THEN
      v_image := v_product.image_url;
    END IF;

    v_subtotal := v_subtotal + v_server_price * v_quantity;
    v_validated_items := v_validated_items || jsonb_build_object(
      'productId', v_product.id,
      'productTitle', v_product.title,
      'productSlug', v_product.slug,
      'imageUrl', v_image,
      'printType', v_item ->> 'printType',
      'sizeId', v_item ->> 'sizeId',
      'sizeLabel', left(coalesce(v_item ->> 'sizeLabel', v_item ->> 'sizeId'), 50),
      'quantity', v_quantity,
      'unitPrice', v_server_price
    );
  END LOOP;

  v_order_number := 'DYS-' || upper(to_hex(extract(epoch FROM now())::integer)) || '-' ||
                    upper(substring(md5(random()::text) FROM 1 FOR 4));

  INSERT INTO public.orders (
    order_number, customer_email, customer_name, customer_phone,
    shipping_address, items, subtotal, shipping_cost, total_amount,
    currency, status, notes, language
  ) VALUES (
    v_order_number, v_email, trim(p_customer_name), nullif(trim(coalesce(p_customer_phone, '')), ''),
    p_shipping_address, v_validated_items, v_subtotal, 0, v_subtotal,
    'MKD', 'pending', nullif(trim(coalesce(p_notes, '')), ''),
    CASE WHEN p_language = 'en' THEN 'en' ELSE 'mk' END
  ) RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_validated_order(text, text, text, jsonb, jsonb, text, text) TO anon, authenticated;

-- ------------------------------------------------------------
-- 7. Atomic admin RPCs
--    Before: delete-all-then-insert from the browser — a failed insert left
--    the bestseller list empty / the product without its collection.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.replace_bestsellers(p_product_ids uuid[])
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  DELETE FROM public.bestseller_products WHERE true;
  INSERT INTO public.bestseller_products (product_id, display_order)
  SELECT id, ord - 1
  FROM unnest(coalesce(p_product_ids, '{}')) WITH ORDINALITY AS t(id, ord);
END;
$$;
REVOKE ALL ON FUNCTION public.replace_bestsellers(uuid[]) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.replace_bestsellers(uuid[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_product_collection(p_product_id uuid, p_collection_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  DELETE FROM public.collection_products
  WHERE product_id = p_product_id
    AND (p_collection_id IS NULL OR collection_id <> p_collection_id);
  IF p_collection_id IS NOT NULL THEN
    INSERT INTO public.collection_products (collection_id, product_id)
    VALUES (p_collection_id, p_product_id)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.set_product_collection(uuid, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.set_product_collection(uuid, uuid) TO authenticated;

-- ------------------------------------------------------------
-- 8. Slug redirects — renaming a product/collection/post no longer breaks
--    shared links and Google results. Filled automatically by triggers.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.slug_redirects (
  entity text NOT NULL CHECK (entity IN ('product', 'collection', 'blog')),
  old_slug text NOT NULL,
  new_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity, old_slug)
);
ALTER TABLE public.slug_redirects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read" ON public.slug_redirects;
CREATE POLICY "Public read" ON public.slug_redirects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage" ON public.slug_redirects;
CREATE POLICY "Admins manage" ON public.slug_redirects FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.record_slug_redirect()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entity text := TG_ARGV[0];
BEGIN
  IF NEW.slug IS DISTINCT FROM OLD.slug AND OLD.slug IS NOT NULL AND OLD.slug <> '' THEN
    -- The new slug is live again: it must not redirect anywhere
    DELETE FROM public.slug_redirects WHERE entity = v_entity AND old_slug = NEW.slug;
    -- Flatten chains: everything that pointed to the old slug now points to the new one
    UPDATE public.slug_redirects SET new_slug = NEW.slug WHERE entity = v_entity AND new_slug = OLD.slug;
    INSERT INTO public.slug_redirects (entity, old_slug, new_slug)
    VALUES (v_entity, OLD.slug, NEW.slug)
    ON CONFLICT (entity, old_slug) DO UPDATE SET new_slug = EXCLUDED.new_slug, created_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  DROP TRIGGER IF EXISTS products_slug_redirect ON public.products;
  CREATE TRIGGER products_slug_redirect AFTER UPDATE OF slug ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.record_slug_redirect('product');
  DROP TRIGGER IF EXISTS collections_slug_redirect ON public.collections;
  CREATE TRIGGER collections_slug_redirect AFTER UPDATE OF slug ON public.collections
    FOR EACH ROW EXECUTE FUNCTION public.record_slug_redirect('collection');
  IF to_regclass('public.blog_posts') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS blog_posts_slug_redirect ON public.blog_posts;
    CREATE TRIGGER blog_posts_slug_redirect AFTER UPDATE OF slug ON public.blog_posts
      FOR EACH ROW EXECUTE FUNCTION public.record_slug_redirect('blog');
  END IF;
END $$;

-- ------------------------------------------------------------
-- 9. Page views — anonymous inserts were unbounded in size and the summary
--    RPC was readable by anyone.
-- ------------------------------------------------------------
ALTER TABLE public.page_views DROP CONSTRAINT IF EXISTS page_views_sizes;
ALTER TABLE public.page_views ADD CONSTRAINT page_views_sizes CHECK (
  length(page_path) <= 500
  AND length(coalesce(page_title, '')) <= 300
  AND length(coalesce(referrer, '')) <= 1000
  AND length(session_id) <= 100
  AND length(coalesce(user_agent, '')) <= 500
  AND (screen_width IS NULL OR screen_width BETWEEN 0 AND 20000)
) NOT VALID;

CREATE OR REPLACE FUNCTION public.get_visitor_summary(p_days integer DEFAULT 30)
RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;
  RETURN json_build_object(
    'total_views', (SELECT count(*) FROM public.page_views WHERE created_at >= now() - make_interval(days => p_days)),
    'unique_visitors', (SELECT count(DISTINCT session_id) FROM public.page_views WHERE created_at >= now() - make_interval(days => p_days)),
    'today_views', (SELECT count(*) FROM public.page_views WHERE created_at >= date_trunc('day', now())),
    'today_visitors', (SELECT count(DISTINCT session_id) FROM public.page_views WHERE created_at >= date_trunc('day', now()))
  );
END;
$$;

-- ------------------------------------------------------------
-- 10. Server prices = prices shown on the site (src/config/printOptions.ts).
--     Migration 003 seeded the OLD prices (canvas 50x70 = 2640 vs 1299 shown).
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
-- 11. Pin search_path on every SECURITY DEFINER function in public
--     (prevents search-path hijacking).
-- ------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public', r.sig);
  END LOOP;
END $$;
-- current_user_email_confirmed needs auth too
ALTER FUNCTION public.current_user_email_confirmed() SET search_path = public, auth;


COMMIT;

-- Post-check (should return 15 rows with the site prices):
-- select * from public.print_prices order by print_type, size_id;
