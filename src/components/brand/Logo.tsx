import { cn } from '@/lib/utils';

/**
 * The Hill Store wordmark, rebuilt in type rather than shipped as a PNG so
 * it stays crisp at any size and re-colours with the theme.
 *
 * A single ink colour, matching the client's own logo artwork — now that
 * the range covers the whole home rather than just babies, the multi-colour
 * per-letter cycle this used to run no longer fits the brand.
 *
 * NOTE: when the client supplies a designed logo asset, drop it in
 * public/brand/ and swap this out for an <img>.
 */

interface LogoProps {
  className?: string;
  /** Show the "COMFORT & CARE" lockup beneath the wordmark. */
  withTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { word: 'text-2xl', tag: 'text-[0.5rem] tracking-[0.25em]' },
  md: { word: 'text-3xl', tag: 'text-[0.6rem] tracking-[0.3em]' },
  lg: { word: 'text-5xl sm:text-6xl', tag: 'text-xs tracking-[0.35em]' },
};

export function Logo({ className, withTagline = false, size = 'md' }: LogoProps) {
  const s = SIZES[size];

  return (
    <span className={cn('inline-flex flex-col items-center leading-none text-ink', className)}>
      <span className={cn('font-display font-bold', s.word)}>Hill Store</span>

      {withTagline && (
        <span className={cn('mt-1 font-semibold uppercase text-ink-soft', s.tag)}>
          Comfort &amp; Care
        </span>
      )}
    </span>
  );
}
