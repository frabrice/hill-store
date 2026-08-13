import { supabase } from '@/lib/supabase/client';
import { queryClient } from '@/app/queryClient';
import type { CatalogService } from './catalog.service';
import type {
  Article,
  Category,
  ColorKey,
  ColorOption,
  DeliveryZone,
  Kit,
  Order,
  OrderStatus,
  Paged,
  PaymentMethod,
  Policy,
  Product,
  ProductDimensions,
  ProductQuery,
  ProductVariant,
  Stage,
  StoreSettings,
  Subcategory,
} from './types';

/**
 * The real backend. Same `CatalogService` contract as the mock — every read
 * hits Postgres through PostgREST (via `supabase-js`), every write goes
 * through Row Level Security (see supabase/migrations). Snake_case columns
 * become camelCase here and nowhere else, per the convention documented in
 * `types.ts`.
 */

/* ------------------------------------------------------------------ rows */
// Shapes exactly as they come back from Postgres — see
// supabase/migrations/0001_schema.sql for the source of truth.

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  color_key: string;
  icon: string;
  image: string | null;
  sort_order: number;
  subcategories: Subcategory[];
}

interface StageRow {
  id: string;
  slug: string;
  label: string;
  short_label: string;
  description: string;
  sort_order: number;
}

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  category_slug: string;
  subcategory_slug: string | null;
  brand: string;
  price_rwf: number;
  compare_at_rwf: number | null;
  images: string[];
  art: string;
  stage_slugs: string[];
  tags: string[];
  rating: number;
  review_count: number;
  stock: number;
  is_featured: boolean;
  is_bestseller: boolean;
  care_notes: string[];
  variants: ProductVariant[];
  color_options: ColorOption[];
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  created_at: string;
}

interface KitRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  product_ids: string[];
  price_rwf: number;
  color_key: string;
  icon: string;
}

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  topic: string;
  read_minutes: number;
  author: string;
  published_at: string;
  color_key: string;
}

interface PolicyRow {
  key: string;
  title: string;
  updated: string;
  body: string;
}

interface DeliveryZoneRow {
  id: string;
  name: string;
  fee_rwf: number;
  eta_hours: string;
}

interface StoreSettingsRow {
  id: number;
  store_name: string;
  tagline: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  free_delivery_threshold_rwf: number;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  twitter_url: string;
  momo_code: string;
  cod_commitment_fee_rwf: number;
  cod_minimum_order_rwf: number;
}

interface OrderRow {
  id: string;
  reference: string;
  status: string;
  lines: Order['lines'];
  subtotal_rwf: number;
  delivery_rwf: number;
  total_rwf: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string;
  delivery_zone_id: string;
  delivery_zone_name: string;
  payment_method: string;
  payer_name: string | null;
  paid_amount_rwf: number | null;
  created_at: string;
}

/* --------------------------------------------------------------- mappers */

const toCategory = (r: CategoryRow): Category => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  tagline: r.tagline,
  colorKey: r.color_key as ColorKey,
  icon: r.icon,
  image: r.image,
  sortOrder: r.sort_order,
  subcategories: r.subcategories,
});

const toStage = (r: StageRow): Stage => ({
  id: r.id,
  slug: r.slug,
  label: r.label,
  shortLabel: r.short_label,
  description: r.description,
  sortOrder: r.sort_order,
});

const toProduct = (r: ProductRow): Product => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  subtitle: r.subtitle,
  description: r.description,
  categorySlug: r.category_slug,
  subcategorySlug: r.subcategory_slug,
  brand: r.brand,
  priceRwf: r.price_rwf,
  compareAtRwf: r.compare_at_rwf,
  images: r.images,
  art: r.art,
  stageSlugs: r.stage_slugs,
  tags: r.tags,
  rating: r.rating,
  reviewCount: r.review_count,
  stock: r.stock,
  isFeatured: r.is_featured,
  isBestseller: r.is_bestseller,
  careNotes: r.care_notes,
  variants: r.variants,
  colorOptions: r.color_options,
  dimensions: {
    lengthCm: r.length_cm,
    widthCm: r.width_cm,
    heightCm: r.height_cm,
    weightKg: r.weight_kg,
  },
  createdAt: r.created_at,
});

const toKit = (r: KitRow): Kit => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  description: r.description,
  productIds: r.product_ids,
  priceRwf: r.price_rwf,
  colorKey: r.color_key as ColorKey,
  icon: r.icon,
});

