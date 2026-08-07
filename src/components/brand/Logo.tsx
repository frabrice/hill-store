import { cn } from '@/lib/utils';

/**
 * The Ibibondo wordmark, rebuilt in type rather than shipped as a PNG so it
 * stays crisp at any size and re-colours with the theme.
 *
 * Letter colours follow the supplied logo: the multi-colour rhythm is the
 * brand's most recognisable feature.
 *
 * NOTE: when the client supplies the original logo asset, drop it in
 * public/brand/ and swap the badge variant to use it.
 */

const LETTERS: { char: string; className: string }[] = [
  { char: 'I', className: 'text-pink-deep' },
  { char: 'b', className: 'text-sky' },
  { char: 'i', className: 'text-pink' },
  { char: 'b', className: 'text-lavender' },
  { char: 'o', className: 'text-mint' },
  { char: 'n', className: 'text-pink-deep' },
  { char: 'd', className: 'text-sky' },
  { char: 'o', className: 'text-sunny' },
];

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
    <span className={cn('inline-flex flex-col items-center leading-none', className)}>
      <span
        className={cn('font-display font-bold', s.word)}
        // The wordmark is decorative type; give assistive tech the plain name.
        aria-label="Ibibondo"
        role="img"
      >
        {LETTERS.map((l, i) => (
          <span key={i} aria-hidden className={l.className}>
            {l.char}
          </span>
        ))}
      </span>

      {withTagline && (
        <span className={cn('mt-1 font-semibold uppercase text-ink-soft', s.tag)}>
          Comfort &amp; Care
        </span>
      )}
    </span>
  );
}
