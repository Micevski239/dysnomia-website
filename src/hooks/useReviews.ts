import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fetchAllRows } from '../lib/fetchAllRows';
import type { Review, AdminReview, CreateReviewData } from '../types';

/** Public review shape — customer_email is never readable outside the admin RPC. */
type PublicReviewRow = Omit<Review, 'customer_email'>;

const PUBLIC_REVIEW_COLUMNS = 'id, product_id, customer_name, rating, title, content, is_approved, created_at';

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return fallback;
}

export function useReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<PublicReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);

  const fetchReviews = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(PUBLIC_REVIEW_COLUMNS)
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      setReviewCount(data?.length || 0);

      // Calculate average rating
      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setAverageRating(null);
      }
    } catch (err) {
      setError(toMessage(err, 'Failed to fetch reviews'));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, averageRating, reviewCount, refetch: fetchReviews };
}

export function useReviewMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReview = async (data: CreateReviewData): Promise<{ success: boolean; error: string | null }> => {
    setLoading(true);
    setError(null);

    try {
      // Use rate-limited RPC for review creation
      const { error: createError } = await supabase.rpc('create_review', {
        p_product_id: data.productId,
        p_customer_name: data.customerName,
        p_customer_email: data.customerEmail,
        p_rating: data.rating,
        p_title: data.title || null,
        p_content: data.content || null,
      });

      if (createError) throw createError;

      setLoading(false);
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = toMessage(err, 'Failed to submit review');
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  return { createReview, loading, error };
}

/** Row shape returned by the admin-only `admin_list_reviews` RPC. */
interface AdminReviewRow {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_approved: boolean;
  created_at: string;
  product_title: string | null;
}

/**
 * Admin review list. Customer emails are only available through the
 * `admin_list_reviews` RPC (column privileges block them via REST).
 */
export function useAllReviews(showPendingOnly = false) {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Paged: PostgREST caps RPC results at 1000 rows per request too.
      const { data, error } = await fetchAllRows<AdminReviewRow>((from, to) => {
        let query = supabase
          .rpc('admin_list_reviews')
          .order('created_at', { ascending: false })
          .order('id', { ascending: false });

        if (showPendingOnly) {
          query = query.eq('is_approved', false);
        }

        return query.range(from, to);
      });

      if (error) throw error;

      setReviews(
        data.map((review) => ({
          ...review,
          product_title: review.product_title || 'Unknown Product',
        }))
      );
    } catch (err) {
      setError(toMessage(err, 'Failed to fetch reviews'));
    } finally {
      setLoading(false);
    }
  }, [showPendingOnly]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const approveReview = async (id: string): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', id)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Review not found or could not be updated.');

      fetchReviews();
      return { error: null };
    } catch (err) {
      return { error: toMessage(err, 'Failed to approve review') };
    }
  };

  const deleteReview = async (id: string): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.from('reviews').delete().eq('id', id).select('id');

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Review not found or could not be deleted.');

      fetchReviews();
      return { error: null };
    } catch (err) {
      return { error: toMessage(err, 'Failed to delete review') };
    }
  };

  return { reviews, loading, error, refetch: fetchReviews, approveReview, deleteReview };
}
