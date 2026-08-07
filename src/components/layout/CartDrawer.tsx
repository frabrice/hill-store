import * as Dialog from '@radix-ui/react-dialog';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { ProductImage } from '@/components/shop/ProductImage';
import { PlushButton } from '@/components/ui/PlushButton';
import { useSettings } from '@/hooks/useCatalog';
import { useCart, selectCount, selectSubtotal } from '@/store/cart';
import { useUI } from '@/store/ui';
import { rwfFull } from '@/lib/format';

/** Matches the store's default until settings load — same number either way. */
const FALLBACK_FREE_DELIVERY_THRESHOLD = 50000;

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useUI();
  const items = useCart((s) => s.items);
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const { data: settings } = useSettings();

  const freeDeliveryThreshold = settings?.freeDeliveryThresholdRwf ?? FALLBACK_FREE_DELIVERY_THRESHOLD;
  const remaining = Math.max(0, freeDeliveryThreshold - subtotal);
  const progress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <Dialog.Root open={cartOpen} onOpenChange={setCartOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-ink/25 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in" />

        <Dialog.Content
          className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-md flex-col bg-cream shadow-plush-lg duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
            <Dialog.Title className="font-display text-xl font-semibold">
              Your basket{' '}
              {count > 0 && (
                <span className="text-ink-faint">
                  ({count} item{count === 1 ? '' : 's'})
                </span>
              )}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close basket"
              className="grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-sunk hover:text-ink active:scale-[0.94]"
            >
              <X className="h-5 w-5" aria-hidden />
            </Dialog.Close>
          </div>

          {/* Free-delivery nudge — concrete and honest, not a fake urgency timer. */}
          {items.length > 0 && (
            <div className="border-b border-hairline px-5 py-3">
              <p className="text-xs text-ink-soft">
                {remaining > 0 ? (
                  <>
                    Add <strong className="text-ink">{rwfFull(remaining)}</strong> more
                    for free Kigali delivery
                  </>
                ) : (
                  <strong className="text-ink">
                    Free Kigali delivery unlocked
                  </strong>
                )}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunk">
                <div
                  className="comfort-gradient h-full rounded-full transition-[width] duration-500 ease-plush"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-surface-sunk">
                <ShoppingBag className="h-9 w-9 text-ink-faint" aria-hidden />
              </div>
              <div>
                <p className="font-display text-lg font-semibold">
                  Your basket is empty
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  Everything you add will wait for you here.
                </p>
              </div>
              <PlushButton to="/shop" onClick={() => setCartOpen(false)}>
                Start shopping
              </PlushButton>
            </div>
          ) : (
            <>
              <ul className="nice-scroll flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {items.map((item) => (
                  <li
                    key={item.key}
                    className="flex gap-3 rounded-2xl bg-surface p-3 shadow-plush-sm"
                  >
                    <Link
                      to={`/product/${item.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-xl"
                    >
                      <ProductImage
                        publicId={item.image ?? undefined}
                        alt={item.name}
                        colorKey={item.colorKey}
                        art={item.art}
                        width={160}
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        to={`/product/${item.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="truncate text-sm font-semibold hover:text-[hsl(var(--accent-ink))]"
                      >
                        {item.name}
                      </Link>
                      {item.variantLabel && (
                        <span className="text-xs text-ink-faint">
                          {item.variantLabel}
                        </span>
                      )}
                      <span className="mt-0.5 text-sm font-bold">
                        {rwfFull(item.priceRwf * item.quantity)}
                      </span>

                      <div className="mt-auto flex items-center gap-2 pt-2">
                        <div className="flex items-center rounded-full bg-surface-sunk">
                          <button
                            onClick={() => setQuantity(item.key, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="grid h-8 w-8 place-items-center rounded-full transition-transform active:scale-90"
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(item.key, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="grid h-8 w-8 place-items-center rounded-full transition-transform active:scale-90"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>

                        <button
                          onClick={() => remove(item.key)}
                          aria-label={`Remove ${item.name}`}
                          className="ml-auto grid h-8 w-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-pink/20 hover:text-pink-deep active:scale-90"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-hairline bg-surface px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-ink-soft">Subtotal</span>
                  <span className="font-display text-2xl font-bold">
                    {rwfFull(subtotal)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  Delivery calculated at checkout.
                </p>
                <PlushButton
                  to="/checkout"
                  variant="ink"
                  size="lg"
                  className="mt-3 w-full"
                  onClick={() => setCartOpen(false)}
                >
                  Checkout
                </PlushButton>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
