import type { ColorKey } from '@/lib/services/types';

/**
 * Category accent theming.
 *
 * Each category owns one brand pastel. Entering a category re-points the
 * --accent variables, so hovers, chips, glows, focus rings and page
 * transitions all shift together. This is what makes the colour feel
 * systematic rather than decorative.
 *
 * `surface` is the pastel itself (backgrounds only).
 * `ink` is a darkened version that clears 4.5:1 on the page ground — the only
 * value ever allowed to carry text.
 */
interface AccentPair {
  surface: string;
  soft: string;
  ink: string;
  nightSurface: string;
  nightSoft: string;
  nightInk: string;
}

export const ACCENTS: Record<ColorKey, AccentPair> = {
  pink: {
    surface: '338 92% 68%',
    soft: '338 100% 93%',
    ink: '336 88% 46%',
    nightSurface: '338 62% 62%',
    nightSoft: '338 30% 26%',
    nightInk: '338 80% 78%',
  },
  mint: {
    surface: '166 78% 46%',
    soft: '166 72% 89%',
    ink: '170 88% 26%',
    nightSurface: '166 52% 48%',
    nightSoft: '166 28% 22%',
    nightInk: '166 65% 70%',
  },
  sky: {
    surface: '202 95% 60%',
    soft: '202 100% 91%',
    ink: '208 92% 36%',
    nightSurface: '202 60% 58%',
    nightSoft: '202 30% 24%',
    nightInk: '202 75% 76%',
  },
  sunny: {
    surface: '44 100% 57%',
    soft: '45 100% 87%',
    ink: '33 96% 33%',
    nightSurface: '44 70% 58%',
    nightSoft: '44 28% 24%',
    nightInk: '44 85% 74%',
  },
  lavender: {
    surface: '266 85% 70%',
    soft: '266 100% 94%',
    ink: '265 72% 47%',
    nightSurface: '266 55% 66%',
    nightSoft: '266 28% 26%',
    nightInk: '266 75% 80%',
  },
  coral: {
    surface: '14 88% 64%',
    soft: '14 100% 92%',
    ink: '10 78% 42%',
    nightSurface: '14 60% 60%',
    nightSoft: '14 30% 24%',
    nightInk: '14 80% 76%',
  },
  teal: {
    surface: '184 72% 42%',
    soft: '184 65% 88%',
    ink: '186 82% 24%',
    nightSurface: '184 50% 46%',
    nightSoft: '184 28% 20%',
    nightInk: '184 65% 68%',
  },
  indigo: {
    surface: '230 82% 68%',
    soft: '230 100% 93%',
    ink: '231 70% 46%',
    nightSurface: '230 55% 62%',
    nightSoft: '230 30% 26%',
    nightInk: '230 80% 80%',
  },
  orchid: {
    surface: '300 70% 66%',
    soft: '300 80% 93%',
    ink: '300 60% 40%',
    nightSurface: '300 45% 60%',
    nightSoft: '300 28% 26%',
    nightInk: '300 70% 78%',
  },
  moss: {
    surface: '95 55% 40%',
    soft: '95 50% 88%',
    ink: '95 65% 24%',
    nightSurface: '95 40% 44%',
    nightSoft: '95 25% 20%',
    nightInk: '95 55% 62%',
  },
};

/** Every category colour, in the order they're picked in admin colour
 * selects — `Object.keys(ACCENTS)` would work too, but an explicit list
 * keeps the display order stable regardless of object key ordering. */
export const COLOR_KEYS: ColorKey[] = [
  'pink', 'mint', 'sky', 'sunny', 'lavender', 'coral', 'teal', 'indigo', 'orchid', 'moss',
];

export type ThemeMode = 'day' | 'night';

/** Point the CSS accent variables at a category colour. */
export function applyAccent(color: ColorKey, mode: ThemeMode) {
  const accent = ACCENTS[color];
  const root = document.documentElement;
  root.style.setProperty(
    '--accent',
    mode === 'night' ? accent.nightSurface : accent.surface,
  );
  root.style.setProperty(
    '--accent-soft',
    mode === 'night' ? accent.nightSoft : accent.soft,
  );
  root.style.setProperty(
    '--accent-ink',
    mode === 'night' ? accent.nightInk : accent.ink,
  );
}

/** Tailwind-friendly class fragments, for when a static colour is wanted. */
export const COLOR_CLASS: Record<ColorKey, { bg: string; text: string; ring: string }> = {
  pink: { bg: 'bg-pink', text: 'text-pink-deep', ring: 'ring-pink' },
  mint: { bg: 'bg-mint', text: 'text-mint', ring: 'ring-mint' },
  sky: { bg: 'bg-sky', text: 'text-sky', ring: 'ring-sky' },
  sunny: { bg: 'bg-sunny', text: 'text-sunny', ring: 'ring-sunny' },
  lavender: { bg: 'bg-lavender', text: 'text-lavender', ring: 'ring-lavender' },
  coral: { bg: 'bg-coral', text: 'text-coral-deep', ring: 'ring-coral' },
  teal: { bg: 'bg-teal', text: 'text-teal', ring: 'ring-teal' },
  indigo: { bg: 'bg-indigo', text: 'text-indigo', ring: 'ring-indigo' },
  orchid: { bg: 'bg-orchid', text: 'text-orchid-deep', ring: 'ring-orchid' },
  moss: { bg: 'bg-moss', text: 'text-moss', ring: 'ring-moss' },
};
