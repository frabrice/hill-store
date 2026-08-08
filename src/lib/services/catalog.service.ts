import { stages } from '@/data/catalog';
import { useCatalogStore } from '@/store/catalogStore';
import { queryClient } from '@/app/queryClient';
import type {
  Article,
  Category,
  DeliveryZone,
  Kit,
  Order,
  OrderStatus,
  Paged,
  Policy,
  Product,
  ProductQuery,
  Stage,
  StoreSettings,
} from './types';

/**
 * The contract every consumer codes against.
 *
 * The Supabase implementation will satisfy this same interface, so pages,
 * hooks and components never learn where the data came from. Reads resolve
 * against whatever is currently in `catalogStore`; writes mutate that store
 * and invalidate the query cache so every screen watching that data — admin
 * and storefront alike — picks up the change without a manual refetch.
 */
export interface CatalogService {
  listCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | null>;
  listStages(): Promise<Stage[]>;
  listProducts(query?: ProductQuery): Promise<Paged<Product>>;
  getProduct(slug: string): Promise<Product | null>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  listKits(): Promise<Kit[]>;
  listArticles(): Promise<Article[]>;
  getArticle(slug: string): Promise<Article | null>;
  listDeliveryZones(): Promise<DeliveryZone[]>;
  listOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  listPolicies(): Promise<Policy[]>;
  getPolicy(key: string): Promise<Policy | null>;
  getSettings(): Promise<StoreSettings>;

  createProduct(input: Omit<Product, 'id' | 'createdAt'>): Promise<Product>;
  updateProduct(id: string, patch: Partial<Omit<Product, 'id'>>): Promise<Product>;
  adjustStock(id: string, stock: number): Promise<Product>;

  createCategory(input: Omit<Category, 'id'>): Promise<Category>;
  updateCategory(id: string, patch: Partial<Omit<Category, 'id'>>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  createKit(input: Omit<Kit, 'id'>): Promise<Kit>;
  updateKit(id: string, patch: Partial<Omit<Kit, 'id'>>): Promise<Kit>;

  createOrder(input: Omit<Order, 'id' | 'reference' | 'createdAt'>): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order>;

  createArticle(input: Omit<Article, 'id'>): Promise<Article>;
  updateArticle(id: string, patch: Partial<Omit<Article, 'id'>>): Promise<Article>;

  updateDeliveryZone(
    id: string,
    patch: Partial<Omit<DeliveryZone, 'id'>>,
  ): Promise<DeliveryZone>;

  updatePolicy(key: string, patch: Partial<Omit<Policy, 'key'>>): Promise<Policy>;
  updateSettings(patch: Partial<StoreSettings>): Promise<StoreSettings>;
}

/** Small delay so loading states are real rather than theoretical. */
const LATENCY_MS = 140;
const settle = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

/** Every write lands in `catalogStore` (outside React), so the query cache
 * has to be told by hand — this is that one call, kept in one place. */
async function settleWrite<T>(value: T): Promise<T> {
  const result = await settle(value);
  await queryClient.invalidateQueries();
  return result;
}

function matches(product: Product, q: ProductQuery): boolean {
  if (q.categorySlug && product.categorySlug !== q.categorySlug) return false;
  if (q.stageSlug && !product.stageSlugs.includes(q.stageSlug)) return false;
  if (q.minPrice != null && product.priceRwf < q.minPrice) return false;
  if (q.maxPrice != null && product.priceRwf > q.maxPrice) return false;
  if (q.tags?.length && !q.tags.every((t) => product.tags.includes(t))) return false;

  if (q.search) {
    const needle = q.search.toLowerCase().trim();
    const haystack = [
      product.name,
      product.subtitle,
      product.brand,
      product.categorySlug,
      ...product.tags,
    ]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(needle)) return false;
  }

  return true;
}

