import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ProductCollectionResult {
  productCollectionMap: Record<string, string>;
  kidsProductIds: Set<string>;
}

export function useProductCollectionMap(): ProductCollectionResult {
  const [productCollectionMap, setProductCollectionMap] = useState<Record<string, string>>({});
  const [kidsProductIds, setKidsProductIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchProductCollections() {
      const { data } = await supabase
        .from('collection_products')
        .select('product_id, collection:collections(title, slug)');
      if (data) {
        const map: Record<string, string> = {};
        const kidsIds = new Set<string>();
        for (const row of data as { product_id: string; collection: unknown }[]) {
          const raw = row.collection;
          const col = (Array.isArray(raw) ? raw[0] : raw) as { title?: string; slug?: string } | null;
          if (col?.title) map[row.product_id] = col.title;
          if (col?.slug === 'kids') kidsIds.add(row.product_id);
        }
        setProductCollectionMap(map);
        setKidsProductIds(kidsIds);
      }
    }
    fetchProductCollections();
  }, []);

  return { productCollectionMap, kidsProductIds };
}
