import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/services/types';

const badgeStyles = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold font-sans',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-sunk text-ink-soft',
        success: 'bg-green-50 text-green-700',
        warning: 'bg-amber-50 text-amber-700',
        danger: 'bg-red-50 text-red-600',
        info: 'bg-sky-soft text-sky-deep',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeStyles> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeStyles({ tone }), className)} {...props} />;
}

/** One place mapping an order's lifecycle stage to how it reads at a glance. */
export const ORDER_STATUS_TONE: Record<OrderStatus, NonNullable<BadgeProps['tone']>> = {
  pending: 'warning',
  paid: 'info',
  processing: 'info',
  shipped: 'neutral',
  delivered: 'success',
  cancelled: 'danger',
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={ORDER_STATUS_TONE[status]}>{ORDER_STATUS_LABEL[status]}</Badge>;
}
