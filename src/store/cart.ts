import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorKey, ColorOption, Product, ProductVariant } from '@/lib/services/types';

/**
 * Cart lines carry a snapshot of the product at the moment it was added.
 * That keeps the drawer instant (no async lookups on open) and means a price
 * change mid-session cannot silently alter what someone thought they were
 * buying. The backend will re-price authoritatively at checkout.
 */
export interface CartItem {
  key: string;
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  variantLabel: string | null;
  priceRwf: number;
  colorKey: ColorKey;
  image: string | null;
  art: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (
    product: Product,
    colorKey: ColorKey,
    variant?: ProductVariant | null,
    qty?: number,
    color?: ColorOption | null,
  ) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

const lineKey = (productId: string, variantId: string | null, colorId: string | null) =>
  `${productId}::${variantId ?? 'default'}::${colorId ?? 'default'}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add: (product, colorKey, variant = null, qty = 1, color = null) =>
        set((state) => {
          const key = lineKey(product.id, variant?.id ?? null, color?.id ?? null);
          const existing = state.items.find((i) => i.key === key);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: i.quantity + qty } : i,
              ),
            };
          }

          // A picked colour and a picked size are two separate axes on the
          // product, but the cart only has room for one label per line —
          // combine them rather than dropping one silently.
          const variantLabel =
            [color?.label, variant?.label].filter(Boolean).join(' · ') || null;

          return {
            items: [
              ...state.items,
              {
                key,
                productId: product.id,
                variantId: variant?.id ?? null,
                name: product.name,
                slug: product.slug,
                variantLabel,
                priceRwf: product.priceRwf + (variant?.priceDelta ?? 0),
                colorKey,
                image: product.images[0] ?? null,
                art: product.art,
                quantity: qty,
              },
            ],
          };
        }),

      remove: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      setQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: 'ibibondo-cart' },
  ),
);

/* Selectors — kept out of the store so they never trigger extra renders. */
export const selectCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.quantity, 0);

export const selectSubtotal = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.priceRwf * i.quantity, 0);
