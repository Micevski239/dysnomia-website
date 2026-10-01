import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fetchAllRows } from '../lib/fetchAllRows';
import { useLanguage } from './useLanguage';
import type { Order, OrderStatus, CreateOrderData } from '../types';

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return fallback;
}

/** Used when an update/delete matched no rows (missing order or blocked by RLS). */
const NO_ROWS_MESSAGE = 'Order not found or you do not have permission to modify it.';

export function useOrders() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (data: CreateOrderData): Promise<{ data: Order | null; error: string | null }> => {
    setLoading(true);
    setError(null);

    try {
      // Use server-side RPC with price validation
      const { data: order, error: createError } = await supabase
        .rpc('create_validated_order', {
          p_customer_email: data.customerEmail,
          p_customer_name: data.customerName,
          p_customer_phone: data.customerPhone || null,
          p_shipping_address: data.shippingAddress,
          p_items: data.items,
          p_notes: data.notes || null,
          p_language: language === 'en' ? 'en' : 'mk',
        })
        .single();

      if (createError) {
        throw createError;
      }

      setLoading(false);
      return { data: order as Order, error: null };
    } catch (err) {
      const errorMessage = toMessage(err, 'Failed to create order');
      setError(errorMessage);
      setLoading(false);
      return { data: null, error: errorMessage };
    }
  };

  const getOrder = async (id: string): Promise<{ data: Order | null; error: string | null }> => {
    try {
      // Use secure RPC that allows lookup by ID without exposing all orders
      const { data, error } = await supabase
        .rpc('get_order_by_id', { order_id: id })
        .single();

      if (error) throw error;
      return { data: data as Order, error: null };
    } catch (err) {
      return { data: null, error: toMessage(err, 'Failed to fetch order') };
    }
  };

  const getOrderByNumber = async (orderNumber: string): Promise<{ data: Order | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: toMessage(err, 'Failed to fetch order') };
    }
  };

  const updateTrackingNumber = async (
    id: string,
    trackingNumber: string
  ): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ tracking_number: trackingNumber, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) throw new Error(NO_ROWS_MESSAGE);
      return { error: null };
    } catch (err) {
      return { error: toMessage(err, 'Failed to update tracking number') };
    }
  };

  /**
   * Updates the status. `changed` is true only when a row actually moved from a
   * different status to `status`, so callers know whether to send a status email.
   */
  const updateOrderStatus = async (
    id: string,
    status: OrderStatus,
    trackingNumber?: string
  ): Promise<{ error: string | null; changed: boolean }> => {
    try {
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (trackingNumber !== undefined) {
        updateData.tracking_number = trackingNumber;
      }

      // `.neq('status', status)` makes a same-status save a no-op, so it can't
      // trigger a duplicate email.
      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .neq('status', status)
        .select('id');

      if (error) throw error;
      if (data && data.length > 0) return { error: null, changed: true };

      // No row changed: either the status already equals `status`, or the order is missing/blocked.
      const { data: existing, error: readError } = await supabase
        .from('orders')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      if (readError) throw readError;
      if (!existing) throw new Error(NO_ROWS_MESSAGE);

      // Same status: still persist a provided tracking number.
      if (trackingNumber !== undefined) {
        const { error: trackingError } = await updateTrackingNumber(id, trackingNumber);
        if (trackingError) return { error: trackingError, changed: false };
      }
      return { error: null, changed: false };
    } catch (err) {
      return { error: toMessage(err, 'Failed to update order status'), changed: false };
    }
  };

  /** Saves internal admin notes (orders.admin_notes). Never touches the customer's `notes`. */
  const updateAdminNotes = async (
    id: string,
    adminNotes: string
  ): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ admin_notes: adminNotes.trim() || null, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) throw new Error(NO_ROWS_MESSAGE);
      return { error: null };
    } catch (err) {
      return { error: toMessage(err, 'Failed to update admin notes') };
    }
  };

  const deleteOrder = async (id: string): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) throw new Error(NO_ROWS_MESSAGE);
      return { error: null };
    } catch (err) {
      return { error: toMessage(err, 'Failed to delete order') };
    }
  };

  return {
    createOrder,
    getOrder,
    getOrderByNumber,
    updateOrderStatus,
    updateTrackingNumber,
    updateAdminNotes,
    deleteOrder,
    loading,
    error,
  };
}

export function useOrdersList(statusFilter?: OrderStatus) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Page through all orders: PostgREST caps each response at 1000 rows.
      const { data, error } = await fetchAllRows<Order>((from, to) => {
        let query = supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .order('id', { ascending: false });

        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }

        return query.range(from, to);
      });

      if (error) throw error;
      setOrders(data);
    } catch (err) {
      setError(toMessage(err, 'Failed to fetch orders'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}

/**
 * Loads a single order.
 * - Public (default): via the `get_order_by_id` RPC (lookup by unguessable UUID).
 * - Admin (`{ admin: true }`): direct table read under admin RLS, so internal
 *   columns such as `admin_notes` are available.
 */
export function useOrderDetail(id: string | undefined, options?: { admin?: boolean }) {
  const admin = options?.admin ?? false;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<Order | null> => {
    if (!id) return null;
    if (admin) {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Order;
    }
    const { data, error } = await supabase.rpc('get_order_by_id', { order_id: id }).single();
    if (error) throw error;
    return data as Order;
  }, [id, admin]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchOrder() {
      setLoading(true);
      setError(null);

      try {
        const data = await load();
        if (isMounted) setOrder(data);
      } catch (err) {
        if (isMounted) setError(toMessage(err, 'Failed to fetch order'));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [id, load]);

  const refetch = useCallback(async () => {
    if (!id) return;

    try {
      setOrder(await load());
    } catch (err) {
      setError(toMessage(err, 'Failed to fetch order'));
    }
  }, [id, load]);

  return { order, loading, error, refetch };
}
