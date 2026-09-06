import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Ruler, ShieldCheck, Star, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { RingDivider } from '@/components/brand/ComfortRing';
import { PlushButton } from '@/components/ui/PlushButton';
import { ProductImage } from '@/components/shop/ProductImage';
import { ProductCard } from '@/components/shop/ProductCard';
import { WishlistButton } from '@/components/shop/WishlistButton';
import { useCategory, useProduct, useProducts } from '@/hooks/useCatalog';
import { useCategoryColors } from '@/hooks/useCategoryColors';
import { useSeo, SITE_URL } from '@/hooks/useSeo';
import { useCart } from '@/store/cart';
import { useUI } from '@/store/ui';
import { deliveryMethodFor, deliveryMethodNote } from '@/lib/delivery';
import { discountPercent, rwf, rwfFull } from '@/lib/format';
import { imageUrl } from '@/lib/services';
import { ACCENTS } from '@/lib/theme';
import { cn } from '@/lib/utils';
import type { ColorKey, ColorOption, Product, ProductVariant } from '@/lib/services/types';

/** What to call the variant picker — derived from the category rather than
 * stored per product, since "Size" vs "Volume" vs "Age" is a presentation
 * choice, not a fact about the product. */
const VARIANT_LABEL_BY_CATEGORY: Record<string, string> = {
  clothing: 'Size',
  feeding: 'Volume',
  diapering: 'Size',
  sleep: 'Size',
  maternity: 'Size',
};

