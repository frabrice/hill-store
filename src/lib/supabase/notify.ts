import { supabase } from './client';
import type { Order } from '@/lib/services/types';

export interface OrderEmailLineItem {
  name: string;
  variantLabel?: string | null;
  quantity: number;
  priceRwf: number;
}

type OrderEmailType = 'order_created' | 'order_shipped' | 'order_delivered' | 'order_cancelled';

/**
 * Best-effort — a failed notification email should never block checkout
 * completing or an admin marking an order shipped. Errors are logged, not
 * thrown, by design.
 */
export async function notifyOrderEmail(
  type: OrderEmailType,
  order: Order,
  lineItems: OrderEmailLineItem[],
  adminEmail?: string,
) {
  try {
    const { error } = await supabase.functions.invoke('send-order-email', {
      body: {
        type,
        order: {
          reference: order.reference,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          address: order.address,
          deliveryZoneName: order.deliveryZoneName,
          paymentMethod: order.paymentMethod,
          payerName: order.payerName,
          paidAmountRwf: order.paidAmountRwf,
          subtotalRwf: order.subtotalRwf,
          deliveryRwf: order.deliveryRwf,
          totalRwf: order.totalRwf,
          createdAt: order.createdAt,
        },
        lineItems,
        adminEmail,
      },
    });
    if (error) console.error('Order email failed:', error);
  } catch (err) {
    console.error('Order email failed:', err);
  }
}
