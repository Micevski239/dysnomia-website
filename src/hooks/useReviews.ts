import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Review, CreateReviewData } from '../types';

export function useReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
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
        .select('*')
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
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
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
      const { error: createError } = await supabase.from('reviews').insert({
        product_id: data.productId,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        rating: data.rating,
        title: data.title || null,
        content: data.content || null,
        is_approved: false, // Reviews require admin approval
      });

      if (createError) throw createError;

      setLoading(false);
      return { success: true, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  return { createReview, loading, error };
}

export function useAllReviews(showPendingOnly = false) {
  const [reviews, setReviews] = useState<(Review & { product_title?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          products:product_id (title)
        `)
        .order('created_at', { ascending: false });

      if (showPendingOnly) {
        query = query.eq('is_approved', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to include product title
      const transformedData = (data || []).map((review: any) => ({
        ...review,
        product_title: review.products?.title || 'Unknown Product',
      }));

      setReviews(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [showPendingOnly]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const approveReview = async (id: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;

      fetchReviews();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to approve review' };
    }
  };

  const deleteReview = async (id: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);

      if (error) throw error;

      fetchReviews();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to delete review' };
    }
  };

  return { reviews, loading, error, refetch: fetchReviews, approveReview, deleteReview };
}
