import { Coupon, ICoupon } from '../../models/Coupon';
import { Order } from '../../models/Order';
import { ApiError } from '../../utils/ApiError';

export interface AppliedCoupon {
  coupon: ICoupon;
  discount: number;
}

/**
 * Validates a coupon against an order context and returns the computed discount.
 * Throws ApiError with a clear reason on any failure (PRD FR-CART-04).
 */
export async function validateCoupon(params: {
  code: string;
  itemTotal: number;
  restaurantId: string;
  userId: string;
}): Promise<AppliedCoupon> {
  const coupon = await Coupon.findOne({ code: params.code.toUpperCase().trim() });
  if (!coupon || !coupon.active) throw ApiError.badRequest('This coupon is not valid');

  const now = new Date();
  if (coupon.validFrom && coupon.validFrom > now) throw ApiError.badRequest('Coupon is not active yet');
  if (coupon.validTo && coupon.validTo < now) throw ApiError.badRequest('This coupon has expired');

  if (coupon.restaurant && String(coupon.restaurant) !== params.restaurantId) {
    throw ApiError.badRequest('Coupon not applicable to this restaurant');
  }

  if (params.itemTotal < coupon.minOrderValue) {
    throw ApiError.badRequest(`Add items worth ₹${coupon.minOrderValue - params.itemTotal} more to use this coupon`);
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw ApiError.badRequest('This coupon has reached its usage limit');
  }

  if (coupon.perUserLimit) {
    const used = await Order.countDocuments({
      customer: params.userId,
      'coupon.code': coupon.code,
      status: { $nin: ['cancelled', 'rejected', 'pending_payment'] },
    });
    if (used >= coupon.perUserLimit) throw ApiError.badRequest('You have already used this coupon');
  }

  let discount =
    coupon.type === 'flat' ? coupon.value : (params.itemTotal * coupon.value) / 100;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, params.itemTotal); // never exceed item total
  discount = Math.round(discount * 100) / 100;

  return { coupon, discount };
}

export async function incrementUsage(code: string) {
  await Coupon.updateOne({ code }, { $inc: { usageCount: 1 } });
}

/** Public-facing list of currently active offers (PRD FR-OFF-01). */
export async function listActiveOffers(restaurantId?: string) {
  const now = new Date();
  return Coupon.find({
    active: true,
    $and: [
      { $or: [{ validFrom: { $exists: false } }, { validFrom: { $lte: now } }] },
      { $or: [{ validTo: { $exists: false } }, { validTo: { $gte: now } }] },
      { $or: [{ restaurant: { $exists: false } }, ...(restaurantId ? [{ restaurant: restaurantId }] : [{ restaurant: null }])] },
    ],
  })
    .select('code description type value maxDiscount minOrderValue')
    .lean();
}

// ---- Admin CRUD ----
export async function createCoupon(data: Record<string, unknown>) {
  return Coupon.create(data);
}

export async function updateCoupon(id: string, data: Record<string, unknown>) {
  const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true });
  if (!coupon) throw ApiError.notFound('Coupon not found');
  return coupon;
}

export async function deleteCoupon(id: string) {
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  return { id };
}

export async function listAllCoupons() {
  return Coupon.find().sort({ createdAt: -1 }).lean();
}
