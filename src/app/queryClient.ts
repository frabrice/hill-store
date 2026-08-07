import { QueryClient } from '@tanstack/react-query';

/**
 * Its own module (not inline in Providers.tsx) so `catalog.service.ts` can
 * import the same instance and invalidate queries after a write — the mock
 * store mutates outside React, TanStack Query needs telling.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
