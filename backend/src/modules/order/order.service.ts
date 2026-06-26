import { Types } from 'mongoose';
import { Order, IOrder, IOrderItem } from '../../models/Order';
import { MenuItem } from '../../models/MenuItem';
import { Restaurant } from '../../models/Restaurant';
import { User } from '../../models/User';
import { Payment } from '../../models/Payment';
import { Review } from '../../models/Review';
import { ApiError } from '../../utils/ApiError';
import { computeBill, BillLineInput } from '../../utils/pricing';
import { orderCode, txnRef } from '../../utils/ids';
import {
  OrderStatus,
  PaymentMethod,
  ACTIVE_ORDER_STATUSES,
} from '../../utils/constants';
import { env } from '../../config/env';
import { realtime } from '../../socket/emitters';
import { canTransition, isCancellableByCustomer } from './order.state';
import { validateCoupon, incrementUsage } from '../coupon/coupon.service';

interface CartItemInput {
  menuItemId: string;
  quantity: number;
  options?: { groupName: string; label: string }[];
}

const ORDER_POPULATE = [
  { path: 'restaurant', select: 'name image address city partnerId location avgPrepTimeMins' },
  { path: 'customer', select: 'name phone avatar' },
  { path: 'rider', select: 'name phone avatar rider.lastLocation rider.vehicle' },
];

/**
 * Resolves cart input into priced, snapshotted order items. Validates every item
 * belongs to the restaurant and is available (PRD FR-MENU-03 / FR-CART-02).
 */
async function buildOrderItems(restaurantId: string, input: CartItemInput[]) {
  const ids = input.map((i) => i.menuItemId);
  const menuItems = await MenuItem.find({ _id: { $in: ids }, restaurant: restaurantId });
  const byId = new Map(menuItems.map((m) => [String(m._id), m]));

  const items: IOrderItem[] = [];
  const lines: BillLineInput[] = [];

  for (const ci of input) {
    const mi = byId.get(ci.menuItemId);
    if (!mi) throw ApiError.badRequest('One or more items are not on this restaurant menu');
    if (!mi.available) throw ApiError.badRequest(`"${mi.name}" is sold out`);

    let addonsTotal = 0;
    const options = (ci.options ?? []).map((opt) => {
      const group = mi.optionGroups.find((g) => g.name === opt.groupName);
      const choice = group?.choices.find((c) => c.label === opt.label);
      if (!group || !choice) {
        throw ApiError.badRequest(`Invalid option "${opt.label}" for "${mi.name}"`);
      }
      addonsTotal += choice.priceDelta;
      return { groupName: opt.groupName, label: opt.label, priceDelta: choice.priceDelta };
    });

    // Enforce required option groups.
    for (const g of mi.optionGroups) {
      if (g.required && !options.some((o) => o.groupName === g.name)) {
        throw ApiError.badRequest(`Please choose ${g.name} for "${mi.name}"`);
      }
    }

    const lineTotal = Math.round((mi.price + addonsTotal) * ci.quantity * 100) / 100;
    items.push({
      menuItem: mi._id as Types.ObjectId,
      name: mi.name,
      unitPrice: mi.price,
      quantity: ci.quantity,
      options,
      lineTotal,
      isVeg: mi.isVeg,
    });
    lines.push({ price: mi.price, quantity: ci.quantity, addonsTotal });
  }

  return { items, lines };
}

