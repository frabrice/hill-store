import { cn } from '@/lib/utils';

/**
 * The Hill Store wordmark, rebuilt in type rather than shipped as a PNG so
 * it stays crisp at any size and re-colours with the theme.
 *
 * Letter colours cycle through the same six brand hues the homepage
 * headline's colour-cycle uses (`ColorfulText` in `pages/Home.tsx`) — the
 * multi-colour rhythm is the brand's most recognisable feature, so both
 * places draw from the identical palette. The space between the two words
 * is skipped and doesn't consume a turn in the cycle, same technique.
 *
 * NOTE: when the client supplies a designed logo asset, drop it in
 * public/brand/ and swap this out for an <img>.
 */

const LETTER_COLORS = ['text-pink-deep', 'text-sky', 'text-pink', 'text-lavender', 'text-mint', 'text-sunny'];

const LETTERS: { char: string; className: string | null }[] = (() => {
  let turn = 0;
  return [...'Hill Store'].map((char) => {
    if (char === ' ') return { char, className: null };
    const className = LETTER_COLORS[turn % LETTER_COLORS.length];
    turn++;
    return { char, className };
  });
})();

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
        aria-label="Hill Store"
        role="img"
      >
        {LETTERS.map((l, i) => (
          <span key={i} aria-hidden className={l.className ?? undefined}>
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
