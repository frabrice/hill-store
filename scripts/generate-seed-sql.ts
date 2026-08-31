/**
 * One-off generator: reads the existing mock data (src/data/*.ts) and prints
 * SQL INSERT statements matching supabase/migrations/0001_schema.sql exactly
 * — same ids/slugs as the mock data, so every cross-reference (kit ->
 * products, order line -> product) just works.
 *
 * Run once with: npx tsx scripts/generate-seed-sql.ts > supabase/migrations/0002_seed.sql
 * Not part of the app build — never imported from src/.
 */
import {
  articles,
  categories,
  deliveryZones,
  kits,
  products,
  stages,
} from '../src/data/catalog';
import { orders } from '../src/data/orders';
import { policies } from '../src/data/policies';

// Duplicated from store/catalogStore.ts rather than imported — that module
// constructs a live zustand+persist store as a side effect (touches
// `localStorage`), which doesn't exist in this plain Node script.
const defaultSettings = {
  storeName: 'Hill Store',
  tagline: 'Comfort & Care for babies in Kigali',
  contactEmail: 'hello@hillstore.rw',
  contactPhone: '+250 788 748 921',
  whatsappNumber: '250788748921',
  freeDeliveryThresholdRwf: 50000,
  facebookUrl: 'https://facebook.com/hillstore',
  instagramUrl: 'https://instagram.com/hillstore',
  tiktokUrl: 'https://tiktok.com/@hillstore',
  twitterUrl: '',
};

function str(v: string | null | undefined): string {
  if (v === null || v === undefined) return 'null';
  return `'${v.replace(/'/g, "''")}'`;
}

function num(v: number | null | undefined): string {
  if (v === null || v === undefined) return 'null';
  return String(v);
}

function bool(v: boolean): string {
  return v ? 'true' : 'false';
}

function textArray(arr: string[]): string {
  if (arr.length === 0) return "'{}'::text[]";
  return `ARRAY[${arr.map((s) => str(s)).join(', ')}]::text[]`;
}

function jsonb(value: unknown): string {
  return `${str(JSON.stringify(value))}::jsonb`;
}

function insertBlock(table: string, columns: string[], rows: string[][]): string {
  if (rows.length === 0) return '';
  const values = rows.map((r) => `  (${r.join(', ')})`).join(',\n');
  return `insert into public.${table} (${columns.join(', ')}) values\n${values};\n`;
}

const out: string[] = [
  '-- ============================================================================',
  '-- Hill Store — seed data',
  '--',
  '-- Generated from src/data/catalog.ts, src/data/orders.ts and',
  '-- src/data/policies.ts by scripts/generate-seed-sql.ts. Run this in the SQL',
  '-- Editor immediately after 0001_schema.sql — it depends on those tables.',
  '-- ============================================================================',
  '',
];

// -------------------------------------------------------------- categories
out.push(
  insertBlock(
    'categories',
    ['id', 'slug', 'name', 'tagline', 'color_key', 'icon', 'sort_order', 'subcategories'],
    categories.map((c) => [
      str(c.id),
      str(c.slug),
      str(c.name),
      str(c.tagline),
      str(c.colorKey),
      str(c.icon),
      num(c.sortOrder),
      jsonb(c.subcategories),
    ]),
  ),
);

// ------------------------------------------------------------------ stages
out.push(
  insertBlock(
    'stages',
    ['id', 'slug', 'label', 'short_label', 'description', 'sort_order'],
    stages.map((s) => [
      str(s.id),
      str(s.slug),
      str(s.label),
      str(s.shortLabel),
      str(s.description),
      num(s.sortOrder),
    ]),
  ),
);

