import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';

/**
 * Fetches admin-curated bestseller products with their full product data,
 * plus the spotlight product ID for the bestsellers section.
 * Falls back to products sorted by price DESC if no bestsellers are configured.
 */
export function useBestsellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [spotlightProductId, setSpotlightProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch spotlight and bestsellers in parallel
      const [sectionResult, bestsellersResult] = await Promise.all([
        supabase
          .from('featured_sections')
          .select('spotlight_product_id')
          .eq('section_key', 'bestsellers')
          .single(),
        supabase
          .from('bestseller_products')
          .select('display_order, product:products(id, title, slug, description, price, image_url, status, created_at, updated_at)')
          .order('display_order', { ascending: true }),
      ]);

      const section = sectionResult.data;
      setSpotlightProductId(section?.spotlight_product_id ?? null);

      const bestsellers = bestsellersResult.data;
      if (bestsellersResult.error) throw bestsellersResult.error;

      // Supabase returns joined data; product may be an object or array depending on the relationship
      const curated = (bestsellers || [])
        .map((row: Record<string, unknown>) => {
          const p = row.product;
          if (Array.isArray(p)) return p[0] as Product | undefined;
          return p as Product | null;
        })
        .filter((p): p is Product => p != null && (p.status === 'published' || p.status === 'sold'));

      if (curated.length > 0) {
        setProducts(curated);
      } else {
        // Fallback: top 12 by price
        const { data: fallback, error: fErr } = await supabase
          .from('products')
          .select('id, title, slug, description, price, image_url, status, created_at, updated_at')
          .in('status', ['published', 'sold'])
          .order('price', { ascending: false })
          .limit(12);

        if (fErr) throw fErr;
        setProducts(fallback || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bestsellers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, spotlightProductId, loading, error, refetch: fetch };
}

/**
 * Fetches the admin-selected spotlight product ID for the New Arrivals section.
 */
export function useNewArrivalsSpotlight() {
  const [spotlightProductId, setSpotlightProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetch() {
      const { data } = await supabase
        .from('featured_sections')
        .select('spotlight_product_id')
        .eq('section_key', 'new_arrivals')
        .single();

      if (mounted) {
        setSpotlightProductId(data?.spotlight_product_id ?? null);
        setLoading(false);
      }
    }

    fetch();
    return () => { mounted = false; };
  }, []);

  return { spotlightProductId, loading };
}

/**
 * Admin mutations for managing featured sections and bestseller products.
 */
export function useFeaturedSectionMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setBestsellers = async (productIds: string[]) => {
    setLoading(true);
    setError(null);

    try {
      // Delete all existing bestseller rows
      const { error: delErr } = await supabase
        .from('bestseller_products')
        .delete()
        .neq('product_id', '00000000-0000-0000-0000-000000000000'); // delete all rows

      if (delErr) throw delErr;

      // Insert new rows with display_order
      if (productIds.length > 0) {
        const rows = productIds.map((id, i) => ({
          product_id: id,
          display_order: i,
        }));

        const { error: insErr } = await supabase
          .from('bestseller_products')
          .insert(rows);

        if (insErr) throw insErr;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save bestsellers';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setSpotlight = async (sectionKey: 'bestsellers' | 'new_arrivals', productId: string | null) => {
    setLoading(true);
    setError(null);

    try {
      const { error: upErr } = await supabase
        .from('featured_sections')
        .update({ spotlight_product_id: productId, updated_at: new Date().toISOString() })
        .eq('section_key', sectionKey);

      if (upErr) throw upErr;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save spotlight';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { setBestsellers, setSpotlight, loading, error };
}
