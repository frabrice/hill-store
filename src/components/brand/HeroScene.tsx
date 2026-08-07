import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Star, Truck } from 'lucide-react';
import { ProductArt } from './ProductArt';
import { rwfFull } from '@/lib/format';

/**
 * The hero picture.
 *
 * An illustrated baby rather than stock photography — it matches the logo's
 * own character (which the client already chose), it cannot go out of date or
 * clash with the palette, and it carries no licensing question. When the
 * client shoots real photography this is the one component to swap.
 *
 * Skin and hair follow the logo's baby deliberately: the customers are
 * Rwandan families and the illustration should look like them.
 */

const SKIN = 'hsl(25 42% 56%)';
const SKIN_DARK = 'hsl(25 38% 47%)';
const HAIR = 'hsl(25 30% 18%)';

function Baby() {
  return (
    <svg viewBox="0 0 440 480" className="relative h-full w-full" aria-hidden>
      {/* Soft stage behind the figure */}
      <circle cx="220" cy="240" r="185" fill="hsl(var(--surface))" opacity="0.55" />
      <circle cx="220" cy="240" r="150" fill="hsl(var(--surface))" opacity="0.6" />

      {/* Legs */}
      <rect x="150" y="330" width="54" height="96" rx="27" fill="hsl(var(--surface))" />
      <rect x="236" y="330" width="54" height="96" rx="27" fill="hsl(var(--surface))" />
      <ellipse cx="177" cy="424" rx="30" ry="22" fill={SKIN} />
      <ellipse cx="263" cy="424" rx="30" ry="22" fill={SKIN} />

      {/* Body — a simple white bodysuit */}
      <path
        d="M150 250h140a30 30 0 0 1 30 30v52a44 44 0 0 1-44 44H164a44 44 0 0 1-44-44v-52a30 30 0 0 1 30-30z"
        fill="hsl(var(--surface))"
      />
      {/* Bodysuit trim in the brand pink */}
      <path
        d="M120 316h200v16a44 44 0 0 1-44 44H164a44 44 0 0 1-44-44z"
        fill="hsl(var(--pink))"
        opacity="0.55"
      />

      {/* Arms */}
      <rect
        x="86"
        y="262"
        width="52"
        height="34"
        rx="17"
        fill={SKIN}
        transform="rotate(-16 112 279)"
      />
      <rect
        x="302"
        y="262"
        width="52"
        height="34"
        rx="17"
        fill={SKIN}
        transform="rotate(16 328 279)"
      />
      <circle cx="88" cy="268" r="19" fill={SKIN_DARK} />
      <circle cx="352" cy="268" r="19" fill={SKIN_DARK} />

      {/* Head */}
      <circle cx="220" cy="168" r="92" fill={SKIN} />
      {/* Ears */}
      <circle cx="130" cy="176" r="19" fill={SKIN_DARK} />
      <circle cx="310" cy="176" r="19" fill={SKIN_DARK} />

      {/* Curly hair — overlapping rounds, like the logo */}
      <path d="M132 140a90 90 0 0 1 176 0z" fill={HAIR} />
      <circle cx="158" cy="112" r="26" fill={HAIR} />
      <circle cx="196" cy="94" r="30" fill={HAIR} />
      <circle cx="240" cy="92" r="30" fill={HAIR} />
      <circle cx="282" cy="110" r="26" fill={HAIR} />
      <circle cx="306" cy="136" r="20" fill={HAIR} />
      <circle cx="134" cy="138" r="20" fill={HAIR} />

      {/* Face */}
      <circle cx="192" cy="172" r="8" fill={HAIR} />
      <circle cx="248" cy="172" r="8" fill={HAIR} />
      <circle cx="194" cy="169" r="2.6" fill="#fff" />
      <circle cx="250" cy="169" r="2.6" fill="#fff" />
      <ellipse cx="164" cy="196" rx="15" ry="10" fill="hsl(var(--pink))" opacity="0.5" />
      <ellipse cx="276" cy="196" rx="15" ry="10" fill="hsl(var(--pink))" opacity="0.5" />
      <path
        d="M200 200q20 20 40 0"
        stroke={HAIR}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A floating card, gently drifting. */
function Floater({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      animate={reduced ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {children}
    </motion.div>
  );
}

export function HeroScene() {
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // A gentle drift as the hero scrolls past — the one signature parallax
  // moment on the page, everything else stays calm.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const blobY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-22, 22]);
  const blobScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 1.06]);

  return (
    <div ref={containerRef} className="relative mx-auto aspect-square w-full max-w-lg">
      {/* Blob ground in the brand gradient — the baby is a cutout, so it sits
          in front of this rather than being cropped into it. Opacities are
          turned up and both blobs carry three brand hues each so the hero
          reads as the fullest expression of the palette on the page. */}
      <motion.div
        className="absolute inset-2 bg-gradient-to-br from-pink/70 via-lavender/60 to-sky/65"
        style={{ borderRadius: '46% 54% 52% 48% / 50% 46% 54% 50%', y: blobY, scale: blobScale }}
      />
      {/* A second, offset blob adds depth and brings in the two hues the
          front blob doesn't carry. */}
      <motion.div
        className="absolute inset-6 bg-gradient-to-tr from-sunny/45 via-mint/40 to-lavender/30"
        style={{ borderRadius: '54% 46% 48% 52% / 46% 52% 48% 54%', y: blobY }}
      />

      {/* The client's own photograph. Falls back to the illustration if it
          ever fails to load, so the hero is never an empty box. */}
      {failed ? (
        <Baby />
      ) : (
        <img
          src="/brand/hero-baby-700.webp"
          srcSet="/brand/hero-baby-700.webp 700w, /brand/hero-baby-1100.webp 1100w"
          sizes="(max-width: 1024px) 80vw, 32rem"
          width={1023}
          height={1024}
          alt="A smiling baby sitting in a white bodysuit"
          onError={() => setFailed(true)}
          // Slightly oversized and pushed down so the baby breaks out of the
          // blob rather than floating politely inside it.
          className="absolute inset-x-0 bottom-0 mx-auto h-[104%] w-auto max-w-none object-contain drop-shadow-[0_18px_30px_hsl(var(--shadow)/0.22)]"
        />
      )}

      {/* Floating proof points — the reassurance a first-time buyer wants. */}
      <Floater className="absolute left-0 top-[16%]" delay={0.4}>
        <div className="flex items-center gap-2 rounded-2xl bg-surface px-3 py-2 shadow-plush-lg">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-mint/30">
            <Truck className="h-4 w-4 text-ink" aria-hidden />
          </span>
          <span className="text-xs font-bold leading-tight text-ink">
            Same-day
            <span className="block font-medium text-ink-soft">in Kigali</span>
          </span>
        </div>
      </Floater>

      <Floater className="absolute right-0 top-[6%]" delay={1.4}>
        <div className="flex items-center gap-1.5 rounded-2xl bg-surface px-3 py-2 shadow-plush-lg">
          <Star className="h-4 w-4 fill-sunny text-sunny" aria-hidden />
          <span className="text-xs font-bold text-ink">4.9</span>
          <span className="text-xs text-ink-soft">· 300+ parents</span>
        </div>
      </Floater>

      {/* A real product card, so the hero shows what the shop actually sells. */}
      <Floater className="absolute -bottom-2 right-0 w-40" delay={0.9}>
        <div className="rounded-2xl bg-surface p-2.5 shadow-plush-lg">
          <div className="h-20 overflow-hidden rounded-xl bg-gradient-to-br from-mint/40 to-sky/30">
            <ProductArt art="bottle" colorKey="mint" className="h-full w-full" />
          </div>
          <p className="mt-2 text-[0.7rem] font-bold leading-tight text-ink">
            Preemie Slow-Flow Bottle
          </p>
          <p className="text-[0.7rem] font-semibold text-ink-soft">
            {rwfFull(12500)}
          </p>
        </div>
      </Floater>
    </div>
  );
}
