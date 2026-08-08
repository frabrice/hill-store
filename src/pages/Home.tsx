import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  HeartHandshake,
  Truck,
} from 'lucide-react';
import { RingArc, RingDivider } from '@/components/brand/ComfortRing';
import { HeroScene } from '@/components/brand/HeroScene';
import { PlushButton } from '@/components/ui/PlushButton';
import { StageSelector } from '@/components/shop/StageSelector';
import { ProductCard } from '@/components/shop/ProductCard';
import { useArticles, useCategories, useKits, useProducts } from '@/hooks/useCatalog';
import { useCategoryColors } from '@/hooks/useCategoryColors';
import { resolveIcon } from '@/lib/icons';
import { rwfFull } from '@/lib/format';
import { ACCENTS } from '@/lib/theme';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ProductImage } from '@/components/shop/ProductImage';
import type { Category, ColorKey, Product } from '@/lib/services/types';

/**
 * The exact colours the Ibibondo wordmark itself uses, letter by letter —
 * see `components/brand/Logo.tsx`'s `LETTERS` array, whose distinct hues in
 * order are pink-deep, sky, pink, lavender, mint, sunny (the wordmark
 * repeats pink-deep and sky once more before its final sunny "o", but the
 * six here are already every colour it uses). Deliberately the real
 * base-strength tokens, not a darkened reinterpretation — the client's
 * point was that this should look like the actual logo colours, not a
 * contrast-safe approximation of them.
 */
const HEADLINE_COLORS = ['--pink-deep', '--sky', '--pink', '--lavender', '--mint', '--sunny'];

/** Colours every non-space character in sequence, repeating the palette
 * once it runs out — spaces pass through uncoloured and don't consume a
 * turn, so a new word picks up the cycle exactly where the last left off. */
function ColorfulText({ text }: { text: string }) {
  let turn = 0;
  return (
    <>
      {[...text].map((char, i) => {
        if (char === ' ') return <span key={i}> </span>;
        const color = `hsl(var(${HEADLINE_COLORS[turn % HEADLINE_COLORS.length]}))`;
        turn++;
        return (
          <span key={i} style={{ color }}>
            {char}
          </span>
        );
      })}
    </>
  );
}

/** The hero's main CTA, cycling through the wordmark's palette every couple
 * of seconds instead of sitting on one static accent — an attention-getting
 * flourish reserved for the single most important button on the page, not
 * something every button gets. Kept to the `-deep` tokens (unlike the
 * headline above) because every one of them is dark enough to reliably
 * carry the same light button text — mixing in the lighter base tones would
 * mean flipping text colour per swatch just to stay legible. */
const BUTTON_CYCLE_COLORS = ['--pink-deep', '--lavender-deep', '--sky-deep', '--mint-deep', '--sunny-deep'];
const RAINBOW_INTERVAL_MS = 2000;

function RainbowShopButton() {
  const reduced = useReducedMotion();
  const [turn, setTurn] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setTurn((t) => (t + 1) % BUTTON_CYCLE_COLORS.length);
    }, RAINBOW_INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <PlushButton
      to="/shop"
      size="lg"
      style={{
        ['--accent' as string]: `var(${BUTTON_CYCLE_COLORS[turn]})`,
        color: 'hsl(var(--cream))',
      }}
      className="transition-colors duration-700 ease-plush"
    >
      Shop all products
      <ArrowRight className="h-4 w-4" aria-hidden />
    </PlushButton>
  );
}

const PROMISES: { icon: typeof Truck; title: string; body: string; hue: ColorKey }[] = [
  { icon: Truck, title: 'Same-day in Kigali', body: 'Ordered before 2pm, delivered today.', hue: 'sky' },
  { icon: BadgeCheck, title: 'Genuine products', body: 'Sourced directly, never counterfeit.', hue: 'mint' },
  { icon: HeartHandshake, title: 'Hard-to-find sizes', body: 'Including tiny preemie fits.', hue: 'pink' },
  { icon: Clock, title: 'Here when you need us', body: 'WhatsApp answered seven days a week.', hue: 'sunny' },
];

/**
 * Each homepage section owns a fixed hue rather than inheriting the single
 * `--accent` variable (which defaults to pink, since Home never sets a
 * category). Scrolling the page this way visibly moves through the full
 * palette instead of staying on one colour — including sunny, which
 * otherwise only ever appears on Health-category content.
 */
function SectionHeading({
  eyebrow,
  title,
  action,
  hue,
}: {
  eyebrow: string;
  title: string;
  action?: { to: string; label: string };
  hue: ColorKey;
}) {
  const accent = ACCENTS[hue];
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p
          className="text-eyebrow font-bold uppercase"
          style={{ color: `hsl(${accent.ink})` }}
        >
          {eyebrow}
        </p>
        <h2 className="mt-2 font-display text-display-md font-bold">{title}</h2>
        <RingDivider className="mt-3" />
      </div>
      {action && (
        <Link
          to={action.to}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          {action.label}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      )}
    </div>
  );
}

