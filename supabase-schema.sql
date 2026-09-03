-- Dysnomia Art Gallery - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'sold')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes for better performance
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view published and sold products
CREATE POLICY "Public can view published products"
  ON products FOR SELECT
  USING (status IN ('published', 'sold'));

-- Policy: Authenticated users (admin) have full access
CREATE POLICY "Admin full access"
  ON products FOR ALL
  USING (auth.role() = 'authenticated');

-- Storage bucket setup instructions:
-- 1. Go to Storage in Supabase dashboard
-- 2. Create a new bucket named "product-images"
-- 3. Make it a public bucket
-- 4. Add these policies to the bucket:
--    - SELECT: Allow anon role (public read)
--    - INSERT: Allow authenticated role only
--    - UPDATE: Allow authenticated role only
--    - DELETE: Allow authenticated role only

-- Sample data (optional - uncomment to add sample products)
/*
INSERT INTO products (title, slug, description, price, status) VALUES
  ('Sunset Dreams', 'sunset-dreams', 'A vibrant acrylic painting capturing the beauty of a summer sunset over the ocean.', 1200.00, 'published'),
  ('Urban Reflections', 'urban-reflections', 'Mixed media artwork exploring the contrast between nature and city life.', 850.00, 'published'),
  ('Abstract Emotions', 'abstract-emotions', 'An expressive oil painting that evokes deep emotional responses through color and form.', 2500.00, 'sold'),
  ('Mountain Serenity', 'mountain-serenity', 'A peaceful landscape depicting misty mountains at dawn.', 1800.00, 'published'),
  ('Draft Piece', 'draft-piece', 'Work in progress - not yet ready for display.', 500.00, 'draft');
*/
