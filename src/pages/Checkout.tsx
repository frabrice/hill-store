import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Check, CreditCard, PackageCheck, ShoppingBag, Smartphone, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { RingDivider } from '@/components/brand/ComfortRing';
import { PlushButton } from '@/components/ui/PlushButton';
import { ProductImage } from '@/components/shop/ProductImage';
import { useCreateOrder, useDeliveryZones, useProductsByIds, useSettings } from '@/hooks/useCatalog';
import { useCart, selectSubtotal } from '@/store/cart';
import { useAuth } from '@/lib/supabase/auth';
import { notifyOrderEmail } from '@/lib/supabase/notify';
import { anyRequiresVan } from '@/lib/delivery';
import { rwfFull } from '@/lib/format';
import { cn } from '@/lib/utils';

const STEPS = ['Delivery', 'Payment', 'Review'] as const;

const deliverySchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  phone: z.string().min(8, 'Enter a valid phone number'),
  email: z.union([z.string().email('Enter a valid email'), z.literal('')]),
  address: z.string().min(5, 'Enter your delivery address'),
  zoneId: z.string().min(1, 'Choose a delivery zone'),
  notes: z.string().optional(),
});
type DeliveryForm = z.infer<typeof deliverySchema>;

const PAYMENT_METHODS = [
  { id: 'momo', label: 'Mobile Money', icon: Smartphone, hint: 'MTN or Airtel, pay by prompt' },
  { id: 'visa', label: 'Visa', icon: CreditCard, hint: 'Pay by card' },
  { id: 'mastercard', label: 'Mastercard', icon: CreditCard, hint: 'Pay by card' },
] as const;
type PaymentMethodId = (typeof PAYMENT_METHODS)[number]['id'];

