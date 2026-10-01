-- ============================================================
-- 011 — Newsletter campaigns (sent from Admin → Newsletter)
--
-- Run AFTER 010 (paste into Supabase → SQL Editor → Run).
-- Safe to run more than once.
--
-- One row per newsletter the admin sends. Written only by the
-- `send-newsletter` edge function (service role); admins can read the
-- history. Anon and customers have no access.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_mk text NOT NULL,
  subject_en text,
  body_mk text NOT NULL,
  body_en text,
  image_url text,
  button_url text,
  status text NOT NULL DEFAULT 'sending' CHECK (status IN ('sending', 'sent', 'failed')),
  recipients integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE INDEX IF NOT EXISTS newsletter_campaigns_created_idx
  ON public.newsletter_campaigns (created_at DESC);

ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read campaigns" ON public.newsletter_campaigns;
CREATE POLICY "Admins read campaigns"
  ON public.newsletter_campaigns FOR SELECT
  USING (public.is_admin());

COMMIT;
