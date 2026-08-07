import type { ProductDimensions } from './services/types';

export type DeliveryMethod = 'motorbike' | 'van';

/** A motorbike can strap down a box roughly up to this size or weight —
 * past it, delivery has to switch to a car or van. One threshold here
 * means the split always agrees with the numbers on the product, rather
 * than someone tagging "big" by eye at checkout time. */
const MAX_MOTORBIKE_SIDE_CM = 70;
const MAX_MOTORBIKE_WEIGHT_KG = 15;

export function deliveryMethodFor(dimensions: ProductDimensions): DeliveryMethod {
  const { lengthCm, widthCm, heightCm, weightKg } = dimensions;
  const oversized =
    lengthCm > MAX_MOTORBIKE_SIDE_CM ||
    widthCm > MAX_MOTORBIKE_SIDE_CM ||
    heightCm > MAX_MOTORBIKE_SIDE_CM ||
    weightKg > MAX_MOTORBIKE_WEIGHT_KG;
  return oversized ? 'van' : 'motorbike';
}

export function deliveryMethodNote(method: DeliveryMethod): string {
  return method === 'van'
    ? 'Too large for motorbike delivery — this item arrives by car or van.'
    : 'Compact enough for our standard motorbike delivery.';
}

/** Given every line in a basket, does anything require a van? Checkout
 * surfaces this once for the whole order rather than per item. */
export function anyRequiresVan(allDimensions: ProductDimensions[]): boolean {
  return allDimensions.some((d) => deliveryMethodFor(d) === 'van');
}
