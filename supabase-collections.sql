-- Dysnomia Art Gallery - Collections Schema
-- Run this SQL in Supabase SQL Editor or via migrations to add the collections feature

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Collections table to drive the public grid and admin CRUD
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_image text,
  slug text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Keep updated_at fresh on every change
CREATE OR REPLACE FUNCTION public.collections_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collections_set_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.collections_set_updated_at();

-- Fast lookups for the shop grid and featured rows
CREATE INDEX collections_active_order_idx
  ON public.collections (is_active, display_order DESC);

CREATE INDEX collections_featured_idx
  ON public.collections (is_featured, display_order DESC);

-- Collections/products join table for future linking
CREATE TABLE public.collection_products (
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (collection_id, product_id)
);

CREATE INDEX collection_products_collection_idx
  ON public.collection_products (collection_id);

-- Enable Row Level Security (public read, admin writes)
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read collections"
  ON public.collections FOR SELECT
  USING (is_active);

CREATE POLICY "Admin manage collections"
  ON public.collections FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public read collection mappings"
  ON public.collection_products FOR SELECT
  USING (true);

CREATE POLICY "Admin manage collection mappings"
  ON public.collection_products FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