export async function quote(input: {
  restaurantId: string;
  items: CartItemInput[];
  couponCode?: string;
  userId: string;
}) {
  const restaurant = await Restaurant.findById(input.restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');

  const { lines } = await buildOrderItems(input.restaurantId, input.items);
  const preBill = computeBill(lines);

  let discount = 0;
  let couponInfo: { code: string; discount: number } | undefined;
  if (input.couponCode) {
    const applied = await validateCoupon({
      code: input.couponCode,
      itemTotal: preBill.itemTotal,
      restaurantId: input.restaurantId,
      userId: input.userId,
    });
    discount = applied.discount;
    couponInfo = { code: applied.coupon.code, discount };
  }

  if (preBill.itemTotal < restaurant.minOrderValue) {
    throw ApiError.badRequest(
      `Minimum order value is ₹${restaurant.minOrderValue}`,
    );
  }

  const bill = computeBill(lines, { discount });
  return { bill, coupon: couponInfo, minOrderValue: restaurant.minOrderValue };
}

export async function createOrder(
  customerId: string,
  input: {
    restaurantId: string;
    items: CartItemInput[];
    couponCode?: string;
    paymentMethod: PaymentMethod;
    address: IOrder['deliveryAddress'];
  }
) {
  const restaurant = await Restaurant.findById(input.restaurantId);
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  if (!restaurant.isApproved) throw ApiError.badRequest('Restaurant is not active');
  if (!restaurant.isOpen) throw ApiError.badRequest('Restaurant is currently closed');

  const { items, lines } = await buildOrderItems(input.restaurantId, input.items);
  const preBill = computeBill(lines);

  if (preBill.itemTotal < restaurant.minOrderValue) {
    throw ApiError.badRequest(`Minimum order value is ₹${restaurant.minOrderValue}`);
  }

  let discount = 0;
  let couponInfo: { code: string; discount: number } | undefined;
  if (input.couponCode) {
    const applied = await validateCoupon({
      code: input.couponCode,
      itemTotal: preBill.itemTotal,
      restaurantId: input.restaurantId,
      userId: customerId,
    });
    discount = applied.discount;
    couponInfo = { code: applied.coupon.code, discount };
  }

  const bill = computeBill(lines, { discount });
  const isCod = input.paymentMethod === 'cod';

  const order = await Order.create({
    code: orderCode(),
    customer: customerId,
    restaurant: restaurant._id,
    items,
    itemTotal: bill.itemTotal,
    packagingFee: bill.packagingFee,
    deliveryFee: bill.deliveryFee,
    tax: bill.tax,
    discount: bill.discount,
    grandTotal: bill.grandTotal,
    commission: bill.commission,
    restaurantEarning: bill.restaurantEarning,
    coupon: couponInfo,
    deliveryAddress: input.address,
    paymentMethod: input.paymentMethod,
    paymentStatus: 'pending',
    status: 'pending_payment',
    statusHistory: [{ status: 'pending_payment', at: new Date(), by: 'customer' }],
  });

  // COD orders are placed immediately; online payments wait for /pay.
  if (isCod) {
    await placeOrder(order);
  }

  return getOrderById(String(order._id), { id: customerId, role: 'customer' });
}

/**
 * Mock payment processor (PRD FR-PAY-01/03, NFR-REL-01). Idempotency key prevents
 * double charges; on success the order transitions to "placed".
 */
export async function payOrder(
  customerId: string,
  orderId: string,
  opts: { idempotencyKey?: string; simulateFailure?: boolean }
) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (String(order.customer) !== customerId) throw ApiError.forbidden();
  if (order.paymentStatus === 'paid') {
    return getOrderById(orderId, { id: customerId, role: 'customer' });
  }
  if (order.paymentMethod === 'cod') throw ApiError.badRequest('This is a Cash on Delivery order');

  // Idempotency: a repeated key returns the existing successful payment.
  if (opts.idempotencyKey) {
    const existing = await Payment.findOne({ idempotencyKey: opts.idempotencyKey, status: 'paid' });
    if (existing) return getOrderById(orderId, { id: customerId, role: 'customer' });
  }

  const success = env.payment.devMode ? !opts.simulateFailure : !opts.simulateFailure; // real gateway later
  const payment = await Payment.create({
    order: order._id,
    customer: customerId,
    amount: order.grandTotal,
    method: order.paymentMethod,
    status: success ? 'paid' : 'failed',
    gatewayRef: success ? txnRef() : undefined,
    idempotencyKey: opts.idempotencyKey,
    failureReason: success ? undefined : 'Simulated payment failure',
  });

  if (!success) {
    order.paymentStatus = 'failed';
    await order.save();
    throw ApiError.badRequest('Payment failed. Please retry or choose another method.');
  }

  order.payment = payment._id as Types.ObjectId;
  order.paymentStatus = 'paid';
  await placeOrder(order);

  return getOrderById(orderId, { id: customerId, role: 'customer' });
}

