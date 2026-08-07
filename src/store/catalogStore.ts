import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  articles as seedArticles,
  categories as seedCategories,
  deliveryZones as seedDeliveryZones,
  kits as seedKits,
  products as seedProducts,
} from '@/data/catalog';
import { orders as seedOrders } from '@/data/orders';
import { policies as seedPolicies } from '@/data/policies';
import type {
  Article,
  Category,
  DeliveryZone,
  Kit,
  Order,
  Policy,
  Product,
  StoreSettings,
} from '@/lib/services/types';

export const defaultSettings: StoreSettings = {
  storeName: 'Ibibondo',
  tagline: 'Comfort & Care for babies in Kigali',
  contactEmail: 'hello@ibibondo.rw',
  contactPhone: '+250 788 748 921',
  whatsappNumber: '250788748921',
  freeDeliveryThresholdRwf: 50000,
  facebookUrl: 'https://facebook.com/ibibondo',
  instagramUrl: 'https://instagram.com/ibibondo',
  tiktokUrl: 'https://tiktok.com/@ibibondo',
  twitterUrl: '',
};

/**
 * The mutable backing store for the whole catalogue — the one place data
 * actually lives once the admin dashboard can write. `catalog.service.ts`
 * reads and writes through this instead of the static arrays in
 * `data/catalog.ts`, so an edit made in admin is visible on the storefront
 * immediately, and survives a reload via `persist` (same pattern as
 * `store/cart.ts`). When Supabase lands, this store — not the service
 * interface above it — is what gets replaced.
 */
interface CatalogStoreState {
  products: Product[];
  categories: Category[];
  kits: Kit[];
  articles: Article[];
  deliveryZones: DeliveryZone[];
  orders: Order[];
  policies: Policy[];
  settings: StoreSettings;
  setProducts: (updater: (products: Product[]) => Product[]) => void;
  setCategories: (updater: (categories: Category[]) => Category[]) => void;
  setKits: (updater: (kits: Kit[]) => Kit[]) => void;
  setArticles: (updater: (articles: Article[]) => Article[]) => void;
  setDeliveryZones: (updater: (zones: DeliveryZone[]) => DeliveryZone[]) => void;
  setOrders: (updater: (orders: Order[]) => Order[]) => void;
  setPolicies: (updater: (policies: Policy[]) => Policy[]) => void;
  setSettings: (updater: (settings: StoreSettings) => StoreSettings) => void;
}

export const useCatalogStore = create<CatalogStoreState>()(
  persist(
    (set) => ({
      products: seedProducts,
      categories: seedCategories,
      kits: seedKits,
      articles: seedArticles,
      deliveryZones: seedDeliveryZones,
      orders: seedOrders,
      policies: seedPolicies,
      settings: defaultSettings,

      setProducts: (updater) => set((s) => ({ products: updater(s.products) })),
      setCategories: (updater) => set((s) => ({ categories: updater(s.categories) })),
      setKits: (updater) => set((s) => ({ kits: updater(s.kits) })),
      setArticles: (updater) => set((s) => ({ articles: updater(s.articles) })),
      setDeliveryZones: (updater) => set((s) => ({ deliveryZones: updater(s.deliveryZones) })),
      setOrders: (updater) => set((s) => ({ orders: updater(s.orders) })),
      setPolicies: (updater) => set((s) => ({ policies: updater(s.policies) })),
      setSettings: (updater) => set((s) => ({ settings: updater(s.settings) })),
    }),
    {
      name: 'ibibondo-catalog',
      // The default merge is shallow at the top level only — fine for the
      // array fields (a whole array is always replaced together), but
      // `settings` is a single nested object, so a persisted store saved
      // before a field was added to `StoreSettings` would otherwise lose
      // that field forever. Merge `settings` one level deeper so new
      // fields keep picking up their default until a real save overwrites
      // them.
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<CatalogStoreState> | undefined;
        return {
          ...current,
          ...persistedState,
          settings: { ...current.settings, ...persistedState?.settings },
        };
      },
    },
  ),
);
