/**
 * Money is always whole Rwandan francs. Never a float, never a decimal —
 * RWF has no minor unit, so "12,500 RWF" is the only correct rendering.
 */
export function rwf(amount: number): string {
  return new Intl.NumberFormat('en-RW', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/** With the unit, for prices shown on their own. */
export function rwfFull(amount: number): string {
  return `${rwf(amount)} RWF`;
}

export function discountPercent(price: number, compareAt: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
