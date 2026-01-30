import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ActivityItem } from '../components/admin/ActivityFeed';

interface DashboardStats {
  pendingOrders: number;
  todayOrders: number;
  monthlyRevenue: number;
  pendingReviews: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingOrders: 0,
    todayOrders: 0,
    monthlyRevenue: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstOfMonthISO = firstOfMonth.toISOString();

      // Fetch all stats in parallel
      const [
        pendingOrdersResult,
        todayOrdersResult,
        monthlyRevenueResult,
        pendingReviewsResult,
      ] = await Promise.all([
        // Pending orders count
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),

        // Today's orders count
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', todayISO),

        // Monthly revenue (sum of delivered orders this month)
        supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', firstOfMonthISO)
          .in('status', ['confirmed', 'shipped', 'delivered']),

        // Pending reviews count
        supabase
          .from('reviews')
          .select('id', { count: 'exact', head: true })
          .eq('is_approved', false),
      ]);

      if (pendingOrdersResult.error) throw pendingOrdersResult.error;
      if (todayOrdersResult.error) throw todayOrdersResult.error;
      if (monthlyRevenueResult.error) throw monthlyRevenueResult.error;
      if (pendingReviewsResult.error) throw pendingReviewsResult.error;

      const monthlyRevenue = (monthlyRevenueResult.data || []).reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );

      setStats({
        pendingOrders: pendingOrdersResult.count || 0,
        todayOrders: todayOrdersResult.count || 0,
        monthlyRevenue,
        pendingReviews: pendingReviewsResult.count || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch recent orders and reviews in parallel
      const [ordersResult, reviewsResult] = await Promise.all([
        supabase
          .from('orders')
          .select('id, order_number, customer_name, total_amount, status, created_at, updated_at')
          .order('updated_at', { ascending: false })
          .limit(10),

        supabase
          .from('reviews')
          .select(`
            id,
            rating,
            is_approved,
            created_at,
            customer_name,
            products:product_id (title)
          `)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (reviewsResult.error) throw reviewsResult.error;

      const orderActivities: ActivityItem[] = (ordersResult.data || []).map((order) => ({
        id: `order-${order.id}`,
        type: 'order' as const,
        title: `Order ${order.order_number}`,
        description: `${order.customer_name} - ${order.total_amount.toLocaleString()} MKD - ${order.status}`,
        timestamp: order.updated_at || order.created_at,
        linkTo: `/admin/orders/${order.id}`,
      }));

      const reviewActivities: ActivityItem[] = (reviewsResult.data || []).map((review: any) => ({
        id: `review-${review.id}`,
        type: 'review' as const,
        title: `New Review on "${review.products?.title || 'Product'}"`,
        description: `${review.customer_name} - ${review.rating} stars - ${review.is_approved ? 'Approved' : 'Pending approval'}`,
        timestamp: review.created_at,
        linkTo: '/admin/reviews',
      }));

      // Combine and sort by timestamp
      const allActivities = [...orderActivities, ...reviewActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 8);

      setActivities(allActivities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent activity');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { activities, loading, error, refetch: fetchActivity };
}
