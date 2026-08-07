import { useSettings } from '@/hooks/useCatalog';

/** Matches the store's default until settings load — same number either way. */
const FALLBACK_WHATSAPP_NUMBER = '250788748921';

/**
 * Floating WhatsApp order button.
 *
 * In Kigali a large share of buyers would rather ask a question than fill a
 * form, so this sits above the fold of every page — but out of the way of the
 * mobile bottom nav.
 */
export function WhatsAppButton() {
  const { data: settings } = useSettings();
  const number = settings?.whatsappNumber ?? FALLBACK_WHATSAPP_NUMBER;
  const href = `https://wa.me/${number}?text=${encodeURIComponent(
    'Hello Ibibondo! I have a question about a product.',
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] shadow-plush-lg transition-transform duration-200 ease-plush hover:scale-105 active:scale-95 lg:bottom-6 lg:right-6"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white" aria-hidden>
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.15h-.01a8.2 8.2 0 01-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 01-1.25-4.38c0-4.54 3.7-8.23 8.23-8.23 2.2 0 4.26.86 5.82 2.41a8.18 8.18 0 012.41 5.82c0 4.54-3.69 8.24-8.24 8.24z" />
      </svg>
    </a>
  );
}
