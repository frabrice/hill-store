import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Banknote, CreditCard, Mail, MapPin, Phone, Smartphone, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/Card';
import { Select } from '@/components/admin/Field';
import { OrderStatusBadge } from '@/components/admin/Badge';
import { ProductImage } from '@/components/shop/ProductImage';
import { useOrder, useProductsByIds, useUpdateOrderStatus } from '@/hooks/useCatalog';
import { useCategoryColors } from '@/hooks/useCategoryColors';
import { notifyOrderEmail } from '@/lib/supabase/notify';
import { rwfFull } from '@/lib/format';
import type { OrderStatus } from '@/lib/services/types';

const STATUSES: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

const PAYMENT_LABEL: Record<string, { label: string; icon: typeof CreditCard }> = {
  momo: { label: 'Mobile Money', icon: Smartphone },
  pay_on_delivery: { label: 'Pay on delivery', icon: Banknote },
  // Historical values from before the gateway-free redesign — kept so old
  // orders still render a sensible label instead of falling back to the raw string.
  visa: { label: 'Visa', icon: CreditCard },
  mastercard: { label: 'Mastercard', icon: CreditCard },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrder(id);
  const productIds = order?.lines.map((l) => l.productId) ?? [];
  const { data: products } = useProductsByIds(productIds);
  const colorFor = useCategoryColors();
  const updateStatus = useUpdateOrderStatus();

  const onStatusChange = async (status: OrderStatus) => {
    if (!order) return;
    try {
      const updated = await updateStatus.mutateAsync({ id: order.id, status });
      toast.success(`Order marked ${status}`);
      if (status === 'shipped' || status === 'delivered' || status === 'cancelled') {
        notifyOrderEmail(
          `order_${status}`,
          updated,
          order.lines.map((line) => {
            const product = products?.find((p) => p.id === line.productId);
            const variant = product?.variants.find((v) => v.id === line.variantId);
            return {
              name: product?.name ?? 'Product',
              variantLabel: variant?.label ?? null,
              quantity: line.quantity,
              priceRwf: (product?.priceRwf ?? 0) + (variant?.priceDelta ?? 0),
            };
          }),
        );
      }
    } catch {
      toast.error('Could not update the order — please try again.');
    }
  };

  if (isLoading) return <p className="text-sm text-ink-faint">Loading…</p>;

  if (!order) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-sm text-ink-soft">We couldn&rsquo;t find that order.</p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="mt-3 text-sm font-semibold text-[hsl(var(--accent-ink))]"
        >
          Back to orders
        </button>
      </div>
    );
  }

  const payment = PAYMENT_LABEL[order.paymentMethod];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/orders')}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft hover:bg-surface-sunk"
            aria-label="Back to orders"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
          <div>
            <h1 className="font-sans text-2xl font-bold text-ink">{order.reference}</h1>
            <p className="mt-0.5 text-sm text-ink-soft">{formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <OrderStatusBadge status={order.status} />
          <Select
            value={order.status}
            disabled={updateStatus.isPending}
            onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
            className="w-auto"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                Mark as {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-hairline p-0">
              {order.lines.map((line, i) => {
                const product = products?.find((p) => p.id === line.productId);
                const variant = product?.variants.find((v) => v.id === line.variantId);
                const unitPrice = (product?.priceRwf ?? 0) + (variant?.priceDelta ?? 0);
                return (
                  <div key={i} className="flex items-center gap-3 p-4">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-sunk">
                      {product && (
                        <ProductImage
                          publicId={product.images[0]}
                          alt={product.name}
                          colorKey={colorFor(product.categorySlug)}
                          art={product.art}
                          width={96}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">
                        {product?.name ?? 'Product no longer available'}
                      </p>
                      <p className="text-xs text-ink-faint">
                        {variant && `${variant.label} · `}Qty {line.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-ink">{rwfFull(unitPrice * line.quantity)}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-1.5 p-5 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Subtotal</span>
                <span>{rwfFull(order.subtotalRwf)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Delivery ({order.deliveryZoneName})</span>
                <span>{rwfFull(order.deliveryRwf)}</span>
              </div>
              <div className="flex justify-between border-t border-hairline pt-2 text-base font-bold text-ink">
                <span>Total</span>
                <span>{rwfFull(order.totalRwf)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Delivering to</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5 text-sm">
              <p className="flex items-center gap-2 text-ink">
                <User className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
                {order.customerName}
              </p>
              <p className="flex items-center gap-2 text-ink">
                <Phone className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
                {order.customerPhone}
              </p>
              {order.customerEmail && (
                <p className="flex items-center gap-2 text-ink">
                  <Mail className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
                  {order.customerEmail}
                </p>
              )}
              <p className="flex items-start gap-2 text-ink">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
                <span>
                  {order.address}
                  <br />
                  <span className="text-ink-soft">{order.deliveryZoneName}</span>
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-sm">
              <p className="flex items-center gap-2 text-ink">
                {payment && <payment.icon className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />}
                {payment?.label ?? order.paymentMethod}
              </p>
              {(order.paymentMethod === 'momo' || order.paymentMethod === 'pay_on_delivery') && (
                <div className="mt-3 space-y-1 rounded-xl bg-surface-sunk p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    {order.paymentMethod === 'momo'
                      ? 'Self-reported by customer'
                      : 'Self-reported commitment fee'}
                  </p>
                  <p className="text-ink">{order.payerName ?? '—'}</p>
                  <p className="text-ink-soft">
                    {order.paidAmountRwf != null ? rwfFull(order.paidAmountRwf) : '—'}
                  </p>
                  {order.paymentMethod === 'pay_on_delivery' && order.paidAmountRwf != null && (
                    <p className="text-ink-soft">
                      Remaining {rwfFull(Math.max(0, order.totalRwf - order.paidAmountRwf))} in cash
                      on delivery
                    </p>
                  )}
                  <p className="mt-1 text-xs text-ink-faint">
                    Cross-check against the MoMo merchant account before releasing this order.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
