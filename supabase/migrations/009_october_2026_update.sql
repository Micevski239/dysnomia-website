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
