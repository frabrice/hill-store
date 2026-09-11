import { useState } from 'react';
import { Logo } from './Logo';

/**
 * The hero picture — the client's brand badge, framed exactly like the
 * lifestyle photos on the other hero slides (rounded-3xl card, same motion
 * treatment) so the two styles read as one consistent slideshow. The card
 * frame itself is applied by the caller in `pages/Home.tsx`; this component
 * only owns the image.
 *
 * Falls back to the wordmark if the badge image ever fails to load, so the
 * hero is never an empty box.
 */
export function HeroScene() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="grid aspect-[16/9] w-full place-items-center bg-surface">
        <Logo size="lg" />
      </div>
    );
  }

  return (
    <img
      src="/brand/hero-baby-700.webp"
      srcSet="/brand/hero-baby-700.webp 700w, /brand/hero-baby-1100.webp 1100w"
      sizes="(max-width: 1024px) 100vw, 40rem"
      width={1200}
      height={675}
      alt="Hill Store Rwanda — everything your home needs"
      fetchPriority="high"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}
