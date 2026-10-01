import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Review } from '../types';

// Public columns only — reviews.customer_email is not readable by anon/customers.
const PUBLIC_REVIEW_COLUMNS = 'id, product_id, customer_name, rating, title, content, is_approved, created_at';

export type PublicReview = Omit<Review, 'customer_email'>;

/** Approved reviews for a product, without any customer PII. */
export function usePublicReviews(productId: string | undefined) {
  const [state, setState] = useState<{ productId: string; reviews: PublicReview[] } | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    supabase
      .from('reviews')
      .select(PUBLIC_REVIEW_COLUMNS)
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        setState({ productId, reviews: error ? [] : ((data || []) as PublicReview[]) });
      });
    return () => {
      cancelled = true;
    };
  }, [productId, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  const reviews = state && state.productId === productId ? state.reviews : [];
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
    : null;

  return { reviews, reviewCount, averageRating, refetch };
}
