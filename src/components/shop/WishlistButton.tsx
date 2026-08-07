import { Heart } from 'lucide-react';
import { useWishlist } from '@/store/wishlist';
import { cn } from '@/lib/utils';

export function WishlistButton({
  productId,
  productName,
  size = 'md',
  className,
}: {
  productId: string;
  productName: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const saved = useWishlist((s) => s.has(productId));
  const toggle = useWishlist((s) => s.toggle);

  return (
    <button
      onClick={(e) => {
        // Sits on top of product-card links in a few places; must not navigate.
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      aria-pressed={saved}
      className={cn(
        'grid shrink-0 place-items-center rounded-full transition-all duration-200 ease-plush active:scale-90',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        saved
          ? 'bg-pink text-cream shadow-plush-sm'
          : 'bg-surface/90 text-ink-soft shadow-plush-sm hover:text-pink-deep',
        className,
      )}
    >
      <Heart className={cn(size === 'sm' ? 'h-4 w-4' : 'h-5 w-5', saved && 'fill-current')} aria-hidden />
    </button>
  );
}
