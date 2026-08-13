/**
 * Domain types.
 *
 * These deliberately mirror the shape of the future Supabase tables (snake_case
 * columns become camelCase here at the service boundary, nowhere else). When the
 * backend lands, the mock implementations are replaced and nothing above this
 * layer changes.
 */

/** Which brand pastel a category owns. Drives the whole browsing theme. */
export type ColorKey =
  | 'pink'
  | 'mint'
  | 'sky'
  | 'sunny'
  | 'lavender'
  | 'coral'
  | 'teal'
  | 'indigo'
  | 'orchid'
  | 'moss';

/** A product type within a category — e.g. "Bodysuits" under Clothing. */
export interface Subcategory {
  slug: string;
  name: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  colorKey: ColorKey;
  /** lucide-react icon name, resolved in the UI layer. */
  icon: string;
  /** Cloudinary public_id of the photo representing this category, if one
   * has been uploaded. Falls back to a product photo or the icon when null. */
  image?: string | null;
  sortOrder: number;
  subcategories: Subcategory[];
}

/**
 * A baby's growth stage. Starts below newborn so preterm sizing has a natural
 * home rather than being bolted on.
 */
export interface Stage {
  id: string;
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  label: string;
  /** Added to the base price, in RWF. Usually 0. */
  priceDelta: number;
  stock: number;
  sku: string;
}

/**
 * Colour is its own axis, independent of `variants` (size/volume/age) — a
 * cardigan can come in three colours *and* four sizes at once. Most products
 * don't have this at all; only the ones where colour is a real choice do.
 */
export interface ColorOption {
  id: string;
  label: string;
  /** A real swatch colour, not a brand pastel — shown as a small circle. */
  hex: string;
  stock: number;
}

/** Physical size — drives which delivery tier a product needs, not just
 * shown for curiosity. See `deliveryMethodFor` in `lib/delivery.ts`. */
export interface ProductDimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  categorySlug: string;
  /** Slug of one of the category's `Subcategory` entries. Data-only for now
   * — not yet exposed as a filter, but ready for search/breadcrumbs/detail. */
  subcategorySlug: string | null;
  brand: string;
  /** Always RWF, always a whole number. Never store money as a float. */
  priceRwf: number;
  /** Was-price for showing a saving. Null when not on offer. */
  compareAtRwf: number | null;
  /** Cloudinary public IDs. Empty renders the illustrated placeholder. */
  images: string[];
  /** Illustration key used until real photography exists. See ProductArt. */
  art: string;
  stageSlugs: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  isFeatured: boolean;
  isBestseller: boolean;
  careNotes: string[];
  variants: ProductVariant[];
  /** Empty for the majority of products — only set where colour is a real,
   * separate purchase decision from size. */
  colorOptions: ColorOption[];
  dimensions: ProductDimensions;
  createdAt: string;
}

/** Curated bundle — "Coming-home kit", "NICU bag". A merchandising hook. */
export interface Kit {
  id: string;
  slug: string;
  name: string;
  description: string;
  productIds: string[];
  priceRwf: number;
  colorKey: ColorKey;
  icon: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  topic: string;
  readMinutes: number;
  author: string;
  publishedAt: string;
  colorKey: ColorKey;
}

/** A legal/policy page — always one of a fixed set (privacy, terms,
 * returns), so there's no create, only edit. `body` is paragraphs joined by
 * a blank line, same convention as `Article.body`. */
export interface Policy {
  key: string;
  title: string;
  updated: string;
  body: string;
}

/** Site-wide values a store owner would want to change without a deploy.
 * Deliberately small — this is not a general CMS, just the handful of
 * constants that used to be hardcoded in the storefront. */
export interface StoreSettings {
  storeName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  freeDeliveryThresholdRwf: number;
  /** Empty string means "not set" — the footer only shows an icon for a
   * platform once it has a real link. */
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  twitterUrl: string;
  /** USSD merchant shortcode shown at checkout for MoMo payments, e.g.
   * "*182*8*1*37306#". No gateway is wired up — this is dialled manually. */
  momoCode: string;
}

/* ---------------------------------------------------------------- queries */

export interface ProductQuery {
  categorySlug?: string;
  stageSlug?: string;
  search?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating';
  limit?: number;
  offset?: number;
}

export interface Paged<T> {
  items: T[];
  total: number;
}

/* ---------------------------------------------------------------- cart */

export interface CartLine {
  productId: string;
  variantId: string | null;
  quantity: number;
}

/* ------------------------------------------------- orders (backend phase) */

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface DeliveryZone {
  id: string;
  name: string;
  feeRwf: number;
  etaHours: string;
}

export type PaymentMethod = 'momo' | 'pay_on_delivery';

export interface Order {
  id: string;
  reference: string;
  status: OrderStatus;
  lines: CartLine[];
  subtotalRwf: number;
  deliveryRwf: number;
  totalRwf: number;
  customerName: string;
  customerPhone: string;
  /** Optional — a guest checkout may not give one. Powers order-confirmation
   * and status-update emails; a null here just means those don't fire. */
  customerEmail: string | null;
  address: string;
  deliveryZoneId: string;
  /** Denormalised alongside the id so a zone rename later doesn't rewrite
   * history — an order should always show the name it was placed against. */
  deliveryZoneName: string;
  paymentMethod: PaymentMethod;
  /** Self-reported by the customer for `momo` orders, null otherwise — there
   * is no payment gateway, so staff cross-check this against the real MoMo
   * merchant account before releasing the order. */
  payerName: string | null;
  paidAmountRwf: number | null;
  createdAt: string;
}
