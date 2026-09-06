import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { RingDivider } from '@/components/brand/ComfortRing';
import { PlushButton } from '@/components/ui/PlushButton';
import { ProductImage } from '@/components/shop/ProductImage';
import { useKits, useProductsByIds } from '@/hooks/useCatalog';
import { useCategoryColors } from '@/hooks/useCategoryColors';
import { useSeo } from '@/hooks/useSeo';
import { useCart } from '@/store/cart';
import { useUI } from '@/store/ui';
import { resolveIcon } from '@/lib/icons';
import { rwfFull } from '@/lib/format';
import { ACCENTS } from '@/lib/theme';
import type { Kit } from '@/lib/services/types';

function KitSpread({ kit, index }: { kit: Kit; index: number }) {
  const { data: items } = useProductsByIds(kit.productIds);
  const colorFor = useCategoryColors();
  const add = useCart((s) => s.add);
  const accent = ACCENTS[kit.colorKey];
  const Icon = resolveIcon(kit.icon);

  const memberTotal = items?.reduce((sum, p) => sum + p.priceRwf, 0) ?? 0;
  const savingRwf = memberTotal - kit.priceRwf;

  const handleAddKit = () => {
    if (!items) return;
    items.forEach((p) =>
      add(p, colorFor(p.categorySlug), p.variants[0] ?? null, 1, p.colorOptions[0] ?? null),
    );
    toast.success(`${kit.name} added`, { description: `${items.length} items in your basket.` });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-[2rem] bg-surface shadow-plush"
    >
      <div className="grid lg:grid-cols-[minmax(0,20rem)_1fr]">
        {/* --------------------------------------------------------- the kit */}
        <div
          className="flex flex-col justify-between p-8"
          style={{ backgroundColor: `hsl(${accent.soft})` }}
        >
          <div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface/80 shadow-plush-sm">
              <Icon className="h-6 w-6" style={{ color: `hsl(${accent.ink})` }} aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold">{kit.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{kit.description}</p>
          </div>

          <div className="mt-6">
            <div className="flex items-baseline gap-2">
              <span
                className="font-display text-2xl font-bold"
                style={{ color: `hsl(${accent.ink})` }}
              >
                {rwfFull(kit.priceRwf)}
              </span>
              {savingRwf > 0 && (
                <span className="text-sm text-ink-faint line-through">{rwfFull(memberTotal)}</span>
              )}
            </div>
            {savingRwf > 0 && (
              <p className="mt-1 text-sm font-semibold" style={{ color: `hsl(${accent.ink})` }}>
                Save {rwfFull(savingRwf)} versus buying separately
              </p>
            )}
            <PlushButton onClick={handleAddKit} size="lg" className="mt-4 w-full">
              <ShoppingBag className="h-4 w-4" aria-hidden />
              Add whole kit
            </PlushButton>
          </div>
        </div>

        {/* ---------------------------------------------------- what's inside */}
        <div className="p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
            What&rsquo;s inside · {kit.productIds.length} items
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {items?.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.slug}`}
                className="group rounded-2xl border border-hairline p-2.5 transition-colors duration-200 hover:border-[hsl(var(--accent))]"
                style={{ ['--accent' as string]: accent.surface }}
              >
                <div className="aspect-square overflow-hidden rounded-xl bg-surface-sunk">
                  <ProductImage
                    publicId={p.images[0]}
                    alt={p.name}
                    colorKey={colorFor(p.categorySlug)}
                    art={p.art}
                    width={200}
                  />
                </div>
                <p className="mt-2 line-clamp-2 text-xs font-semibold leading-snug text-ink">
                  {p.name}
                </p>
                <p className="text-xs text-ink-faint">{rwfFull(p.priceRwf)}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function Kits() {
  const { data: kits } = useKits();
  const setAccent = useUI((s) => s.setAccent);

  useEffect(() => {
    setAccent('lavender');
  }, [setAccent]);

  useSeo({
    title: 'Curated Baby Kits | Hill Store',
    description:
      'Ready-made baby kits from Hill Store — coming-home bags, first-bath sets and more, bundled and delivered across Kigali.',
    path: '/kits',
  });

  return (
    <>
      <section className="relative overflow-hidden border-b border-hairline bg-[hsl(var(--accent)/0.14)]">
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <p className="text-eyebrow font-bold uppercase text-[hsl(var(--accent-ink))]">
            Ready to go
          </p>
          <h1 className="mt-1 font-display text-display-lg font-bold">Curated kits</h1>
          <RingDivider className="mt-3" />
          <p className="mt-3 max-w-xl text-ink-soft">
            Everything for a moment sorted at once, chosen so nothing is missing and priced
            better than buying each piece alone.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
        {kits?.map((kit, i) => (
          <KitSpread key={kit.slug} kit={kit} index={i} />
        ))}
      </div>
    </>
  );
}