/**
 * A shelf card — tall, fixed-width, built to sit in a horizontally scrolling
 * row rather than a grid cell. Deliberately uniform in size: the variety
 * here comes from motion (scroll) and colour, not from mismatched shapes.
 */
function CategoryShelfCard({
  category,
  index,
  image,
}: {
  category: Category;
  index: number;
  image?: Product;
}) {
  const Icon = resolveIcon(category.icon);
  const accent = ACCENTS[category.colorKey];

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
      style={{
        ['--accent' as string]: accent.surface,
        ['--accent-soft' as string]: accent.soft,
        ['--accent-ink' as string]: accent.ink,
      }}
      className="w-40 shrink-0 snap-start sm:w-48"
    >
      {/* Same recipe as the "Curated kits" cards below: a real photo filling
          a short header edge-to-edge, a small icon badge for identity — not
          a giant decorative watermark — and a plain plate underneath. */}
      <Link
        to={`/shop/${category.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[hsl(var(--accent)/0.35)] bg-surface shadow-plush-sm transition-all duration-300 ease-plush hover:-translate-y-1 hover:border-[hsl(var(--accent))] hover:shadow-plush-lg"
      >
        <div className="relative h-32 overflow-hidden bg-[hsl(var(--accent-soft))] sm:h-36">
          {category.image || image ? (
            <div className="absolute inset-0 transition-transform duration-500 ease-plush group-hover:scale-[1.06]">
              <ProductImage
                publicId={category.image ?? image?.images[0]}
                alt=""
                colorKey={category.colorKey}
                art={image?.art}
                width={320}
              />
            </div>
          ) : (
            <Icon
              className="absolute -bottom-3 -right-3 h-24 w-24 text-[hsl(var(--accent))] opacity-50"
              strokeWidth={1}
              aria-hidden
            />
          )}
          <span className="absolute left-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-surface/90 shadow-plush-sm backdrop-blur-sm">
            <Icon className="h-4 w-4 text-[hsl(var(--accent-ink))]" aria-hidden />
          </span>
        </div>

        <div className="flex flex-1 flex-col p-3.5">
          <h3 className="font-display text-sm font-bold leading-snug">{category.name}</h3>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
            <span className="text-xs font-semibold text-ink-faint">
              {category.subcategories.length} types
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--accent-ink))]">
              Browse
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * Wraps the shelf in scroll-position-aware arrow buttons instead of a
 * visible scrollbar. Native touch/trackpad scrolling still works — the
 * scrollbar is only visually hidden, not disabled — the arrows are an
 * additional pointer-friendly way to move, and they double as the "there's
 * more this way" cue a hidden scrollbar can no longer give.
 */
/** Cards per second-ish — deliberately tiny. This is meant to read as a
 * gentle drift, not a carousel someone is expected to watch. */
const AUTOPLAY_PX_PER_FRAME = 0.35;
/** How long to leave it alone after any manual interaction before the
 * drift picks back up. */
const AUTOPLAY_RESUME_DELAY_MS = 3000;

function CategoryShelf({
  categories,
  categoryImage,
}: {
  categories: Category[] | undefined;
  categoryImage: Map<string, Product>;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const loopStartRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const reduced = useReducedMotion();
  const pausedUntilRef = useRef(0);
  const hoveredRef = useRef(false);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories?.length]);

  // A slow, continuous drift to the right — paused while the pointer is
  // resting anywhere over the shelf (not just while it's moving — sitting
  // still to read a card shouldn't restart the clock) or shortly after a
  // touch/arrow interaction, and, per accessibility guidance, never started
  // at all if the browser's reduced-motion setting is on.
  //
  // The category list is rendered twice back to back (see below). Once the
  // scroll position passes the exact width of the first copy, we subtract
  // that same width — since copy two is pixel-identical to copy one, the
  // jump is invisible and the drift reads as one endless loop rather than a
  // scroll-to-start snap.
  //
  // `snap-mandatory` (below) is what makes a manual swipe or arrow-click
  // settle neatly on a card — but browsers apply that same snapping to any
  // scrollLeft write, including this drift's sub-pixel steps, which pins it
  // to the nearest snap point and cancels the animation outright. So snap
  // is switched off for the duration of an active drift tick and restored
  // the instant it's paused, keeping both behaviours without them fighting.
  useEffect(() => {
    if (reduced) return;
    let frame: number;

    const tick = () => {
      const el = scrollerRef.current;
      const loopStart = loopStartRef.current;
      if (el && loopStart) {
        const active = !hoveredRef.current && performance.now() > pausedUntilRef.current;
        el.style.scrollSnapType = active ? 'none' : '';
        if (active) {
          const wrapAt = loopStart.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft;
          if (wrapAt > 0) {
            el.scrollLeft += AUTOPLAY_PX_PER_FRAME;
            if (el.scrollLeft >= wrapAt) {
              el.scrollLeft -= wrapAt;
            }
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  const pause = () => {
    pausedUntilRef.current = performance.now() + AUTOPLAY_RESUME_DELAY_MS;
  };

  const scroll = (direction: 1 | -1) => {
    pause();
    scrollerRef.current?.scrollBy({
      left: direction * scrollerRef.current.clientWidth * 0.8,
      behavior: 'smooth',
    });
  };

  const arrowClass =
    'absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-surface text-ink shadow-plush-lg transition-all duration-200 ease-plush hover:scale-110 active:scale-95';

  return (
    <div className="relative">
      {canLeft && (
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll to previous categories"
          className={cn(arrowClass, 'left-2 sm:left-4')}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
      )}

      <div
        ref={scrollerRef}
        onMouseEnter={() => {
          hoveredRef.current = true;
        }}
        onMouseLeave={() => {
          hoveredRef.current = false;
          pause();
        }}
        onTouchStart={pause}
        onPointerDown={pause}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 pt-1 sm:px-6"
      >
        <div className="flex shrink-0 gap-4">
          {categories?.map((category, i) => (
            <CategoryShelfCard
              key={`a-${category.slug}`}
              category={category}
              index={i}
              image={categoryImage.get(category.slug)}
            />
          ))}
        </div>
        {categories && categories.length > 0 && (
          <div ref={loopStartRef} className="flex shrink-0 gap-4">
            {categories.map((category, i) => (
              <CategoryShelfCard
                key={`b-${category.slug}`}
                category={category}
                index={i}
                image={categoryImage.get(category.slug)}
              />
            ))}
          </div>
        )}
      </div>

      {canRight && (
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll to more categories"
          className={cn(arrowClass, 'right-2 sm:right-4')}
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function Home() {
  const [stage, setStage] = useState<string | null>(null);
  const colorFor = useCategoryColors();

  const { data: categories } = useCategories();
  const { data: kits } = useKits();
  const { data: articles } = useArticles();
  const { data: featured } = useProducts({
    stageSlug: stage ?? undefined,
    sort: 'featured',
    limit: 8,
  });
  // One representative photo per category for the shelf cards below — the
  // full catalogue is cheap to fetch once and TanStack Query caches it
  // alongside every other page that already pulls the same list.
  const { data: allProducts } = useProducts({});
  const categoryImage = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of allProducts?.items ?? []) {
      const current = map.get(p.categorySlug);
      if (!current || (p.isFeatured && !current.isFeatured) || (!current.isFeatured && p.rating > current.rating)) {
        map.set(p.categorySlug, p);
      }
    }
    return map;
  }, [allProducts]);

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="relative overflow-hidden">
        <RingArc className="opacity-70" />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-8">
            {/* Copy — centred on mobile, left-aligned once the picture sits beside it. */}
            <div className="text-center lg:text-left">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-4 py-1.5 text-xs font-semibold text-ink-soft shadow-plush-sm backdrop-blur"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden />
                Delivering across Kigali, seven days a week
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 font-display text-display-xl font-bold"
              >
                <ColorfulText text="Everything your little one needs, from the very first day" />
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg lg:mx-0"
              >
                Gentle, genuine products for babies and infants — including the
                tiny sizes and careful essentials that are hard to find anywhere
                else in Rwanda.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
              >
                <RainbowShopButton />
                <PlushButton to="/kits" variant="outline" size="lg">
                  Explore curated kits
                </PlushButton>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="px-6 sm:px-12 lg:px-0"
            >
              <HeroScene />
            </motion.div>
          </div>

          {/* Stage selector sits in the hero: the first question a parent has
              is "what fits my baby right now?" */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-12 max-w-3xl rounded-3xl bg-surface/80 p-5 shadow-plush backdrop-blur-xl"
          >
            <p className="mb-3 text-center text-sm font-semibold text-ink-soft">
              Shop by your baby&rsquo;s stage
            </p>
            <StageSelector value={stage} onChange={setStage} />
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------- categories */}
      <section className="bloom-wash relative overflow-hidden py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Browse"
            title="Shop by category"
            action={{ to: '/shop', label: 'See everything' }}
            hue="mint"
          />
        </div>

        {/* A horizontal shelf, not a grid — kept inside the same max-w-7xl
            frame as every other section (and the heading above it) so its
            edges line up with the rest of the page instead of bleeding to
            the viewport edge. Scroll-snap so it settles on a card rather
            than stopping mid-scroll. No visible scrollbar — arrow buttons
            that appear only when there's somewhere left to go are the
            control, not a track to drag. */}
        <div className="mx-auto max-w-7xl">
          <CategoryShelf categories={categories} categoryImage={categoryImage} />
        </div>
      </section>

      {/* ------------------------------------------------------ featured */}
      <section className="bg-surface-sunk/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={stage ? 'Matched to your stage' : 'Chosen with care'}
            title="Loved by Kigali parents"
            action={{ to: '/shop', label: 'Shop all' }}
            hue="sunny"
          />

          {featured?.items.length === 0 ? (
            <p className="rounded-3xl bg-surface p-10 text-center text-ink-soft shadow-plush">
              Nothing in this stage yet — try another.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {featured?.items.map((product, i) => (
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
      </section>

      {/* ---------------------------------------------------------- kits */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Ready to go"
          title="Curated kits, nothing forgotten"
          action={{ to: '/kits', label: 'All kits' }}
          hue="lavender"
        />

        <div className="grid gap-4 md:grid-cols-3">
          {kits?.map((kit, i) => {
            const Icon = resolveIcon(kit.icon);
            const accent = ACCENTS[kit.colorKey];
            return (
              <motion.div
                key={kit.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  ['--accent' as string]: accent.surface,
                  ['--accent-ink' as string]: accent.ink,
                }}
              >
                <Link
                  to={`/kits`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl bg-surface shadow-plush transition-all duration-300 ease-plush hover:-translate-y-1.5 hover:shadow-plush-lg"
                >
                  <div className="relative h-36 overflow-hidden bg-[hsl(var(--accent)/0.3)]">
                    <Icon
                      className="absolute -bottom-4 -right-2 h-32 w-32 text-[hsl(var(--accent))] opacity-70 transition-transform duration-500 group-hover:scale-110"
                      strokeWidth={1}
                      aria-hidden
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-xs font-bold text-[hsl(var(--accent-ink))] shadow-plush-sm">
                      {kit.productIds.length} items
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-xl font-bold">{kit.name}</h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">
                      {kit.description}
                    </p>
                    <span className="mt-4 font-display text-lg font-bold">
                      {rwfFull(kit.priceRwf)}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------- promises */}
      <section className="bloom-wash relative overflow-hidden bg-ink py-14 text-cream">
        <div className="comfort-gradient absolute inset-x-0 top-0 h-1" aria-hidden />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {PROMISES.map(({ icon: Icon, title, body, hue }, i) => {
            const accent = ACCENTS[hue];
            return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="flex gap-3"
              >
                <div
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                  style={{ backgroundColor: `hsl(${accent.surface} / 0.24)` }}
                >
                  <Icon className="h-5 w-5" style={{ color: `hsl(${accent.nightInk})` }} aria-hidden />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-cream">{title}</h3>
                  <p className="mt-1 text-sm text-cream/70">{body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------------- learn */}
      <section className="bloom-wash relative overflow-hidden px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Learn"
          title="Guidance for the early days"
          action={{ to: '/learn', label: 'All guides' }}
          hue="sky"
        />

        <div className="grid gap-4 md:grid-cols-3">
          {articles?.slice(0, 3).map((article, i) => {
            const accent = ACCENTS[article.colorKey];
            return (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  ['--accent' as string]: accent.surface,
                  ['--accent-ink' as string]: accent.ink,
                }}
              >
                <Link
                  to={`/learn/${article.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl bg-surface shadow-plush transition-all duration-300 ease-plush hover:-translate-y-1.5 hover:shadow-plush-lg"
                >
                  {/* Decorative header band in the article's own colour. */}
                  <div className="relative h-32 overflow-hidden bg-[hsl(var(--accent)/0.3)]">
                    <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-surface/40" />
                    <div className="absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-surface/30" />
                    <BookOpen
                      className="absolute right-5 top-1/2 h-16 w-16 -translate-y-1/2 text-[hsl(var(--accent-ink))] opacity-40"
                      strokeWidth={1.2}
                      aria-hidden
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-xs text-ink-faint">
                      <span className="rounded-full bg-[hsl(var(--accent)/0.25)] px-2.5 py-0.5 font-semibold text-[hsl(var(--accent-ink))]">
                        {article.topic}
                      </span>
                      <span>{article.readMinutes} min read</span>
                    </div>
                    <h3 className="mt-2.5 font-display text-lg font-bold leading-snug">
                      {article.title}
                    </h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">
                      {article.excerpt}
                    </p>
                    <span className="mt-3 text-xs text-ink-faint">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
        </div>
      </section>
    </>
  );
}