function sortProducts(list: Product[], sort: ProductQuery['sort']): Product[] {
  const sorted = [...list];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.priceRwf - b.priceRwf);
    case 'price-desc':
      return sorted.sort((a, b) => b.priceRwf - a.priceRwf);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'newest':
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'featured':
    default:
      return sorted.sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.rating - a.rating,
      );
  }
}

function notFound(kind: string, id: string): never {
  throw new Error(`${kind} not found: ${id}`);
}

class MockCatalogService implements CatalogService {
  private get store() {
    return useCatalogStore.getState();
  }

  /* --------------------------------------------------------------- reads */

  listCategories() {
    return settle([...this.store.categories].sort((a, b) => a.sortOrder - b.sortOrder));
  }

  getCategory(slug: string) {
    return settle(this.store.categories.find((c) => c.slug === slug) ?? null);
  }

  listStages() {
    return settle([...stages].sort((a, b) => a.sortOrder - b.sortOrder));
  }

  listProducts(query: ProductQuery = {}) {
    const filtered = this.store.products.filter((p) => matches(p, query));
    const sorted = sortProducts(filtered, query.sort);
    const offset = query.offset ?? 0;
    const limit = query.limit ?? sorted.length;

    return settle<Paged<Product>>({
      items: sorted.slice(offset, offset + limit),
      total: sorted.length,
    });
  }

  getProduct(slug: string) {
    return settle(this.store.products.find((p) => p.slug === slug) ?? null);
  }

  getProductsByIds(ids: string[]) {
    return settle(
      ids.map((id) => this.store.products.find((p) => p.id === id)).filter(Boolean) as Product[],
    );
  }

  listKits() {
    return settle(this.store.kits);
  }

