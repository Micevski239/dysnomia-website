import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Order, OrderStatus, CreateOrderData } from '../types';

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DYS-${timestamp}-${random}`;
}

export function useOrders() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (data: CreateOrderData): Promise<{ data: Order | null; error: string | null }> => {
    setLoading(true);
    setError(null);

    try {
      const orderNumber = generateOrderNumber();

      const { data: order, error: createError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_email: data.customerEmail,
          customer_name: data.customerName,
          customer_phone: data.customerPhone || null,
          shipping_address: data.shippingAddress,
          items: data.items,
          subtotal: data.subtotal,
          shipping_cost: data.shippingCost,
          total_amount: data.totalAmount,
          currency: 'MKD',
          status: 'pending',
          notes: data.notes || null,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      setLoading(false);
      return { data: order, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      setLoading(false);
      return { data: null, error: errorMessage };
    }
  };

  const getOrder = async (id: string): Promise<{ data: Order | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order';
      return { data: null, error: errorMessage };
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order';
      return { data: null, error: errorMessage };
    }
  };

  const updateOrderStatus = async (
    id: string,
    status: OrderStatus
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      return { error: errorMessage };
    }
  };

  const addOrderNote = async (
    id: string,
    notes: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order notes';
      return { error: errorMessage };
    }
  };

  return {
    createOrder,
    getOrder,
    getOrderByNumber,
    updateOrderStatus,
    addOrderNote,
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
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}

export function useOrderDetail(id: string | undefined) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  const refetch = useCallback(async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
    }
  }, [id]);

  return { order, loading, error, refetch };
}
