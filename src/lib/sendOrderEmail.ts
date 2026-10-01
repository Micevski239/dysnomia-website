import { supabase } from './supabase';
import type { Order } from '../types';

export type OrderEmailType =
  | 'order_placed'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled';

/**
 * Fire-and-forget order email. The edge function loads the order from the DB
 * by id, so only the id is sent.
 */
export async function sendOrderEmail(
  order: Pick<Order, 'id'>,
  emailType: OrderEmailType,
  trackingNumber?: string
): Promise<void> {
  try {
    await supabase.functions.invoke('send-order-email', {
      body: { order: { id: order.id }, emailType, trackingNumber },
    });
  } catch {
    // Fire-and-forget: email failures never block order flow
    console.warn('Failed to send order email:', emailType);
  }
}