const toArticle = (r: ArticleRow): Article => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt,
  body: r.body,
  topic: r.topic,
  readMinutes: r.read_minutes,
  author: r.author,
  publishedAt: r.published_at,
  colorKey: r.color_key as ColorKey,
});

const toPolicy = (r: PolicyRow): Policy => ({
  key: r.key,
  title: r.title,
  updated: r.updated,
  body: r.body,
});

const toDeliveryZone = (r: DeliveryZoneRow): DeliveryZone => ({
  id: r.id,
  name: r.name,
  feeRwf: r.fee_rwf,
  etaHours: r.eta_hours,
});

const toSettings = (r: StoreSettingsRow): StoreSettings => ({
  storeName: r.store_name,
  tagline: r.tagline,
  contactEmail: r.contact_email,
  contactPhone: r.contact_phone,
  whatsappNumber: r.whatsapp_number,
  freeDeliveryThresholdRwf: r.free_delivery_threshold_rwf,
  facebookUrl: r.facebook_url,
  instagramUrl: r.instagram_url,
  tiktokUrl: r.tiktok_url,
  twitterUrl: r.twitter_url,
  momoCode: r.momo_code,
  codCommitmentFeeRwf: r.cod_commitment_fee_rwf,
  codMinimumOrderRwf: r.cod_minimum_order_rwf,
});

const toOrder = (r: OrderRow): Order => ({
  id: r.id,
  reference: r.reference,
  status: r.status as OrderStatus,
  lines: r.lines,
  subtotalRwf: r.subtotal_rwf,
  deliveryRwf: r.delivery_rwf,
  totalRwf: r.total_rwf,
  customerName: r.customer_name,
  customerPhone: r.customer_phone,
  customerEmail: r.customer_email,
  address: r.address,
  deliveryZoneId: r.delivery_zone_id,
  deliveryZoneName: r.delivery_zone_name,
  paymentMethod: r.payment_method as PaymentMethod,
  payerName: r.payer_name,
  paidAmountRwf: r.paid_amount_rwf,
  createdAt: r.created_at,
});

/* ------------------------------------------------------------------ misc */

function fail(action: string, error: { message: string } | null): never {
  throw new Error(`${action} failed: ${error?.message ?? 'no row returned'}`);
}

/** Every write mutates Postgres directly (no local cache to update), so the
 * query cache has to be told by hand — this is that one call, kept in one
 * place, matching the mock service's `settleWrite`. */
async function invalidate<T>(value: T): Promise<T> {
  await queryClient.invalidateQueries();
  return value;
}

function dimensionsToColumns(d: ProductDimensions) {
  return { length_cm: d.lengthCm, width_cm: d.widthCm, height_cm: d.heightCm, weight_kg: d.weightKg };
}

class SupabaseCatalogService implements CatalogService {
  /* --------------------------------------------------------------- reads */

