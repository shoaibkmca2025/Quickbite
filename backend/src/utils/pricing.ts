import { env } from '../config/env';

export interface BillLineInput {
  price: number;
  quantity: number;
  /** absolute add-on amount per unit (sum of selected option deltas) */
  addonsTotal?: number;
}

export interface Bill {
  itemTotal: number;
  packagingFee: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  grandTotal: number;
  commission: number; // platform take from the restaurant
  restaurantEarning: number; // what restaurant receives (itemTotal - commission)
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Computes a transparent bill (PRD FR-CART-03). All charges are itemised so the
 * grand total equals the sum of components.
 */
export function computeBill(
  lines: BillLineInput[],
  opts: { deliveryFee?: number; discount?: number } = {}
): Bill {
  const itemTotal = round2(
    lines.reduce(
      (sum, l) => sum + (l.price + (l.addonsTotal ?? 0)) * l.quantity,
      0
    )
  );

  const packagingFee = env.pricing.packagingFee;
  const deliveryFee = opts.deliveryFee ?? env.pricing.deliveryFee;
  const discount = round2(opts.discount ?? 0);

  const taxableBase = Math.max(itemTotal - discount, 0);
  const tax = round2(taxableBase * env.pricing.taxRate);

  const grandTotal = round2(
    Math.max(itemTotal - discount, 0) + packagingFee + deliveryFee + tax
  );

  const commission = round2(itemTotal * env.pricing.commissionRate);
  const restaurantEarning = round2(itemTotal - commission);

  return {
    itemTotal,
    packagingFee,
    deliveryFee,
    tax,
    discount,
    grandTotal,
    commission,
    restaurantEarning,
  };
}
