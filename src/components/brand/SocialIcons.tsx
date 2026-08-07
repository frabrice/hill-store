/**
 * Simple monochrome brand marks — lucide-react dropped its brand icon set,
 * so these are small hand-drawn stand-ins, same spirit as the custom
 * WhatsApp glyph in `WhatsAppButton.tsx`. `currentColor` throughout so they
 * pick up whatever text colour the link wrapper sets.
 */

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.5 9.87v-6.98H7.9V12h2.6V9.8c0-2.6 1.49-4 3.85-4 1.11 0 2.28.2 2.28.2v2.5h-1.29c-1.27 0-1.66.79-1.66 1.6V12h2.83l-.45 2.89h-2.38v6.98A10 10 0 0 0 22 12z" />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.09v12.4a2.59 2.59 0 1 1-2.6-2.6c.24 0 .48.03.71.1V9.66a5.9 5.9 0 0 0-.71-.04c-3.24 0-5.87 2.63-5.87 5.87s2.63 5.87 5.87 5.87 5.88-2.63 5.88-5.87V9.01a7.34 7.34 0 0 0 4.29 1.38V7.3s-1.87.09-3.24-1.48z" />
    </svg>
  );
}
