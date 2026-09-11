import { useState } from 'react';

/**
 * The hero picture.
 *
 * Falls back to an illustrated baby if the client's photo/badge asset ever
 * fails to load — it matches the logo's own character, cannot go out of
 * date or clash with the palette, and carries no licensing question.
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

export function HeroScene() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg">
      {/* The client's brand badge, shown exactly as supplied — no background,
          shadow or overlays added. Falls back to the illustration if it ever
          fails to load, so the hero is never an empty box. */}
      {failed ? (
        <Baby />
      ) : (
        <img
          src="/brand/hero-baby-700.webp"
          srcSet="/brand/hero-baby-700.webp 700w, /brand/hero-baby-1100.webp 1100w"
          sizes="(max-width: 1024px) 80vw, 32rem"
          width={1100}
          height={1100}
          alt="Hill Store — dining items and baby essentials, everything for a happier home"
          fetchPriority="high"
          decoding="async"
          onError={() => setFailed(true)}
          className="mx-auto h-full w-full object-contain"
        />
      )}
    </div>
  );
}
