import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fetchAllRows } from '../lib/fetchAllRows';
import { isKidsCollection } from '../lib/kidsCollection';

interface ProductCollectionResult {
  productCollectionMap: Record<string, string>;
  kidsProductIds: Set<string>;
}

export function useProductCollectionMap(): ProductCollectionResult {
  const [productCollectionMap, setProductCollectionMap] = useState<Record<string, string>>({});
  const [kidsProductIds, setKidsProductIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    async function fetchProductCollections() {
      // Paged: PostgREST returns at most 1000 rows per request. Ordered by the
      // (collection_id, product_id) primary key for stable pages.
      const { data, error } = await fetchAllRows<{ product_id: string; collection: unknown }>(
        (from, to) =>
          supabase
            .from('collection_products')
            .select('product_id, collection:collections(title, title_mk, slug)')
            .order('collection_id', { ascending: true })
            .order('product_id', { ascending: true })
            .range(from, to)
      );
      if (!isMounted) return;
      if (error) {
        console.warn('Failed to load product collections', error.message);
        return;
      }
      const map: Record<string, string> = {};
      const kidsIds = new Set<string>();
      for (const row of data) {
        const raw = row.collection;
        const col = (Array.isArray(raw) ? raw[0] : raw) as { title?: string; title_mk?: string; slug?: string } | null;
        if (col?.title) map[row.product_id] = col.title;
        if (isKidsCollection(col)) kidsIds.add(row.product_id);
      }
      setProductCollectionMap(map);
      setKidsProductIds(kidsIds);
    }
    fetchProductCollections();

    return () => {
      isMounted = false;
    };
  }, []);

  return { productCollectionMap, kidsProductIds };
}
