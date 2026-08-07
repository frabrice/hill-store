import { useEffect, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useUI } from '@/store/ui';
import { applyAccent } from '@/lib/theme';
import { AuthProvider } from '@/lib/supabase/auth';
import { queryClient } from './queryClient';

/**
 * Keeps the DOM in sync with theme state: the night-feed attribute and the
 * active category accent both live as CSS variables on <html>, so every
 * component picks them up without prop drilling.
 */
function ThemeSync() {
  const theme = useUI((s) => s.theme);
  const accent = useUI((s) => s.accent);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    applyAccent(accent, theme);
  }, [accent, theme]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeSync />
        {children}
      </AuthProvider>
      <Toaster
        // Top-centre keeps toasts clear of the cart drawer on the right and the
        // mobile bottom nav.
        position="top-center"
        toastOptions={{
          className: 'rounded-2xl',
          style: {
            background: 'hsl(var(--surface))',
            color: 'hsl(var(--ink))',
            border: '1px solid hsl(var(--hairline))',
          },
        }}
      />
    </QueryClientProvider>
  );
}
