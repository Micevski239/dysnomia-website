import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Shared hook for fetching product → collection name mappings.
 * Used by ShopHome and Shop to avoid duplicate Supabase queries.
 */
export function useProductCollectionMap() {
  const [productCollectionMap, setProductCollectionMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchProductCollections() {
      const { data } = await supabase
        .from('collection_products')
        .select('product_id, collection:collections(title)');
      if (data) {
        const map: Record<string, string> = {};
        for (const row of data as { product_id: string; collection: { title: string }[] | null }[]) {
          if (row.collection?.[0]?.title) {
            map[row.product_id] = row.collection[0].title;
          }
        }
        setProductCollectionMap(map);
      }
    }
    fetchProductCollections();
  }, []);

  return productCollectionMap;
}