/** Marks an order as placed, sets ETA, and notifies the restaurant in real time. */
async function placeOrder(order: IOrder) {
  const restaurant = await Restaurant.findById(order.restaurant);
  const etaMins = (restaurant?.avgPrepTimeMins ?? 20) + 20; // prep + delivery buffer
  order.status = 'placed';
  order.placedAt = new Date();
  order.etaAt = new Date(Date.now() + etaMins * 60 * 1000);
  order.statusHistory.push({ status: 'placed', at: new Date(), by: 'system' });
  await order.save();

  if (order.coupon?.code) await incrementUsage(order.coupon.code);

  const populated = await getOrderById(String(order._id), { id: String(order.customer), role: 'customer' });
  realtime.orderCreated(String(order.restaurant), populated);
  realtime.notify(String(order.customer), {
    title: 'Order placed!',
    body: `${order.code} confirmed. ETA ~${etaMins} mins.`,
    type: 'order',
  });
  return populated;
}

interface Requester {
  id: string;
  role: 'customer' | 'restaurant' | 'rider' | 'admin';
  restaurantId?: string;
}

export async function getOrderById(orderId: string, requester?: Requester) {
  const order = await Order.findById(orderId).populate(ORDER_POPULATE).lean();
  if (!order) throw ApiError.notFound('Order not found');

  if (requester && requester.role !== 'admin') {
    const isOwner =
      (requester.role === 'customer' && String((order.customer as { _id: unknown })._id) === requester.id) ||
      (requester.role === 'restaurant' && String((order.restaurant as { _id: unknown })._id) === requester.restaurantId) ||
      (requester.role === 'rider' && order.rider && String((order.rider as { _id: unknown })._id) === requester.id);
    if (!isOwner) throw ApiError.forbidden('You cannot view this order');
  }
  return order;
}

export async function listCustomerOrders(customerId: string, page: number, limit: number) {
  const filter = { customer: customerId, status: { $ne: 'pending_payment' } };
  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(ORDER_POPULATE)
      .lean(),
    Order.countDocuments(filter),
  ]);
  return { items, total };
}

/**
 * Rebuilds a cart from a past order against the live menu (PRD FR-POST-02).
 * Items that are gone or sold out are returned in `unavailable` so the app can flag them;
 * prices reflect the current menu, not the historical snapshot.
 */
export async function reorder(customerId: string, orderId: string) {
  const order = await Order.findById(orderId).lean();
  if (!order) throw ApiError.notFound('Order not found');
  if (String(order.customer) !== customerId) throw ApiError.forbidden();

  const restaurant = await Restaurant.findById(order.restaurant).select('name isOpen isApproved').lean();
  if (!restaurant) throw ApiError.notFound('This restaurant is no longer available');

  const menuItems = await MenuItem.find({
    _id: { $in: order.items.map((it) => it.menuItem) },
    restaurant: order.restaurant,
  }).lean();
  const byId = new Map(menuItems.map((m) => [String(m._id), m]));

  const items: {
    menuItemId: string;
    name: string;
    price: number;
    isVeg: boolean;
    quantity: number;
    options: { groupName: string; label: string; priceDelta: number }[];
  }[] = [];
  const unavailable: string[] = [];

  for (const it of order.items) {
    const mi = byId.get(String(it.menuItem));
    if (!mi || !mi.available) {
      unavailable.push(it.name);
      continue;
    }
    // Keep only options that still exist on the current menu item.
    const options = (it.options ?? []).flatMap((opt) => {
      const group = mi.optionGroups.find((g) => g.name === opt.groupName);
      const choice = group?.choices.find((c) => c.label === opt.label);
      return choice ? [{ groupName: opt.groupName, label: opt.label, priceDelta: choice.priceDelta }] : [];
    });
    items.push({
      menuItemId: String(mi._id),
      name: mi.name,
      price: mi.price,
      isVeg: mi.isVeg,
      quantity: it.quantity,
      options,
    });
  }

  return {
    restaurantId: String(order.restaurant),
    restaurantName: restaurant.name,
    isOpen: restaurant.isOpen && restaurant.isApproved,
    items,
    unavailable,
  };
}

