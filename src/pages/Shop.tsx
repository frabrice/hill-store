import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { RingDivider } from '@/components/brand/ComfortRing';
import { StageSelector } from '@/components/shop/StageSelector';
import { ProductCard } from '@/components/shop/ProductCard';
import { useCategories, useCategory, useProducts } from '@/hooks/useCatalog';
import { useCategoryColors } from '@/hooks/useCategoryColors';
import { useSeo, SITE_URL } from '@/hooks/useSeo';
import { useUI } from '@/store/ui';
import { resolveIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { ProductQuery } from '@/lib/services/types';

const SORTS: { value: NonNullable<ProductQuery['sort']>; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Best rated' },
  { value: 'newest', label: 'Newest' },
];

export function Shop() {
  const { categorySlug } = useParams();
  const [stage, setStage] = useState<string | null>(null);
  const [sort, setSort] = useState<NonNullable<ProductQuery['sort']>>('featured');

  const colorFor = useCategoryColors();
  const setAccent = useUI((s) => s.setAccent);

  const { data: categories } = useCategories();
  const { data: category } = useCategory(categorySlug);
  const { data: results, isPending } = useProducts({
    categorySlug,
    stageSlug: stage ?? undefined,
    sort,
  });

  // Entering a category dresses the whole page in its colour.
  useEffect(() => {
    if (category) setAccent(category.colorKey);
  }, [category, setAccent]);

  const heading = category?.name ?? 'All products';
  const tagline =
    category?.tagline ?? 'Quality essentials for every part of your home, delivered across Kigali.';

  useSeo({
    title: category ? `${category.name} | Hill Store` : 'Shop All Products | Hill Store',
    description: category
      ? `${category.tagline.replace(/\.?\s*$/, '.')} Shop ${category.name.toLowerCase()} at Hill Store, delivered across Kigali.`
      : 'Shop every product Hill Store carries — kitchenware, cleaning, bedroom comfort, baby essentials and more, delivered across Kigali.',
    path: categorySlug ? `/shop/${categorySlug}` : '/shop',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: heading,
      description: tagline,
      url: `${SITE_URL}${categorySlug ? `/shop/${categorySlug}` : '/shop'}`,
    },
  });

  return (
    <>
      <section
        className={cn(
          'relative overflow-hidden border-b border-hairline',
          category ? 'bg-[hsl(var(--accent)/0.14)]' : 'bloom-wash',
        )}
      >
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
            <Link to="/" className="hover:text-[hsl(var(--accent-ink))]">
              Home
            </Link>
            <span className="mx-2 text-ink-faint">/</span>
            {category ? (
              <>
                <Link to="/shop" className="hover:text-[hsl(var(--accent-ink))]">
                  Shop
                </Link>
                <span className="mx-2 text-ink-faint">/</span>
                <span className="text-ink">{category.name}</span>
              </>
            ) : (
              <span className="text-ink">Shop</span>
            )}
          </nav>

          <p className="mt-4 text-eyebrow font-bold uppercase text-[hsl(var(--accent-ink))]">
            Shop
          </p>
          <h1 className="mt-1 font-display text-display-lg font-bold">
            {heading}
          </h1>
          <RingDivider className="mt-3" />
          {category && <p className="mt-3 max-w-xl text-ink-soft">{tagline}</p>}
        </div>
      </section>

      {/* ------------------------------------------------------- filters */}
      {/* Sticky offset matches whichever header state is active: full
          mobile header, full tablet header with delivery strip, or just the
          header's own sticky category strip once the brand row has
          scrolled away. Pixel values, measured directly from rendered
          header heights, rather than rem computed from padding/line-height
          on paper — the root font-size isn't 16px here, and rem math
          against the wrong base is exactly how this drifted out of sync
          last time. */}
      <section className="sticky top-[55px] z-30 border-b border-hairline bg-cream/90 backdrop-blur-xl sm:top-[91px] md:top-[47px]">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-3 sm:px-6">
          {/* Category chips — mobile only. At `md`+ the header's own sticky
              category strip is the sole category nav, so this would just
              duplicate it. */}
          <div className="nice-scroll flex gap-2 overflow-x-auto md:hidden">
            <Link
              to="/shop"
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200',
                !categorySlug
                  ? 'bg-ink text-cream'
                  : 'bg-surface text-ink-soft shadow-plush-sm hover:text-ink',
              )}
            >
              All
            </Link>
            {categories?.map((c) => {
              const Icon = resolveIcon(c.icon);
              const active = categorySlug === c.slug;
              return (
                <Link
                  key={c.slug}
                  to={`/shop/${c.slug}`}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200',
                    active
                      ? 'bg-ink text-cream'
                      : 'bg-surface text-ink-soft shadow-plush-sm hover:text-ink',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {c.name}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {categorySlug === 'baby-essentials' && (
              <div className="min-w-0 flex-1">
                <StageSelector value={stage} onChange={setStage} />
              </div>
            )}

            <label className="flex shrink-0 items-center gap-2 text-sm ml-auto">
              <SlidersHorizontal
                className="h-4 w-4 text-ink-faint"
                aria-hidden
              />
              <span className="sr-only">Sort products</span>
              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value as NonNullable<ProductQuery['sort']>)
                }
                className="rounded-full bg-surface px-3 py-2 text-sm font-semibold text-ink shadow-plush-sm outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="mb-6 text-sm text-ink-soft">
          {isPending
            ? 'Loading…'
            : `${results?.total ?? 0} product${results?.total === 1 ? '' : 's'}`}
          {stage && ' in this stage'}
        </p>

        {isPending ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[3/4] rounded-3xl" />
            ))}
          </div>
        ) : results?.items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-surface p-12 text-center shadow-plush"
          >
            <p className="font-display text-xl font-bold">Nothing here yet</p>
            <p className="mt-2 text-ink-soft">
              Try another stage, or browse everything.
            </p>
            <Link
              to="/shop"
              className="mt-4 inline-block font-semibold text-[hsl(var(--accent-ink))] hover:underline"
            >
              See all products
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {results?.items.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                colorKey={colorFor(product.categorySlug)}
                index={i}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