function Stepper({ current }: { current: number }) {
  return (
    <div className="mx-auto mb-10 flex max-w-lg items-center">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={cn(
                'grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition-colors duration-300',
                i < current
                  ? 'comfort-gradient text-ink'
                  : i === current
                    ? 'bg-ink text-cream'
                    : 'bg-surface-sunk text-ink-faint',
              )}
            >
              {i < current ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
            </span>
            <span className={cn('text-xs font-semibold', i <= current ? 'text-ink' : 'text-ink-faint')}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                'mx-2 h-1 flex-1 rounded-full transition-colors duration-300',
                i < current ? 'comfort-gradient' : 'bg-surface-sunk',
              )}
              aria-hidden
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function Checkout() {
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const clearCart = useCart((s) => s.clear);
  const { data: zones } = useDeliveryZones();
  const { data: settings } = useSettings();
  const { user } = useAuth();

  const productIds = useMemo(() => [...new Set(items.map((i) => i.productId))], [items]);
  const { data: fullProducts } = useProductsByIds(productIds);
  const needsVan = fullProducts ? anyRequiresVan(fullProducts.map((p) => p.dimensions)) : false;

  const [step, setStep] = useState(0);
  const [delivery, setDelivery] = useState<DeliveryForm | null>(null);
  const [method, setMethod] = useState<PaymentMethodId>('momo');
  const [reference, setReference] = useState<string | null>(null);
  const createOrder = useCreateOrder();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DeliveryForm>({
    resolver: zodResolver(deliverySchema),
    defaultValues: { email: user?.email ?? '' },
  });

  const zone = zones?.find((z) => z.id === watch('zoneId'));
  const deliveryFee = zone?.feeRwf ?? 0;
  const total = subtotal + deliveryFee;

  const onDeliverySubmit = (data: DeliveryForm) => {
    setDelivery(data);
    setStep(1);
  };

  const placeOrder = async () => {
    if (!delivery) return;
    try {
      const order = await createOrder.mutateAsync({
        status: 'pending',
        lines: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        subtotalRwf: subtotal,
        deliveryRwf: deliveryFee,
        totalRwf: total,
        customerName: delivery.fullName,
        customerPhone: delivery.phone,
        customerEmail: delivery.email || null,
        address: delivery.address,
        deliveryZoneId: delivery.zoneId,
        deliveryZoneName: zone?.name ?? '',
        paymentMethod: method,
      });
      setReference(order.reference);
      clearCart();
      setStep(3);
      notifyOrderEmail(
        'order_created',
        order,
        items.map((i) => ({
          name: i.name,
          variantLabel: i.variantLabel,
          quantity: i.quantity,
          priceRwf: i.priceRwf,
        })),
        settings?.contactEmail,
      );
    } catch {
      toast.error('Something went wrong placing your order — please try again.');
    }
  };

  // ------------------------------------------------------------- confirmed
  if (step === 3 && reference) {
    return (
      <section className="relative overflow-hidden">
        <div className="relative mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-mint/30">
            <PackageCheck className="h-8 w-8 text-mint-deep" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-display-lg font-bold">Order placed</h1>
          <RingDivider className="mt-4" />
          <p className="mt-5 text-ink-soft">
            Thank you, {delivery?.fullName.split(' ')[0]} — we&rsquo;ve got it. Your reference is
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-[hsl(var(--accent-ink))]">
            {reference}
          </p>
          <p className="mt-4 max-w-sm text-sm text-ink-faint">
            This is a demo checkout — no payment has actually been taken. Real payment
            processing arrives once the backend is connected.
          </p>
          <PlushButton to="/shop" className="mt-8">
            Keep shopping
          </PlushButton>
        </div>
      </section>
    );
  }

  // ------------------------------------------------------------- empty cart
  if (items.length === 0) {
    return (
      <section className="relative overflow-hidden">
        <div className="relative mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-sunk">
            <ShoppingBag className="h-8 w-8 text-ink-faint" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-display-lg font-bold">Your basket is empty</h1>
          <RingDivider className="mt-4" />
          <p className="mt-5 text-ink-soft">Add something first, then come back to check out.</p>
          <PlushButton to="/shop" className="mt-8">
            Start shopping
          </PlushButton>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-center font-display text-display-md font-bold">Checkout</h1>
      <div className="mt-8">
        <Stepper current={step} />
      </div>

      {/* --------------------------------------------------------- delivery */}
      {step === 0 && (
          <motion.form
            key="delivery"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={handleSubmit(onDeliverySubmit)}
            className="space-y-4 rounded-3xl bg-surface p-6 shadow-plush sm:p-8"
          >
            <h2 className="font-display text-xl font-bold">Where&rsquo;s this going?</h2>

            {needsVan && (
              <div className="flex items-start gap-3 rounded-2xl bg-sunny/20 p-4">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-sunny-deep" aria-hidden />
                <p className="text-sm text-ink-soft">
                  <span className="font-semibold text-ink">
                    Your basket has an oversized item.{' '}
                  </span>
                  It will arrive by car or van rather than motorbike — delivery may take a
                  little longer for zones outside the city centre.
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-ink">Full name</span>
                <input
                  {...register('fullName')}
                  className="mt-1.5 w-full rounded-xl border border-hairline bg-cream px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--accent))]"
                  placeholder="Uwase Divine"
                />
                {errors.fullName && (
                  <span className="mt-1 block text-xs text-pink-deep">{errors.fullName.message}</span>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-ink">Phone number</span>
                <input
                  {...register('phone')}
                  className="mt-1.5 w-full rounded-xl border border-hairline bg-cream px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--accent))]"
                  placeholder="078 000 0000"
                />
                {errors.phone && (
                  <span className="mt-1 block text-xs text-pink-deep">{errors.phone.message}</span>
                )}
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-ink">
                Email <span className="font-normal text-ink-faint">(optional)</span>
              </span>
              <input
                type="email"
                {...register('email')}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-cream px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--accent))]"
                placeholder="For your order confirmation"
              />
              {errors.email && (
                <span className="mt-1 block text-xs text-pink-deep">{errors.email.message}</span>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-ink">Delivery address</span>
              <input
                {...register('address')}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-cream px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--accent))]"
                placeholder="Street, house number, landmark"
              />
              {errors.address && (
                <span className="mt-1 block text-xs text-pink-deep">{errors.address.message}</span>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-ink">Delivery zone</span>
              <select
                {...register('zoneId')}
                defaultValue=""
                className="mt-1.5 w-full rounded-xl border border-hairline bg-cream px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--accent))]"
              >
                <option value="" disabled>
                  Choose your area
                </option>
                {zones?.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} · {rwfFull(z.feeRwf)} · {z.etaHours}
                  </option>
                ))}
              </select>
              {errors.zoneId && (
                <span className="mt-1 block text-xs text-pink-deep">{errors.zoneId.message}</span>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-ink">
                Notes <span className="font-normal text-ink-faint">(optional)</span>
              </span>
              <textarea
                {...register('notes')}
                rows={2}
                className="mt-1.5 w-full rounded-xl border border-hairline bg-cream px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--accent))]"
                placeholder="Gate code, best time to arrive…"
              />
            </label>

            <PlushButton type="submit" size="lg" className="w-full">
              Continue to payment
            </PlushButton>
          </motion.form>
        )}

      {/* ---------------------------------------------------------- payment */}
      {step === 1 && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 rounded-3xl bg-surface p-6 shadow-plush sm:p-8"
          >
            <h2 className="font-display text-xl font-bold">How would you like to pay?</h2>
            <p className="text-xs text-ink-faint">
              Demo checkout — selecting a method here does not move any money.
            </p>

            <div className="space-y-2.5">
              {PAYMENT_METHODS.map(({ id, label, icon: Icon, hint }) => {
                const active = method === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMethod(id)}
                    aria-pressed={active}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 ease-plush',
                      active
                        ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.14)]'
                        : 'border-hairline hover:border-[hsl(var(--accent)/0.5)]',
                    )}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-sunk">
                      <Icon className="h-5 w-5 text-ink" aria-hidden />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-ink">{label}</span>
                      <span className="block text-xs text-ink-faint">{hint}</span>
                    </span>
                    <span
                      className={cn(
                        'grid h-5 w-5 shrink-0 place-items-center rounded-full border-2',
                        active ? 'border-[hsl(var(--accent-ink))] bg-[hsl(var(--accent-ink))]' : 'border-hairline',
                      )}
                    >
                      {active && <Check className="h-3 w-3 text-cream" aria-hidden />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <PlushButton variant="outline" onClick={() => setStep(0)} className="flex-1">
                Back
              </PlushButton>
              <PlushButton onClick={() => setStep(2)} size="lg" className="flex-[2]">
                Review order
              </PlushButton>
            </div>
          </motion.div>
        )}

      {/* ----------------------------------------------------------- review */}
      {step === 2 && delivery && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5 rounded-3xl bg-surface p-6 shadow-plush sm:p-8"
          >
            <h2 className="font-display text-xl font-bold">Review your order</h2>

            <ul className="divide-y divide-hairline">
              {items.map((item) => (
                <li key={item.key} className="flex items-center gap-3 py-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-sunk">
                    <ProductImage
                      publicId={item.image ?? undefined}
                      alt={item.name}
                      colorKey={item.colorKey}
                      art={item.art}
                      width={120}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-ink-faint">
                      {item.variantLabel && `${item.variantLabel} · `}Qty {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-ink">
                    {rwfFull(item.priceRwf * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl bg-surface-sunk p-4 text-sm">
              <p className="font-semibold text-ink">Delivering to</p>
              <p className="mt-1 text-ink-soft">
                {delivery.fullName} · {delivery.phone}
              </p>
              <p className="text-ink-soft">
                {delivery.address}, {zone?.name}
              </p>
            </div>

            <div className="space-y-1.5 border-t border-hairline pt-4 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Subtotal</span>
                <span>{rwfFull(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Delivery ({zone?.name})</span>
                <span>{rwfFull(deliveryFee)}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold text-ink">
                <span>Total</span>
                <span>{rwfFull(total)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <PlushButton variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </PlushButton>
              <PlushButton
                variant="ink"
                onClick={placeOrder}
                disabled={createOrder.isPending}
                size="lg"
                className="flex-[2]"
              >
                {createOrder.isPending ? 'Placing order…' : 'Place order'}
              </PlushButton>
            </div>
          </motion.div>
      )}

      <p className="mt-6 text-center text-xs text-ink-faint">
        <Link to="/shop" className="hover:text-ink-soft">
          Cancel and keep shopping
        </Link>
      </p>
    </div>
  );
}
