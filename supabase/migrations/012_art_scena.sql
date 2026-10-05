-- ============================================================
-- 012 — АРТ Сцена: exhibitions database
--
-- Run AFTER 011 (paste into Supabase → SQL Editor → Run).
-- Safe to run more than once.
--
-- One row per exhibition shown on /art-scena. Macedonian fields are
-- required, English ones optional (the site falls back to Macedonian).
-- The status (current / upcoming / ended) is not stored: the site works it
-- out from start_date and end_date, so it never goes stale.
-- Anyone can read published exhibitions; only admins can write.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.exhibitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) <= 120),

  title_mk text NOT NULL CHECK (length(title_mk) BETWEEN 1 AND 200),
  title text CHECK (length(title) <= 200),
  artist_mk text NOT NULL CHECK (length(artist_mk) BETWEEN 1 AND 300),
  artist text CHECK (length(artist) <= 300),
  exhibition_type text NOT NULL DEFAULT 'solo' CHECK (exhibition_type IN ('solo', 'group')),

  start_date date NOT NULL,
  end_date date,
  city text NOT NULL DEFAULT 'skopje'
    CHECK (city IN ('skopje', 'bitola', 'ohrid', 'prilep', 'kavadarci', 'shtip', 'other')),
  venue_mk text NOT NULL CHECK (length(venue_mk) BETWEEN 1 AND 300),
  venue text CHECK (length(venue) <= 300),
  organizer_mk text CHECK (length(organizer_mk) <= 300),
  organizer text CHECK (length(organizer) <= 300),
  official_url text CHECK (official_url ~* '^https?://' AND length(official_url) <= 1000),

  cover_image text CHECK (length(cover_image) <= 1000),
  cover_alt_mk text CHECK (length(cover_alt_mk) <= 300),
  cover_alt text CHECK (length(cover_alt) <= 300),
  photo_credit text CHECK (length(photo_credit) <= 200),

  summary_mk text CHECK (length(summary_mk) <= 600),
  summary text CHECK (length(summary) <= 600),
  content_mk text CHECK (length(content_mk) <= 20000),
  content text CHECK (length(content) <= 20000),
  artist_bio_mk text CHECK (length(artist_bio_mk) <= 10000),
  artist_bio text CHECK (length(artist_bio) <= 10000),
  opening_hours_mk text CHECK (length(opening_hours_mk) <= 300),
  opening_hours text CHECK (length(opening_hours) <= 300),
  admission_mk text CHECK (length(admission_mk) <= 300),
  admission text CHECK (length(admission) <= 300),

  -- Optional overrides; empty = generated from the fields above
  seo_title_mk text CHECK (length(seo_title_mk) <= 120),
  seo_title text CHECK (length(seo_title) <= 120),
  seo_description_mk text CHECK (length(seo_description_mk) <= 300),
  seo_description text CHECK (length(seo_description) <= 300),

  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT exhibitions_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS exhibitions_published_dates_idx
  ON public.exhibitions (is_published, start_date DESC);

ALTER TABLE public.exhibitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read" ON public.exhibitions;
CREATE POLICY "Public read" ON public.exhibitions FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Admins read all" ON public.exhibitions;
CREATE POLICY "Admins read all" ON public.exhibitions FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins insert" ON public.exhibitions;
CREATE POLICY "Admins insert" ON public.exhibitions FOR INSERT WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins update" ON public.exhibitions;
CREATE POLICY "Admins update" ON public.exhibitions FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins delete" ON public.exhibitions;
CREATE POLICY "Admins delete" ON public.exhibitions FOR DELETE USING (public.is_admin());

-- ------------------------------------------------------------
-- Renamed exhibitions keep their old links (slug_redirects, migration 010)
-- ------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.slug_redirects'::regclass AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%entity%'
  LOOP
    EXECUTE format('ALTER TABLE public.slug_redirects DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;
ALTER TABLE public.slug_redirects
  ADD CONSTRAINT slug_redirects_entity_check
  CHECK (entity IN ('product', 'collection', 'blog', 'exhibition'));

DROP TRIGGER IF EXISTS exhibitions_slug_redirect ON public.exhibitions;
CREATE TRIGGER exhibitions_slug_redirect AFTER UPDATE OF slug ON public.exhibitions
  FOR EACH ROW EXECUTE FUNCTION public.record_slug_redirect('exhibition');

COMMIT;