// ---------------------------------------------------------------- products
out.push(
  insertBlock(
    'products',
    [
      'id', 'slug', 'name', 'subtitle', 'description', 'category_slug',
      'subcategory_slug', 'brand', 'price_rwf', 'compare_at_rwf', 'images',
      'art', 'stage_slugs', 'tags', 'rating', 'review_count', 'stock',
      'is_featured', 'is_bestseller', 'care_notes', 'variants',
      'color_options', 'length_cm', 'width_cm', 'height_cm', 'weight_kg',
      'created_at',
    ],
    products.map((p) => [
      str(p.id),
      str(p.slug),
      str(p.name),
      str(p.subtitle),
      str(p.description),
      str(p.categorySlug),
      str(p.subcategorySlug),
      str(p.brand),
      num(p.priceRwf),
      num(p.compareAtRwf),
      textArray(p.images),
      str(p.art),
      textArray(p.stageSlugs),
      textArray(p.tags),
      num(p.rating),
      num(p.reviewCount),
      num(p.stock),
      bool(p.isFeatured),
      bool(p.isBestseller),
      textArray(p.careNotes),
      jsonb(p.variants),
      jsonb(p.colorOptions),
      num(p.dimensions.lengthCm),
      num(p.dimensions.widthCm),
      num(p.dimensions.heightCm),
      num(p.dimensions.weightKg),
      str(p.createdAt),
    ]),
  ),
);

// -------------------------------------------------------------------- kits
out.push(
  insertBlock(
    'kits',
    ['id', 'slug', 'name', 'description', 'product_ids', 'price_rwf', 'color_key', 'icon'],
    kits.map((k) => [
      str(k.id),
      str(k.slug),
      str(k.name),
      str(k.description),
      textArray(k.productIds),
      num(k.priceRwf),
      str(k.colorKey),
      str(k.icon),
    ]),
  ),
);

// ---------------------------------------------------------------- articles
out.push(
  insertBlock(
    'articles',
    ['id', 'slug', 'title', 'excerpt', 'body', 'topic', 'read_minutes', 'author', 'published_at', 'color_key'],
    articles.map((a) => [
      str(a.id),
      str(a.slug),
      str(a.title),
      str(a.excerpt),
      str(a.body),
      str(a.topic),
      num(a.readMinutes),
      str(a.author),
      str(a.publishedAt),
      str(a.colorKey),
    ]),
  ),
);

// ---------------------------------------------------------------- policies
out.push(
  insertBlock(
    'policies',
    ['key', 'title', 'updated', 'body'],
    policies.map((p) => [str(p.key), str(p.title), str(p.updated), str(p.body)]),
  ),
);

// --------------------------------------------------------------- delivery_zones
out.push(
  insertBlock(
    'delivery_zones',
    ['id', 'name', 'fee_rwf', 'eta_hours'],
    deliveryZones.map((z) => [str(z.id), str(z.name), num(z.feeRwf), str(z.etaHours)]),
  ),
);

// -------------------------------------------------------------- store_settings
out.push(
  insertBlock(
    'store_settings',
    [
      'id', 'store_name', 'tagline', 'contact_email', 'contact_phone',
      'whatsapp_number', 'free_delivery_threshold_rwf', 'facebook_url',
      'instagram_url', 'tiktok_url', 'twitter_url',
    ],
    [[
      '1',
      str(defaultSettings.storeName),
      str(defaultSettings.tagline),
      str(defaultSettings.contactEmail),
      str(defaultSettings.contactPhone),
      str(defaultSettings.whatsappNumber),
      num(defaultSettings.freeDeliveryThresholdRwf),
      str(defaultSettings.facebookUrl),
      str(defaultSettings.instagramUrl),
      str(defaultSettings.tiktokUrl),
      str(defaultSettings.twitterUrl),
    ]],
  ),
);

// ----------------------------------------------------------------- orders
// Demo order history — clearly not real transactions. user_id is left null
// throughout since no real shopper accounts exist yet.
out.push(
  insertBlock(
    'orders',
    [
      'id', 'reference', 'status', 'lines', 'subtotal_rwf', 'delivery_rwf',
      'total_rwf', 'customer_name', 'customer_phone', 'address',
      'delivery_zone_id', 'delivery_zone_name', 'payment_method', 'created_at',
    ],
    orders.map((o) => [
      str(o.id),
      str(o.reference),
      str(o.status),
      jsonb(o.lines),
      num(o.subtotalRwf),
      num(o.deliveryRwf),
      num(o.totalRwf),
      str(o.customerName),
      str(o.customerPhone),
      str(o.address),
      str(o.deliveryZoneId),
      str(o.deliveryZoneName),
      str(o.paymentMethod),
      str(o.createdAt),
    ]),
  ),
);

console.log(out.filter(Boolean).join('\n'));
