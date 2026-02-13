""-- ============================================================
-- Featured Sections & Bestseller Products
-- Run this migration in your Supabase SQL editor
-- ============================================================

-- 1. Stores per-section config (spotlight product for each page)
CREATE TABLE public.featured_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,       -- 'bestsellers' or 'new_arrivals'
  spotlight_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Admin-curated bestseller list (max 12)
CREATE TABLE public.bestseller_products (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (product_id)
);

-- Indexes
CREATE INDEX idx_bestseller_products_order ON public.bestseller_products(display_order);
CREATE INDEX idx_featured_sections_key ON public.featured_sections(section_key);

-- RLS
ALTER TABLE public.featured_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bestseller_products ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read featured_sections"
  ON public.featured_sections FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read bestseller_products"
  ON public.bestseller_products FOR SELECT
  USING (true);

-- Authenticated (admin) write access
CREATE POLICY "Authenticated users can insert featured_sections"
  ON public.featured_sections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update featured_sections"
  ON public.featured_sections FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete featured_sections"
  ON public.featured_sections FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert bestseller_products"
  ON public.bestseller_products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update bestseller_products"
  ON public.bestseller_products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete bestseller_products"
  ON public.bestseller_products FOR DELETE
  TO authenticated
  USING (true);

-- Seed the two section keys
INSERT INTO public.featured_sections (section_key) VALUES
  ('bestsellers'),
  ('new_arrivals');
""