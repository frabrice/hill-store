import { motion, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * The Comfort Ring — the rainbow arc from the logo, reused as the site's
 * connective tissue. One motif, three jobs: scroll progress, section dividers,
 * and the soft wash behind headers.
 */

/** Fixed rainbow progress bar across the top of the page. */
export function ScrollRibbon() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: width }}
      className="comfort-gradient fixed inset-x-0 top-0 z-[60] h-1 origin-left"
    />
  );
}

/** A soft rainbow rule used to separate sections. */
export function RingDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('comfort-gradient h-1 w-24 rounded-full opacity-80', className)}
    />
  );
}

/**
 * The arc itself — a wide, very soft rainbow curve. Sits behind hero content
 * as an ambient wash rather than a hard graphic.
 */
export function RingArc({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 400"
      preserveAspectRatio="none"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    >
      <defs>
        <linearGradient id="comfort-arc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--pink))" />
          <stop offset="25%" stopColor="hsl(var(--lavender))" />
          <stop offset="50%" stopColor="hsl(var(--sky))" />
          <stop offset="75%" stopColor="hsl(var(--mint))" />
          <stop offset="100%" stopColor="hsl(var(--sunny))" />
        </linearGradient>
        <filter id="comfort-blur">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>

      {[0, 34, 68].map((offset, i) => (
        <path
          key={offset}
          d={`M -100 ${360 + offset} Q 600 ${40 + offset} 1300 ${360 + offset}`}
          fill="none"
          stroke="url(#comfort-arc)"
          strokeWidth={26 - i * 6}
          strokeLinecap="round"
          filter="url(#comfort-blur)"
          opacity={0.5 - i * 0.13}
        />
      ))}
    </svg>
  );
}