export async function listRestaurantOrders(
  restaurantId: string,
  group: 'active' | 'completed' | 'all',
  page: number,
  limit: number
) {
  const filter: Record<string, unknown> = { restaurant: restaurantId };
  if (group === 'active') filter.status = { $in: ACTIVE_ORDER_STATUSES };
  else if (group === 'completed') filter.status = { $in: ['delivered', 'cancelled', 'rejected'] };
  else filter.status = { $ne: 'pending_payment' };

  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(ORDER_POPULATE)
      .lean(),
    Order.countDocuments(filter),
  ]);
  return { items, total };
}

/** Central, guarded status mutation used by all parties. */
async function applyTransition(
  order: IOrder,
  to: OrderStatus,
  by: string,
  extra?: Partial<Pick<IOrder, 'prepTimeMins' | 'etaAt' | 'cancelledReason'>>
) {
  if (!canTransition(order.status, to)) {
    throw ApiError.badRequest(`Cannot change order from "${order.status}" to "${to}"`);
  }
  order.status = to;
  if (extra?.prepTimeMins !== undefined) order.prepTimeMins = extra.prepTimeMins;
  if (extra?.etaAt) order.etaAt = extra.etaAt;
  if (extra?.cancelledReason) order.cancelledReason = extra.cancelledReason;
  if (to === 'delivered') order.deliveredAt = new Date();
  order.statusHistory.push({ status: to, at: new Date(), by });
  await order.save();

  const populated = await getOrderById(String(order._id));
  realtime.orderUpdated(populated as never);
  realtime.orderStatus(String(order._id), to, order.etaAt);
  return populated;
}

// ---- Restaurant actions ----
export async function acceptOrder(restaurantId: string, orderId: string, prepTimeMins: number) {
  const order = await loadRestaurantOrder(restaurantId, orderId);
  const etaAt = new Date(Date.now() + (prepTimeMins + 20) * 60 * 1000);
  const result = await applyTransition(order, 'accepted', 'restaurant', { prepTimeMins, etaAt });
  realtime.notify(String(order.customer), {
    title: 'Order accepted',
    body: `${order.code} accepted. Prep time ~${prepTimeMins} mins.`,
    type: 'order',
  });
  return result;
}

export async function rejectOrder(restaurantId: string, orderId: string, reason: string) {
  const order = await loadRestaurantOrder(restaurantId, orderId);
  const result = await applyTransition(order, 'rejected', 'restaurant', { cancelledReason: reason });
  // Auto-refund online payments on rejection.
  await autoRefundIfPaid(order);
  realtime.notify(String(order.customer), {
    title: 'Order rejected',
    body: `${order.code} was rejected: ${reason}`,
    type: 'order',
  });
  return result;
}

export async function restaurantSetStatus(
  restaurantId: string,
  orderId: string,
  status: 'preparing' | 'ready'
) {
  const order = await loadRestaurantOrder(restaurantId, orderId);
  const result = await applyTransition(order, status, 'restaurant');
  if (status === 'ready') {
    await tryAutoAssignRider(order); // PRD FR-RST-07 -> rider assignment
  }
  return result;
}

async function loadRestaurantOrder(restaurantId: string, orderId: string) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (String(order.restaurant) !== restaurantId) throw ApiError.forbidden();
  return order;
}

// ---- Customer actions ----
export async function cancelOrder(customerId: string, orderId: string, reason?: string) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (String(order.customer) !== customerId) throw ApiError.forbidden();
  if (!isCancellableByCustomer(order.status)) {
    throw ApiError.badRequest('Order can no longer be cancelled — it is already being prepared');
  }
  const result = await applyTransition(order, 'cancelled', 'customer', {
    cancelledReason: reason ?? 'Cancelled by customer',
  });
  await autoRefundIfPaid(order);
  return result;
}

