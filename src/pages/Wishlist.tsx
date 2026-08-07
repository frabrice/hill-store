import { useEffect } from 'react';
import { Heart } from 'lucide-react';
import { RingDivider } from '@/components/brand/ComfortRing';
import { PlushButton } from '@/components/ui/PlushButton';
import { ProductCard } from '@/components/shop/ProductCard';
import { useProductsByIds } from '@/hooks/useCatalog';
import { useCategoryColors } from '@/hooks/useCategoryColors';
import { useWishlist } from '@/store/wishlist';
import { useUI } from '@/store/ui';

export function Wishlist() {
  const productIds = useWishlist((s) => s.productIds);
  const { data: items, isPending } = useProductsByIds(productIds);
  const colorFor = useCategoryColors();
  const setAccent = useUI((s) => s.setAccent);

  useEffect(() => {
    setAccent('pink');
  }, [setAccent]);

  const empty = productIds.length === 0;

  return (
    <>
      <section className="relative overflow-hidden border-b border-hairline bg-[hsl(var(--accent)/0.14)]">
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <p className="text-eyebrow font-bold uppercase text-[hsl(var(--accent-ink))]">Saved</p>
          <h1 className="mt-1 font-display text-display-lg font-bold">Your wishlist</h1>
          <RingDivider className="mt-3" />
          <p className="mt-3 max-w-xl text-ink-soft">
            Everything you&rsquo;ve tapped the heart on, ready to move into the basket in one tap.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {empty ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-surface py-20 text-center shadow-plush-sm">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-sunk">
              <Heart className="h-7 w-7 text-ink-faint" aria-hidden />
            </span>
            <h2 className="mt-5 font-display text-xl font-bold">Nothing saved yet</h2>
            <p className="mt-2 max-w-sm text-ink-soft">
              Tap the heart on any product to keep it here for later.
            </p>
            <PlushButton to="/shop" className="mt-6">
              Start browsing
            </PlushButton>
          </div>
        ) : isPending ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: productIds.length }).map((_, i) => (
              <div key={i} className="skeleton aspect-[3/4] rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {items?.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                colorKey={colorFor(product.categorySlug)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
