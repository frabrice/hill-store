/**
 * Service registry — the single import point for data access.
 *
 * Now backed by real Supabase (`catalog.service.supabase.ts`). The mock
 * (`catalog.service.ts`'s `MockCatalogService`) is kept in place, unused —
 * both satisfy the exact same `CatalogService` interface, so switching this
 * one export line is the entire swap. Components import from
 * '@/lib/services', never from '@/data' or '@/lib/supabase' directly.
 */
export { catalogService } from './catalog.service.supabase';
export type { CatalogService } from './catalog.service';
export { imageUrl, imageBlurUrl } from './media';
export * from './types';