export async function reviewOrder(
  customerId: string,
  orderId: string,
  data: { foodRating: number; deliveryRating?: number; comment?: string }
) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (String(order.customer) !== customerId) throw ApiError.forbidden();
  if (order.status !== 'delivered') throw ApiError.badRequest('You can only review delivered orders');
  if (order.rating) throw ApiError.conflict('You have already reviewed this order');

  const review = await Review.create({
    order: order._id,
    customer: customerId,
    restaurant: order.restaurant,
    rider: order.rider,
    foodRating: data.foodRating,
    deliveryRating: data.deliveryRating,
    comment: data.comment,
  });
  order.rating = review._id as Types.ObjectId;
  await order.save();

  // Recompute the restaurant aggregate rating.
  const agg = await Review.aggregate([
    { $match: { restaurant: order.restaurant } },
    { $group: { _id: null, avg: { $avg: '$foodRating' }, count: { $sum: 1 } } },
  ]);
  if (agg[0]) {
    await Restaurant.updateOne(
      { _id: order.restaurant },
      { rating: Math.round(agg[0].avg * 10) / 10, ratingCount: agg[0].count }
    );
  }
  return review;
}

// ---- Rider helpers (used by rider module) ----
export async function tryAutoAssignRider(order: IOrder) {
  if (order.rider) return; // already assigned
  const rider = await User.findOne({ role: 'rider', 'rider.status': 'online', isActive: true });
  if (!rider) return; // ops can assign manually later
  order.rider = rider._id as Types.ObjectId;
  await applyTransition(order, 'assigned', 'system');
  const populated = await getOrderById(String(order._id));
  realtime.riderAssigned(String(rider._id), populated);
  realtime.notify(String(rider._id), {
    title: 'New delivery assigned',
    body: `${order.code} is ready for pickup.`,
    type: 'assignment',
  });
}

export async function riderTransition(
  riderId: string,
  orderId: string,
  to: Extract<OrderStatus, 'picked_up' | 'out_for_delivery' | 'delivered'>
) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (String(order.rider) !== riderId) throw ApiError.forbidden('This order is not assigned to you');
  const result = await applyTransition(order, to, 'rider');

  if (to === 'delivered') {
    await User.updateOne({ _id: riderId }, { $inc: { 'rider.totalTrips': 1 } });
    if (order.paymentMethod !== 'cod' || order.paymentStatus === 'paid') {
      // online already captured; COD considered collected on delivery
    }
    order.paymentStatus = order.paymentMethod === 'cod' ? 'paid' : order.paymentStatus;
    await order.save();
    realtime.notify(String(order.customer), {
      title: 'Delivered 🎉',
      body: `${order.code} has been delivered. Enjoy your meal!`,
      type: 'order',
    });
  }
  return result;
}

export async function riderClaimOrder(riderId: string, orderId: string) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.rider) throw ApiError.conflict('Order already has a rider');
  if (order.status !== 'ready') throw ApiError.badRequest('Order is not ready for pickup yet');
  order.rider = new Types.ObjectId(riderId);
  return applyTransition(order, 'assigned', 'rider');
}

async function autoRefundIfPaid(order: IOrder) {
  if (order.paymentStatus !== 'paid' || order.paymentMethod === 'cod') return;
  await Payment.updateOne(
    { order: order._id, status: 'paid' },
    { status: 'refunded', refundedAmount: order.grandTotal }
  );
  order.paymentStatus = 'refunded';
  await order.save();
}

/** Admin/ops: refund a paid order (PRD FR-ADM-03). */
export async function refundOrder(orderId: string, reason: string) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.paymentStatus !== 'paid') throw ApiError.badRequest('Order is not in a refundable state');
  await Payment.updateOne(
    { order: order._id, status: 'paid' },
    { status: 'refunded', refundedAmount: order.grandTotal }
  );
  order.paymentStatus = 'refunded';
  order.cancelledReason = reason;
  await order.save();
  realtime.notify(String(order.customer), {
    title: 'Refund initiated',
    body: `₹${order.grandTotal} refund for ${order.code} is on its way.`,
    type: 'refund',
  });
  return getOrderById(orderId);
}
