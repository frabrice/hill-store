import type { Order, OrderStatus, PaymentMethod } from '@/lib/services/types';
import { products } from './catalog';
import { deliveryZones } from './catalog';

/**
 * Demo order history so the admin dashboard's Orders list and Analytics have
 * real shape to show. Nothing here is a real transaction — once
 * `Checkout.tsx` calls `createOrder`, genuine orders land in the same store
 * alongside these.
 *
 * Deterministic (seeded, not `Math.random()`) so the dataset is stable across
 * reloads until real orders start layering on top of it.
 */

let seed = 42;
function rand() {
  // Mulberry32 — small, deterministic, good enough for demo data.
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function randInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

const FIRST_NAMES = [
  'Aline', 'Bosco', 'Claudine', 'Divine', 'Eric', 'Fabrice', 'Grace', 'Herve',
  'Immaculee', 'Jado', 'Keza', 'Liliane', 'Manzi', 'Nadia', 'Olivier', 'Pacifique',
  'Queen', 'Rachel', 'Sandrine', 'Theo', 'Uwase', 'Vanessa', 'Willy', 'Yvette',
];
const LAST_NAMES = [
  'Uwimana', 'Niyonzima', 'Mukamana', 'Habimana', 'Ingabire', 'Nkurunziza',
  'Mutesi', 'Twagirayezu', 'Uwase', 'Byiringiro', 'Umutoni', 'Nsanzimana',
];

function randomCustomerName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}
function randomPhone() {
  return `07${randInt(2, 9)} ${randInt(100, 999)} ${randInt(100, 999)}`;
}

const STREETS = [
  'KG 7 Ave', 'KG 11 Ave', 'KG 15 Ave', 'KN 4 Ave', 'KN 8 Rd', 'KK 15 Rd',
  'KG 200 St', 'Kimihurura Close', 'Nyarutarama Rd', 'Kacyiru Rd',
];

function randomAddress() {
  return `${STREETS[randInt(0, STREETS.length - 1)]}, House ${randInt(1, 220)}`;
}

const PAYMENT_METHODS: PaymentMethod[] = ['momo', 'momo', 'momo', 'pay_on_delivery', 'pay_on_delivery'];

/** Status distribution skews toward "delivered" for older orders and toward
 * "pending"/"processing" for the most recent few days — mirrors a real funnel. */
function statusForAge(daysAgo: number): OrderStatus {
  if (daysAgo <= 1) return pick(['pending', 'pending', 'paid', 'processing']);
  if (daysAgo <= 3) return pick(['paid', 'processing', 'processing', 'shipped']);
  if (daysAgo <= 6) return pick(['processing', 'shipped', 'shipped', 'delivered']);
  const roll = rand();
  if (roll < 0.06) return 'cancelled';
  if (roll < 0.14) return 'shipped';
  return 'delivered';
}

const IN_STOCK_PRODUCTS = products.filter((p) => p.stock > 0);

const TODAY = new Date('2026-08-04T09:00:00');

function dateDaysAgo(daysAgo: number, hour: number, minute: number) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function buildOrder(index: number, daysAgo: number): Order {
  const zone = pick(deliveryZones);
  const lineCount = randInt(1, 4);
  const chosen = new Set<string>();
  while (chosen.size < lineCount) {
    chosen.add(pick(IN_STOCK_PRODUCTS).id);
  }

  let subtotalRwf = 0;
  const lines = Array.from(chosen).map((productId) => {
    const product = products.find((p) => p.id === productId)!;
    const quantity = randInt(1, 3);
    const variantId = product.variants[0] ? pick(product.variants).id : null;
    subtotalRwf += product.priceRwf * quantity;
    return { productId, variantId, quantity };
  });

  const deliveryRwf = zone.feeRwf;
  const totalRwf = subtotalRwf + deliveryRwf;
  const status = statusForAge(daysAgo);
  const createdAt = dateDaysAgo(daysAgo, randInt(7, 20), randInt(0, 59));
  const paymentMethod = pick(PAYMENT_METHODS);
  const customerName = randomCustomerName();

  return {
    id: `o${index}`,
    reference: `IB-${String(10000 + index)}`,
    status,
    lines,
    subtotalRwf,
    deliveryRwf,
    totalRwf,
    customerName,
    customerPhone: randomPhone(),
    customerEmail: null,
    address: randomAddress(),
    deliveryZoneId: zone.id,
    deliveryZoneName: zone.name,
    paymentMethod,
    // Self-reported at checkout — only ever present for momo orders.
    payerName: paymentMethod === 'momo' ? customerName : null,
    paidAmountRwf: paymentMethod === 'momo' ? totalRwf : null,
    createdAt,
  };
}

/** ~10 weeks of history, busier on recent days, quieter further back — a
 * gently growing shape rather than a flat line. */
export const orders: Order[] = (() => {
  const list: Order[] = [];
  let index = 1;
  for (let daysAgo = 69; daysAgo >= 0; daysAgo--) {
    const growth = 1 - daysAgo / 90; // 0 (old) -> ~1 (recent)
    const ordersToday = randInt(0, Math.round(1 + growth * 3));
    for (let i = 0; i < ordersToday; i++) {
      list.push(buildOrder(index, daysAgo));
      index++;
    }
  }
  return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
})();
