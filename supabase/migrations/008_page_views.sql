-- 008_page_views.sql
-- Anonymous page view tracking for visitor statistics

-- Table
CREATE TABLE IF NOT EXISTS public.page_views (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path   text NOT NULL,
  page_title  text,
  referrer    text,
  session_id  text NOT NULL,
  user_agent  text,
  screen_width integer,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- Indexes for efficient querying
CREATE INDEX idx_page_views_created_at ON public.page_views (created_at DESC);
CREATE INDEX idx_page_views_page_path  ON public.page_views (page_path);
CREATE INDEX idx_page_views_session_id ON public.page_views (session_id);

-- RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous tracking)
CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read page views"
  ON public.page_views FOR SELECT
  USING (public.is_admin());

-- Only admins can delete (cleanup)
CREATE POLICY "Admins can delete page views"
  ON public.page_views FOR DELETE
  USING (public.is_admin());

-- RPC for efficient server-side summary counts
CREATE OR REPLACE FUNCTION public.get_visitor_summary(p_days integer DEFAULT 30)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total_views',
    (SELECT count(*) FROM public.page_views
     WHERE created_at >= now() - (p_days || ' days')::interval),
    'unique_visitors',
    (SELECT count(DISTINCT session_id) FROM public.page_views
     WHERE created_at >= now() - (p_days || ' days')::interval),
    'today_views',
    (SELECT count(*) FROM public.page_views
     WHERE created_at >= date_trunc('day', now())),
    'today_visitors',
    (SELECT count(DISTINCT session_id) FROM public.page_views
     WHERE created_at >= date_trunc('day', now()))
  );
$$;
