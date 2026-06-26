import { Types } from 'mongoose';
import { Order } from '../../models/Order';
import { Restaurant } from '../../models/Restaurant';
import { User } from '../../models/User';
import { ApiError } from '../../utils/ApiError';
import { ACTIVE_ORDER_STATUSES, OrderStatus } from '../../utils/constants';
import { realtime } from '../../socket/emitters';
import { getOrderById, refundOrder } from '../order/order.service';

const LIVE_POPULATE = [
  { path: 'restaurant', select: 'name partnerId' },
  { path: 'customer', select: 'name phone' },
  { path: 'rider', select: 'name phone' },
];

/** Marketplace overview KPIs (PRD §4). */
export async function overview() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [orders, gmvAgg, restaurants, riders] = await Promise.all([
    Order.countDocuments({ status: { $nin: ['pending_payment'] } }),
    Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, gmv: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
    ]),
    Restaurant.countDocuments({ isApproved: true }),
    User.countDocuments({ role: 'rider', isActive: true }),
  ]);

  const delivered = gmvAgg[0]?.count ?? 0;
  const gmv = Math.round((gmvAgg[0]?.gmv ?? 0) * 100) / 100;
  const activeOrders = await Order.countDocuments({ status: { $in: ACTIVE_ORDER_STATUSES } });

  return {
    totalOrders: orders,
    deliveredOrders: delivered,
    activeOrders,
    gmv,
    aov: delivered ? Math.round((gmv / delivered) * 100) / 100 : 0,
    liveRestaurants: restaurants,
    activeRiders: riders,
  };
}

export async function liveOrders(status?: OrderStatus) {
  const filter: Record<string, unknown> = status
    ? { status }
    : { status: { $in: ACTIVE_ORDER_STATUSES } };
  return Order.find(filter).sort({ createdAt: 1 }).populate(LIVE_POPULATE).lean();
}

export async function listRestaurants() {
  return Restaurant.find().sort({ createdAt: -1 }).lean();
}

export async function setRestaurantStatus(id: string, updates: { isApproved?: boolean; isOpen?: boolean }) {
  const r = await Restaurant.findByIdAndUpdate(id, updates, { new: true });
  if (!r) throw ApiError.notFound('Restaurant not found');
  return r;
}

export async function listRiders() {
  return User.find({ role: 'rider' }).sort({ createdAt: -1 }).lean();
}

export async function setUserActive(id: string, isActive: boolean) {
  const u = await User.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!u) throw ApiError.notFound('User not found');
  return u.toJSON();
}

/** Manual rider assignment for stuck orders (PRD §9.4). */
export async function assignRider(orderId: string, riderId: string) {
  const [order, rider] = await Promise.all([Order.findById(orderId), User.findById(riderId)]);
  if (!order) throw ApiError.notFound('Order not found');
  if (!rider || rider.role !== 'rider') throw ApiError.badRequest('Invalid rider');
  order.rider = rider._id as Types.ObjectId;
  if (order.status === 'ready') {
    order.status = 'assigned';
    order.statusHistory.push({ status: 'assigned', at: new Date(), by: 'admin' });
  }
  await order.save();
  const populated = await getOrderById(orderId);
  realtime.orderUpdated(populated as never);
  realtime.riderAssigned(riderId, populated);
  return populated;
}

export async function refund(orderId: string, reason: string) {
  return refundOrder(orderId, reason);
}
