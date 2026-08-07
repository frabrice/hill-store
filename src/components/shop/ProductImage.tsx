import { imageUrl } from '@/lib/services';
import { ProductArt } from '@/components/brand/ProductArt';
import type { ColorKey } from '@/lib/services/types';
import { cn } from '@/lib/utils';

/**
 * Product imagery.
 *
 * Prefers the real photograph. Until the client's photography exists, it falls
 * back to the illustrated placeholder so a populated grid still looks composed
 * rather than broken. Swapping to photos is a data change — a Cloudinary ID on
 * the product — and touches nothing here.
 */

const GRADIENTS: Record<ColorKey, string> = {
  pink: 'from-pink/45 via-pink/20 to-lavender/25',
  mint: 'from-mint/45 via-mint/20 to-sky/25',
  sky: 'from-sky/45 via-sky/20 to-lavender/25',
  sunny: 'from-sunny/45 via-sunny/20 to-pink/20',
  lavender: 'from-lavender/45 via-lavender/20 to-sky/25',
  coral: 'from-coral/45 via-coral/20 to-sunny/20',
  teal: 'from-teal/45 via-teal/20 to-mint/25',
  indigo: 'from-indigo/45 via-indigo/20 to-sky/25',
  orchid: 'from-orchid/45 via-orchid/20 to-pink/20',
  moss: 'from-moss/45 via-moss/20 to-mint/25',
};

interface ProductImageProps {
  publicId?: string;
  alt: string;
  colorKey: ColorKey;
  /** Illustration key, when there is no photograph. */
  art?: string;
  className?: string;
  width?: number;
}

export function ProductImage({
  publicId,
  alt,
  colorKey,
  art = 'bottle',
  className,
  width = 600,
}: ProductImageProps) {
  const src = imageUrl(publicId, { width, crop: 'fill' });

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn('h-full w-full object-cover', className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        'relative h-full w-full overflow-hidden bg-gradient-to-br',
        GRADIENTS[colorKey],
        className,
      )}
    >
      <ProductArt art={art} colorKey={colorKey} className="h-full w-full" />
    </div>
  );
}