  listArticles() {
    return settle(
      [...this.store.articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    );
  }

  getArticle(slug: string) {
    return settle(this.store.articles.find((a) => a.slug === slug) ?? null);
  }

  listDeliveryZones() {
    return settle(this.store.deliveryZones);
  }

  listOrders() {
    return settle(
      [...this.store.orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    );
  }

  getOrder(id: string) {
    return settle(this.store.orders.find((o) => o.id === id) ?? null);
  }

  listPolicies() {
    return settle(this.store.policies);
  }

  getPolicy(key: string) {
    return settle(this.store.policies.find((p) => p.key === key) ?? null);
  }

  getSettings() {
    return settle(this.store.settings);
  }

  /* -------------------------------------------------------------- writes */

  createProduct(input: Omit<Product, 'id' | 'createdAt'>) {
    const product: Product = { ...input, id: `p-${input.slug}`, createdAt: new Date().toISOString() };
    this.store.setProducts((products) => [product, ...products]);
    return settleWrite(product);
  }

  updateProduct(id: string, patch: Partial<Omit<Product, 'id'>>) {
    let updated: Product | undefined;
    this.store.setProducts((products) =>
      products.map((p) => {
        if (p.id !== id) return p;
        updated = { ...p, ...patch };
        return updated;
      }),
    );
    if (!updated) notFound('Product', id);
    return settleWrite(updated);
  }

  adjustStock(id: string, stock: number) {
    return this.updateProduct(id, { stock });
  }

  createCategory(input: Omit<Category, 'id'>) {
    const category: Category = { ...input, id: `c-${input.slug}` };
    this.store.setCategories((categories) => [...categories, category]);
    return settleWrite(category);
  }

  updateCategory(id: string, patch: Partial<Omit<Category, 'id'>>) {
    let updated: Category | undefined;
    this.store.setCategories((categories) =>
      categories.map((c) => {
        if (c.id !== id) return c;
        updated = { ...c, ...patch };
        return updated;
      }),
    );
    if (!updated) notFound('Category', id);
    return settleWrite(updated);
  }

  deleteCategory(id: string) {
    const category = this.store.categories.find((c) => c.id === id);
    if (!category) notFound('Category', id);
    const inUse = this.store.products.some((p) => p.categorySlug === category.slug);
    if (inUse) {
      throw new Error('This category still has products in it — move or delete those first.');
    }
    this.store.setCategories((categories) => categories.filter((c) => c.id !== id));
    return settleWrite(undefined);
  }

  createKit(input: Omit<Kit, 'id'>) {
    const kit: Kit = { ...input, id: `k-${input.slug}` };
    this.store.setKits((kits) => [...kits, kit]);
    return settleWrite(kit);
  }

  updateKit(id: string, patch: Partial<Omit<Kit, 'id'>>) {
    let updated: Kit | undefined;
    this.store.setKits((kits) =>
      kits.map((k) => {
        if (k.id !== id) return k;
        updated = { ...k, ...patch };
        return updated;
      }),
    );
    if (!updated) notFound('Kit', id);
    return settleWrite(updated);
  }

  createOrder(input: Omit<Order, 'id' | 'reference' | 'createdAt'>) {
    const now = new Date();
    const order: Order = {
      ...input,
      id: `o-${now.getTime()}`,
      reference: `IB-${now.getTime().toString().slice(-8)}`,
      createdAt: now.toISOString(),
    };
    this.store.setOrders((orders) => [order, ...orders]);

    // Stock actually moves when an order is placed — decrement the variant
    // ordered, or the product itself when there's no variant. (Colour choice
    // isn't tracked on an order line today, so colour-option stock is left
    // alone; that's a pre-existing gap in `CartLine`, not new here.)
    this.store.setProducts((products) =>
      products.map((p) => {
        const line = order.lines.find((l) => l.productId === p.id);
        if (!line) return p;
        if (line.variantId) {
          return {
            ...p,
            variants: p.variants.map((v) =>
              v.id === line.variantId ? { ...v, stock: Math.max(0, v.stock - line.quantity) } : v,
            ),
          };
        }
        return { ...p, stock: Math.max(0, p.stock - line.quantity) };
      }),
    );

    return settleWrite(order);
  }

  updateOrderStatus(id: string, status: OrderStatus) {
    let updated: Order | undefined;
    this.store.setOrders((orders) =>
      orders.map((o) => {
        if (o.id !== id) return o;
        updated = { ...o, status };
        return updated;
      }),
    );
    if (!updated) notFound('Order', id);
    return settleWrite(updated);
  }

  createArticle(input: Omit<Article, 'id'>) {
    const article: Article = { ...input, id: `a-${input.slug}` };
    this.store.setArticles((articles) => [article, ...articles]);
    return settleWrite(article);
  }

  updateArticle(id: string, patch: Partial<Omit<Article, 'id'>>) {
    let updated: Article | undefined;
    this.store.setArticles((articles) =>
      articles.map((a) => {
        if (a.id !== id) return a;
        updated = { ...a, ...patch };
        return updated;
      }),
    );
    if (!updated) notFound('Article', id);
    return settleWrite(updated);
  }

  updateDeliveryZone(id: string, patch: Partial<Omit<DeliveryZone, 'id'>>) {
    let updated: DeliveryZone | undefined;
    this.store.setDeliveryZones((zones) =>
      zones.map((z) => {
        if (z.id !== id) return z;
        updated = { ...z, ...patch };
        return updated;
      }),
    );
    if (!updated) notFound('Delivery zone', id);
    return settleWrite(updated);
  }

  updatePolicy(key: string, patch: Partial<Omit<Policy, 'key'>>) {
    let updated: Policy | undefined;
    this.store.setPolicies((policies) =>
      policies.map((p) => {
        if (p.key !== key) return p;
        updated = { ...p, ...patch };
        return updated;
      }),
    );
    if (!updated) notFound('Policy', key);
    return settleWrite(updated);
  }

  updateSettings(patch: Partial<StoreSettings>) {
    let updated: StoreSettings | undefined;
    this.store.setSettings((settings) => {
      updated = { ...settings, ...patch };
      return updated;
    });
    return settleWrite(updated!);
  }
}

export const catalogService: CatalogService = new MockCatalogService();
