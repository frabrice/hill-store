import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import { ProductImage } from './ProductImage';
import { WishlistButton } from './WishlistButton';
import { useCart } from '@/store/cart';
import { rwf, rwfFull, discountPercent } from '@/lib/format';
import { ACCENTS } from '@/lib/theme';
import type { ColorKey, Product } from '@/lib/services/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  colorKey: ColorKey;
  /** Index in a list — used to stagger the entrance. */
  index?: number;
}

export function ProductCard({ product, colorKey, index = 0 }: ProductCardProps) {
  const add = useCart((s) => s.add);
  const reduced = useReducedMotion();
  const saving = discountPercent(product.priceRwf, product.compareAtRwf);
  const accent = ACCENTS[colorKey];

  const handleAdd = (e: React.MouseEvent) => {
    // The card is a link; adding to the basket must not navigate.
    e.preventDefault();
    e.stopPropagation();
    add(product, colorKey, product.variants[0] ?? null, 1, product.colorOptions[0] ?? null);
    toast.success(`${product.name} added`, { description: 'Tap the basket to review.' });
  };

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
      // Each card carries its own colour, so a mixed grid reads as a rainbow
      // that is still ordered rather than random.
      style={{
        ['--accent' as string]: accent.surface,
        ['--accent-soft' as string]: accent.soft,
        ['--accent-ink' as string]: accent.ink,
      }}
      className="group relative"
    >
      {/*
        Photo fills the card edge-to-edge — no padding, no coloured mat.
        That treatment was built for the placeholder illustrations and never
        suited a real photo (see git history); a thin colour-accented border
        is now the only ornament, with badges floating directly on the image
        rather than living in a frame edge above it.
      */}
      <Link
        to={`/product/${product.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-[hsl(var(--accent)/0.35)] bg-surface shadow-plush-sm transition-all duration-300 ease-plush hover:-translate-y-1 hover:border-[hsl(var(--accent))] hover:shadow-plush-lg"
      >
        <div className="relative aspect-square overflow-hidden bg-[hsl(var(--accent-soft))]">
          <div className="absolute inset-0 transition-transform duration-500 ease-plush group-hover:scale-[1.05]">
            <ProductImage
              publicId={product.images[0]}
              alt={product.name}
              colorKey={colorKey}
              art={product.art}
              width={500}
            />
          </div>

          {/* Badges float on the photo itself now — no frame edge to live in. */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
            <div className="flex flex-wrap gap-1.5">
              {product.tags.includes('preemie') && (
                <span className="rounded-full bg-surface/90 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-[hsl(var(--accent-ink))] shadow-plush-sm backdrop-blur-sm">
                  Preemie
                </span>
              )}
              {saving && (
                <span className="rounded-full bg-ink/90 px-2.5 py-1 text-[0.65rem] font-bold text-cream shadow-plush-sm backdrop-blur-sm">
                  −{saving}%
                </span>
              )}
            </div>
            <WishlistButton productId={product.id} productName={product.name} size="sm" />
          </div>

          {product.stock <= 8 && product.stock > 0 && (
            <span className="absolute bottom-2.5 left-2.5 rounded-full bg-surface/90 px-2.5 py-1 text-[0.65rem] font-semibold text-ink-soft shadow-plush-sm backdrop-blur-sm">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Label plate. */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center gap-1 text-xs text-ink-faint">
            <Star className="h-3.5 w-3.5 fill-sunny text-sunny" aria-hidden />
            <span className="font-semibold text-ink-soft">{product.rating.toFixed(1)}</span>
            <span>({product.reviewCount})</span>
          </div>

          <h3 className="mt-1.5 font-display text-base font-semibold leading-snug text-ink">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-soft">
            {product.subtitle}
          </p>

          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-bold text-[hsl(var(--accent-ink))]">
                {rwfFull(product.priceRwf)}
              </span>
              {product.compareAtRwf && (
                <span className="text-sm text-ink-faint line-through">
                  {rwf(product.compareAtRwf)}
                </span>
              )}
            </div>

            {/* Lives in the plate rather than floating over the art, and is
                always visible — a hover-only button never reaches touch. */}
            <button
              onClick={handleAdd}
              aria-label={`Add ${product.name} to basket`}
              className={cn(
                'grid h-9 w-9 shrink-0 place-items-center rounded-full',
                'bg-[hsl(var(--accent-ink))] text-cream shadow-plush-sm',
                'transition-transform duration-200 ease-plush hover:scale-110 active:scale-95',
              )}
            >
              <Plus className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