function ProductGallery({ product, colorKey }: { product: Product; colorKey: ColorKey }) {
  const [active, setActive] = useState(0);
  const accent = ACCENTS[colorKey];
  const gallery = product.images.length > 0 ? product.images : [undefined];

  return (
    <div>
      <div
        className="relative aspect-square overflow-hidden rounded-[1.75rem] border-[3px] shadow-plush"
        style={{
          borderColor: `hsl(${accent.surface} / 0.5)`,
          backgroundColor: `hsl(${accent.soft})`,
        }}
      >
        <div className="absolute inset-0 p-8 sm:p-10">
          <ProductImage
            publicId={gallery[active]}
            alt={product.name}
            colorKey={colorKey}
            art={product.art}
            width={800}
            className="rounded-xl"
          />
        </div>
      </div>

      {product.images.length > 1 && (
        <div className="nice-scroll mt-3 flex gap-2 overflow-x-auto">
          {product.images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              aria-label={`Photo ${i + 1}`}
              className={cn(
                'h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors duration-200',
                i === active ? 'border-[hsl(var(--accent-ink))]' : 'border-transparent',
              )}
              style={{ ['--accent-ink' as string]: accent.ink }}
            >
              <ProductImage publicId={img} alt="" colorKey={colorKey} art={product.art} width={120} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VariantPicker({
  variants,
  selected,
  onSelect,
  label,
  accentInk,
}: {
  variants: ProductVariant[];
  selected: ProductVariant;
  onSelect: (v: ProductVariant) => void;
  label: string;
  accentInk: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink">
        {label}
        <span className="ml-1.5 font-normal text-ink-soft">{selected.label}</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {variants.map((v) => {
          const active = v.id === selected.id;
          const out = v.stock <= 0;
          return (
            <button
              key={v.id}
              disabled={out}
              onClick={() => onSelect(v)}
              aria-pressed={active}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ease-plush',
                out && 'cursor-not-allowed border-hairline text-ink-faint line-through',
                !out && active && 'border-transparent text-cream',
                !out &&
                  !active &&
                  'border-hairline text-ink-soft hover:-translate-y-0.5 hover:border-[hsl(var(--accent))]',
              )}
              style={!out && active ? { backgroundColor: `hsl(${accentInk})` } : undefined}
            >
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Colour swatches — a separate control from `VariantPicker` since colour and
 * size are independent axes on a product (a cardigan has both). Real circle
 * swatches rather than text pills, and out-of-stock colours are disabled
 * rather than hidden, so "available" is always honest about what isn't.
 */
function ColorSwatchPicker({
  options,
  selected,
  onSelect,
  accentInk,
}: {
  options: ColorOption[];
  selected: ColorOption;
  onSelect: (c: ColorOption) => void;
  accentInk: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink">
        Colour
        <span className="ml-1.5 font-normal text-ink-soft">{selected.label}</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2.5">
        {options.map((c) => {
          const active = c.id === selected.id;
          const out = c.stock <= 0;
          return (
            <button
              key={c.id}
              disabled={out}
              onClick={() => onSelect(c)}
              aria-label={c.label + (out ? ' (out of stock)' : '')}
              aria-pressed={active}
              title={c.label}
              className={cn(
                'relative grid h-9 w-9 place-items-center rounded-full transition-all duration-200 ease-plush',
                out && 'cursor-not-allowed opacity-40',
                !out && 'hover:scale-110',
              )}
              style={{
                boxShadow: active
                  ? `0 0 0 2px hsl(var(--surface)), 0 0 0 4px hsl(${accentInk})`
                  : '0 0 0 1px hsl(var(--hairline))',
              }}
            >
              <span
                className="h-full w-full rounded-full"
                style={{ backgroundColor: c.hex }}
                aria-hidden
              />
              {out && (
                <span
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    background:
                      'linear-gradient(to top right, transparent calc(50% - 1px), hsl(var(--ink-faint)) calc(50% - 1px), hsl(var(--ink-faint)) calc(50% + 1px), transparent calc(50% + 1px))',
                  }}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProductDetail() {
  const { slug } = useParams();
  const { data: product, isPending } = useProduct(slug);
  const { data: category } = useCategory(product?.categorySlug);
  const { data: related } = useProducts({
    categorySlug: product?.categorySlug,
    limit: 5,
  });

  const colorFor = useCategoryColors();
  const setAccent = useUI((s) => s.setAccent);
  const add = useCart((s) => s.add);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [quantity, setQuantity] = useState(1);

  const colorKey = product ? colorFor(product.categorySlug) : 'pink';
  const accent = ACCENTS[colorKey];

  // Dresses the page in its category colour, same as Shop does per category.
  useEffect(() => {
    if (category) setAccent(category.colorKey);
  }, [category, setAccent]);

  // Reset the picked variant/colour/quantity whenever a different product loads.
  useEffect(() => {
    setSelectedVariant(product?.variants[0] ?? null);
    setSelectedColor(product?.colorOptions[0] ?? null);
    setQuantity(1);
  }, [product]);

  const ogImage = product?.images[0] ? imageUrl(product.images[0], { width: 1200 }) : null;
  useSeo({
    title: product ? `${product.name} | Hill Store` : 'Product | Hill Store',
    description:
      product?.subtitle ??
      'Gentle, genuine baby products at Hill Store, delivered across Kigali, Rwanda.',
    image: ogImage,
    path: product ? `/product/${product.slug}` : undefined,
    type: 'product',
    jsonLd: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          ...(ogImage ? { image: ogImage } : {}),
          sku: product.id,
          brand: { '@type': 'Brand', name: product.brand },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'RWF',
            price: product.priceRwf,
            availability:
              product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${SITE_URL}/product/${product.slug}`,
          },
          ...(product.reviewCount > 0
            ? {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: product.rating,
                  reviewCount: product.reviewCount,
                },
              }
            : {}),
        }
      : undefined,
  });

  if (isPending) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="skeleton aspect-square rounded-[1.75rem]" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-2/3 rounded-full" />
            <div className="skeleton h-5 w-1/3 rounded-full" />
            <div className="skeleton h-24 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <section className="relative overflow-hidden">
        <div className="relative mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
          <h1 className="font-display text-display-lg font-bold">We couldn&rsquo;t find that one</h1>
          <RingDivider className="mt-4" />
          <p className="mt-5 text-ink-soft">
            This product may have sold out for good, or the link might be off. Everything
            else we stock is still one tap away.
          </p>
          <PlushButton to="/shop" className="mt-8">
            Back to the shop
          </PlushButton>
        </div>
      </section>
    );
  }

  const variant = selectedVariant ?? product.variants[0] ?? null;
  const color = selectedColor ?? product.colorOptions[0] ?? null;
  const price = product.priceRwf + (variant?.priceDelta ?? 0);
  const saving = discountPercent(price, product.compareAtRwf);
  const stock =
    variant || color
      ? Math.min(variant?.stock ?? Infinity, color?.stock ?? Infinity)
      : product.stock;
  const method = deliveryMethodFor(product.dimensions);
  const variantLabel = VARIANT_LABEL_BY_CATEGORY[product.categorySlug] ?? 'Option';
  const relatedItems = related?.items.filter((p) => p.id !== product.id).slice(0, 4) ?? [];

  const handleAdd = () => {
    add(product, colorKey, variant, quantity, color);
    toast.success(`${product.name} added`, { description: 'Tap the basket to review.' });
  };

  return (
    <div
      style={{
        ['--accent' as string]: accent.surface,
        ['--accent-soft' as string]: accent.soft,
        ['--accent-ink' as string]: accent.ink,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* --------------------------------------------------------- breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
          <Link to="/" className="hover:text-[hsl(var(--accent-ink))]">
            Home
          </Link>
          <span className="mx-2 text-ink-faint">/</span>
          <Link to="/shop" className="hover:text-[hsl(var(--accent-ink))]">
            Shop
          </Link>
          {category && (
            <>
              <span className="mx-2 text-ink-faint">/</span>
              <Link
                to={`/shop/${category.slug}`}
                className="hover:text-[hsl(var(--accent-ink))]"
              >
                {category.name}
              </Link>
            </>
          )}
          <span className="mx-2 text-ink-faint">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        {/* -------------------------------------------------------------- top */}
        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductGallery product={product} colorKey={colorKey} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              {product.tags.includes('preemie') && (
                <span className="rounded-full bg-[hsl(var(--accent)/0.22)] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-[hsl(var(--accent-ink))]">
                  Preemie
                </span>
              )}
              {product.isBestseller && (
                <span className="rounded-full bg-ink px-2.5 py-1 text-[0.65rem] font-bold text-cream">
                  Bestseller
                </span>
              )}
              {saving && (
                <span className="rounded-full bg-ink px-2.5 py-1 text-[0.65rem] font-bold text-cream">
                  −{saving}%
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-display-lg font-bold">{product.name}</h1>
            <p className="mt-1.5 text-ink-soft">{product.subtitle}</p>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-sunny text-sunny" aria-hidden />
                <span className="font-semibold text-ink">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-ink-faint">({product.reviewCount} reviews)</span>
              <span className="text-ink-faint">·</span>
              <span className="text-ink-faint">{product.brand}</span>
            </div>

            <div className="mt-5 flex items-baseline gap-2.5">
              <span className="font-display text-3xl font-bold text-[hsl(var(--accent-ink))]">
                {rwfFull(price)}
              </span>
              {product.compareAtRwf && (
                <span className="text-base text-ink-faint line-through">
                  {rwf(product.compareAtRwf)}
                </span>
              )}
            </div>

            <RingDivider className="mt-5" />

            {product.colorOptions.length > 0 && color && (
              <div className="mt-5">
                <ColorSwatchPicker
                  options={product.colorOptions}
                  selected={color}
                  onSelect={setSelectedColor}
                  accentInk={accent.ink}
                />
              </div>
            )}

            {product.variants.length > 0 && variant && (
              <div className="mt-5">
                <VariantPicker
                  variants={product.variants}
                  selected={variant}
                  onSelect={setSelectedVariant}
                  label={variantLabel}
                  accentInk={accent.ink}
                />
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full bg-surface-sunk">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="grid h-11 w-11 place-items-center rounded-full transition-transform active:scale-90"
                >
                  <Minus className="h-4 w-4" aria-hidden />
                </button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
                  aria-label="Increase quantity"
                  className="grid h-11 w-11 place-items-center rounded-full transition-transform active:scale-90"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <PlushButton
                onClick={handleAdd}
                disabled={stock <= 0}
                size="lg"
                className="flex-1 sm:flex-none"
              >
                {stock <= 0 ? 'Out of stock' : 'Add to basket'}
              </PlushButton>

              <WishlistButton productId={product.id} productName={product.name} />
            </div>

            {stock > 0 && stock <= 8 && (
              <p className="mt-3 text-sm font-semibold text-[hsl(var(--accent-ink))]">
                Only {stock} left in stock
              </p>
            )}

            {/* ---------------------------------------------------- delivery note */}
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-surface-sunk p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[hsl(var(--accent)/0.25)]">
                {method === 'van' ? (
                  <Ruler className="h-4 w-4 text-[hsl(var(--accent-ink))]" aria-hidden />
                ) : (
                  <Truck className="h-4 w-4 text-[hsl(var(--accent-ink))]" aria-hidden />
                )}
              </span>
              <p className="text-sm text-ink-soft">
                <span className="font-semibold text-ink">
                  {method === 'van' ? 'Car/van delivery' : 'Motorbike delivery'}.{' '}
                </span>
                {deliveryMethodNote(method)}
              </p>
            </div>
          </motion.div>
        </div>

        {/* ------------------------------------------------------------ details */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold">Details</h2>
            <RingDivider className="mt-3" />
            <p className="mt-4 leading-relaxed text-ink-soft">{product.description}</p>

            {product.careNotes.length > 0 && (
              <div className="mt-6">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                  <ShieldCheck className="h-5 w-5 text-[hsl(var(--accent-ink))]" aria-hidden />
                  Care notes
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {product.careNotes.map((note) => (
                    <li key={note} className="flex items-start gap-2 text-sm text-ink-soft">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--accent))]"
                        aria-hidden
                      />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* -------------------------------------------------------- dimensions */}
          <div>
            <h3 className="flex items-center gap-2 font-display text-lg font-bold">
              <Ruler className="h-5 w-5 text-[hsl(var(--accent-ink))]" aria-hidden />
              Size &amp; weight
            </h3>
            <RingDivider className="mt-3" />
            <dl className="mt-4 divide-y divide-hairline rounded-2xl bg-surface-sunk">
              {[
                ['Length', `${product.dimensions.lengthCm} cm`],
                ['Width', `${product.dimensions.widthCm} cm`],
                ['Height', `${product.dimensions.heightCm} cm`],
                ['Weight', `${product.dimensions.weightKg} kg`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <dt className="text-ink-soft">{label}</dt>
                  <dd className="font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-ink-faint">
              Measurements are for the packaged item and set the delivery method shown
              above — the same numbers Fridorine&rsquo;s riders use to decide bike or van.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------ related */}
        {relatedItems.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold">You might also like</h2>
            <RingDivider className="mt-3" />
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {relatedItems.map((p, i) => (
                <ProductCard key={p.id} product={p} colorKey={colorFor(p.categorySlug)} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