  async listCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('sort_order');
    if (error) fail('List categories', error);
    return (data as CategoryRow[]).map(toCategory);
  }

  async getCategory(slug: string) {
    const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle();
    if (error) fail('Get category', error);
    return data ? toCategory(data as CategoryRow) : null;
  }

  async listStages() {
    const { data, error } = await supabase.from('stages').select('*').order('sort_order');
    if (error) fail('List stages', error);
    return (data as StageRow[]).map(toStage);
  }

  async listProducts(query: ProductQuery = {}) {
    let builder = supabase.from('products').select('*', { count: 'exact' });

    if (query.categorySlug) builder = builder.eq('category_slug', query.categorySlug);
    if (query.stageSlug) builder = builder.contains('stage_slugs', [query.stageSlug]);
    if (query.minPrice != null) builder = builder.gte('price_rwf', query.minPrice);
    if (query.maxPrice != null) builder = builder.lte('price_rwf', query.maxPrice);
    if (query.tags?.length) builder = builder.contains('tags', query.tags);
    if (query.search) {
      const needle = query.search.trim();
      builder = builder.or(
        `name.ilike.%${needle}%,subtitle.ilike.%${needle}%,brand.ilike.%${needle}%,category_slug.ilike.%${needle}%`,
      );
    }

    switch (query.sort) {
      case 'price-asc':
        builder = builder.order('price_rwf', { ascending: true });
        break;
      case 'price-desc':
        builder = builder.order('price_rwf', { ascending: false });
        break;
      case 'rating':
        builder = builder.order('rating', { ascending: false });
        break;
      case 'newest':
        builder = builder.order('created_at', { ascending: false });
        break;
      case 'featured':
      default:
        builder = builder.order('is_featured', { ascending: false }).order('rating', { ascending: false });
    }

    const offset = query.offset ?? 0;
    if (query.limit != null) builder = builder.range(offset, offset + query.limit - 1);

    const { data, count, error } = await builder;
    if (error) fail('List products', error);
    return { items: (data as ProductRow[]).map(toProduct), total: count ?? 0 } satisfies Paged<Product>;
  }

  async getProduct(slug: string) {
    const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
    if (error) fail('Get product', error);
    return data ? toProduct(data as ProductRow) : null;
  }

  async getProductsByIds(ids: string[]) {
    if (ids.length === 0) return [];
    const { data, error } = await supabase.from('products').select('*').in('id', ids);
    if (error) fail('Get products by ids', error);
    return (data as ProductRow[]).map(toProduct);
  }

  async listKits() {
    const { data, error } = await supabase.from('kits').select('*');
    if (error) fail('List kits', error);
    return (data as KitRow[]).map(toKit);
  }

  async listArticles() {
    const { data, error } = await supabase.from('articles').select('*').order('published_at', { ascending: false });
    if (error) fail('List articles', error);
    return (data as ArticleRow[]).map(toArticle);
  }

  async getArticle(slug: string) {
    const { data, error } = await supabase.from('articles').select('*').eq('slug', slug).maybeSingle();
    if (error) fail('Get article', error);
    return data ? toArticle(data as ArticleRow) : null;
  }

  async listDeliveryZones() {
    const { data, error } = await supabase.from('delivery_zones').select('*');
    if (error) fail('List delivery zones', error);
    return (data as DeliveryZoneRow[]).map(toDeliveryZone);
  }

  async listOrders() {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) fail('List orders', error);
    return (data as OrderRow[]).map(toOrder);
  }

  async getOrder(id: string) {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
    if (error) fail('Get order', error);
    return data ? toOrder(data as OrderRow) : null;
  }

  async listPolicies() {
    const { data, error } = await supabase.from('policies').select('*');
    if (error) fail('List policies', error);
    return (data as PolicyRow[]).map(toPolicy);
  }

  async getPolicy(key: string) {
    const { data, error } = await supabase.from('policies').select('*').eq('key', key).maybeSingle();
    if (error) fail('Get policy', error);
    return data ? toPolicy(data as PolicyRow) : null;
  }

  async getSettings() {
    const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).single();
    if (error) fail('Get settings', error);
    return toSettings(data as StoreSettingsRow);
  }

  /* -------------------------------------------------------------- writes */

  async createProduct(input: Omit<Product, 'id' | 'createdAt'>) {
    const row = {
      id: `p-${input.slug}`,
      slug: input.slug,
      name: input.name,
      subtitle: input.subtitle,
      description: input.description,
      category_slug: input.categorySlug,
      subcategory_slug: input.subcategorySlug,
      brand: input.brand,
      price_rwf: input.priceRwf,
      compare_at_rwf: input.compareAtRwf,
      images: input.images,
      art: input.art,
      stage_slugs: input.stageSlugs,
      tags: input.tags,
      rating: input.rating,
      review_count: input.reviewCount,
      stock: input.stock,
      is_featured: input.isFeatured,
      is_bestseller: input.isBestseller,
      care_notes: input.careNotes,
      variants: input.variants,
      color_options: input.colorOptions,
      ...dimensionsToColumns(input.dimensions),
    };
    const { data, error } = await supabase.from('products').insert(row).select().single();
    if (error) fail('Create product', error);
    return invalidate(toProduct(data as ProductRow));
  }

  async updateProduct(id: string, patch: Partial<Omit<Product, 'id'>>) {
    const row: Record<string, unknown> = {};
    if (patch.slug !== undefined) row.slug = patch.slug;
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.subtitle !== undefined) row.subtitle = patch.subtitle;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.categorySlug !== undefined) row.category_slug = patch.categorySlug;
    if (patch.subcategorySlug !== undefined) row.subcategory_slug = patch.subcategorySlug;
    if (patch.brand !== undefined) row.brand = patch.brand;
    if (patch.priceRwf !== undefined) row.price_rwf = patch.priceRwf;
    if (patch.compareAtRwf !== undefined) row.compare_at_rwf = patch.compareAtRwf;
    if (patch.images !== undefined) row.images = patch.images;
    if (patch.art !== undefined) row.art = patch.art;
    if (patch.stageSlugs !== undefined) row.stage_slugs = patch.stageSlugs;
    if (patch.tags !== undefined) row.tags = patch.tags;
    if (patch.rating !== undefined) row.rating = patch.rating;
    if (patch.reviewCount !== undefined) row.review_count = patch.reviewCount;
    if (patch.stock !== undefined) row.stock = patch.stock;
    if (patch.isFeatured !== undefined) row.is_featured = patch.isFeatured;
    if (patch.isBestseller !== undefined) row.is_bestseller = patch.isBestseller;
    if (patch.careNotes !== undefined) row.care_notes = patch.careNotes;
    if (patch.variants !== undefined) row.variants = patch.variants;
    if (patch.colorOptions !== undefined) row.color_options = patch.colorOptions;
    if (patch.dimensions !== undefined) Object.assign(row, dimensionsToColumns(patch.dimensions));

    const { data, error } = await supabase.from('products').update(row).eq('id', id).select().single();
    if (error) fail('Update product', error);
    return invalidate(toProduct(data as ProductRow));
  }

  async deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) fail('Delete product', error);
    await queryClient.invalidateQueries();
  }

  adjustStock(id: string, stock: number) {
    return this.updateProduct(id, { stock });
  }

  async createCategory(input: Omit<Category, 'id'>) {
    const row = {
      id: `c-${input.slug}`,
      slug: input.slug,
      name: input.name,
      tagline: input.tagline,
      color_key: input.colorKey,
      icon: input.icon,
      image: input.image ?? null,
      sort_order: input.sortOrder,
      subcategories: input.subcategories,
    };
    const { data, error } = await supabase.from('categories').insert(row).select().single();
    if (error) fail('Create category', error);
    return invalidate(toCategory(data as CategoryRow));
  }

  async updateCategory(id: string, patch: Partial<Omit<Category, 'id'>>) {
    const row: Record<string, unknown> = {};
    if (patch.slug !== undefined) row.slug = patch.slug;
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.tagline !== undefined) row.tagline = patch.tagline;
    if (patch.colorKey !== undefined) row.color_key = patch.colorKey;
    if (patch.icon !== undefined) row.icon = patch.icon;
    if (patch.image !== undefined) row.image = patch.image;
    if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder;
    if (patch.subcategories !== undefined) row.subcategories = patch.subcategories;

    const { data, error } = await supabase.from('categories').update(row).eq('id', id).select().single();
    if (error) fail('Update category', error);
    return invalidate(toCategory(data as CategoryRow));
  }

  async deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      // Postgres FK violation — products still reference this category's slug.
      if (error.code === '23503') {
        throw new Error('This category still has products in it — move or delete those first.');
      }
      fail('Delete category', error);
    }
    await queryClient.invalidateQueries();
  }

  async createKit(input: Omit<Kit, 'id'>) {
    const row = {
      id: `k-${input.slug}`,
      slug: input.slug,
      name: input.name,
      description: input.description,
      product_ids: input.productIds,
      price_rwf: input.priceRwf,
      color_key: input.colorKey,
      icon: input.icon,
    };
    const { data, error } = await supabase.from('kits').insert(row).select().single();
    if (error) fail('Create kit', error);
    return invalidate(toKit(data as KitRow));
  }

  async updateKit(id: string, patch: Partial<Omit<Kit, 'id'>>) {
    const row: Record<string, unknown> = {};
    if (patch.slug !== undefined) row.slug = patch.slug;
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.productIds !== undefined) row.product_ids = patch.productIds;
    if (patch.priceRwf !== undefined) row.price_rwf = patch.priceRwf;
    if (patch.colorKey !== undefined) row.color_key = patch.colorKey;
    if (patch.icon !== undefined) row.icon = patch.icon;

    const { data, error } = await supabase.from('kits').update(row).eq('id', id).select().single();
    if (error) fail('Update kit', error);
    return invalidate(toKit(data as KitRow));
  }

  async deleteKit(id: string) {
    const { error } = await supabase.from('kits').delete().eq('id', id);
    if (error) fail('Delete kit', error);
    await queryClient.invalidateQueries();
  }

  async createOrder(input: Omit<Order, 'id' | 'reference' | 'createdAt'>) {
    // Goes through the `create_order` RPC, not a direct table insert — see
    // supabase/migrations/0003_order_rpc.sql. That function creates the
    // order and decrements stock in one atomic transaction (avoiding a race
    // between two shoppers checking out the same low-stock item at once)
    // and generates the reference server-side.
    const { data, error } = await supabase.rpc('create_order', {
      p_status: input.status,
      p_lines: input.lines,
      p_subtotal_rwf: input.subtotalRwf,
      p_delivery_rwf: input.deliveryRwf,
      p_total_rwf: input.totalRwf,
      p_customer_name: input.customerName,
      p_customer_phone: input.customerPhone,
      p_address: input.address,
      p_delivery_zone_id: input.deliveryZoneId,
      p_delivery_zone_name: input.deliveryZoneName,
      p_payment_method: input.paymentMethod,
      p_customer_email: input.customerEmail,
      p_payer_name: input.payerName,
      p_paid_amount_rwf: input.paidAmountRwf,
    });
    if (error || !data) fail('Create order', error);
    return invalidate(toOrder(data as OrderRow));
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
    if (error) fail('Update order status', error);
    return invalidate(toOrder(data as OrderRow));
  }

  async createArticle(input: Omit<Article, 'id'>) {
    const row = {
      id: `a-${input.slug}`,
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      topic: input.topic,
      read_minutes: input.readMinutes,
      author: input.author,
      published_at: input.publishedAt,
      color_key: input.colorKey,
    };
    const { data, error } = await supabase.from('articles').insert(row).select().single();
    if (error) fail('Create article', error);
    return invalidate(toArticle(data as ArticleRow));
  }

  async updateArticle(id: string, patch: Partial<Omit<Article, 'id'>>) {
    const row: Record<string, unknown> = {};
    if (patch.slug !== undefined) row.slug = patch.slug;
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.excerpt !== undefined) row.excerpt = patch.excerpt;
    if (patch.body !== undefined) row.body = patch.body;
    if (patch.topic !== undefined) row.topic = patch.topic;
    if (patch.readMinutes !== undefined) row.read_minutes = patch.readMinutes;
    if (patch.author !== undefined) row.author = patch.author;
    if (patch.publishedAt !== undefined) row.published_at = patch.publishedAt;
    if (patch.colorKey !== undefined) row.color_key = patch.colorKey;

    const { data, error } = await supabase.from('articles').update(row).eq('id', id).select().single();
    if (error) fail('Update article', error);
    return invalidate(toArticle(data as ArticleRow));
  }

  async updateDeliveryZone(id: string, patch: Partial<Omit<DeliveryZone, 'id'>>) {
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.feeRwf !== undefined) row.fee_rwf = patch.feeRwf;
    if (patch.etaHours !== undefined) row.eta_hours = patch.etaHours;

    const { data, error } = await supabase.from('delivery_zones').update(row).eq('id', id).select().single();
    if (error) fail('Update delivery zone', error);
    return invalidate(toDeliveryZone(data as DeliveryZoneRow));
  }

  async updatePolicy(key: string, patch: Partial<Omit<Policy, 'key'>>) {
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.updated !== undefined) row.updated = patch.updated;
    if (patch.body !== undefined) row.body = patch.body;

    const { data, error } = await supabase.from('policies').update(row).eq('key', key).select().single();
    if (error) fail('Update policy', error);
    return invalidate(toPolicy(data as PolicyRow));
  }

  async updateSettings(patch: Partial<StoreSettings>) {
    const row: Record<string, unknown> = {};
    if (patch.storeName !== undefined) row.store_name = patch.storeName;
    if (patch.tagline !== undefined) row.tagline = patch.tagline;
    if (patch.contactEmail !== undefined) row.contact_email = patch.contactEmail;
    if (patch.contactPhone !== undefined) row.contact_phone = patch.contactPhone;
    if (patch.whatsappNumber !== undefined) row.whatsapp_number = patch.whatsappNumber;
    if (patch.freeDeliveryThresholdRwf !== undefined) row.free_delivery_threshold_rwf = patch.freeDeliveryThresholdRwf;
    if (patch.facebookUrl !== undefined) row.facebook_url = patch.facebookUrl;
    if (patch.instagramUrl !== undefined) row.instagram_url = patch.instagramUrl;
    if (patch.tiktokUrl !== undefined) row.tiktok_url = patch.tiktokUrl;
    if (patch.twitterUrl !== undefined) row.twitter_url = patch.twitterUrl;
    if (patch.momoCode !== undefined) row.momo_code = patch.momoCode;
    if (patch.codCommitmentFeeRwf !== undefined) row.cod_commitment_fee_rwf = patch.codCommitmentFeeRwf;
    if (patch.codMinimumOrderRwf !== undefined) row.cod_minimum_order_rwf = patch.codMinimumOrderRwf;

    const { data, error } = await supabase.from('store_settings').update(row).eq('id', 1).select().single();
    if (error) fail('Update settings', error);
    return invalidate(toSettings(data as StoreSettingsRow));
  }
}

export const catalogService: CatalogService = new SupabaseCatalogService();
