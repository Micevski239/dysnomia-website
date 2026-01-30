import { supabase } from './supabase';
import type { Order } from '../types';

export type OrderEmailType =
  | 'order_placed'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled';

export async function sendOrderEmail(
  order: Order,
  emailType: OrderEmailType,
  trackingNumber?: string
): Promise<void> {
  try {
    await supabase.functions.invoke('send-order-email', {
      body: { order, emailType, trackingNumber },
    });
  } catch {
    // Fire-and-forget: email failures never block order flow
    console.warn('Failed to send order email:', emailType);
  }
}
