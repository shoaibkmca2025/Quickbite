import { User } from '../../models/User';
import { Order } from '../../models/Order';
import { ApiError } from '../../utils/ApiError';
import { RiderStatus } from '../../utils/constants';
import { realtime } from '../../socket/emitters';

const ASSIGNMENT_POPULATE = [
  { path: 'restaurant', select: 'name image address city location' },
  { path: 'customer', select: 'name phone' },
];

export async function setStatus(riderId: string, status: RiderStatus) {
  const rider = await User.findById(riderId);
  if (!rider || rider.role !== 'rider') throw ApiError.forbidden('Not a rider account');
  rider.rider = { ...(rider.rider ?? { rating: 5, totalTrips: 0 }), status } as never;
  await rider.save();
  return rider.toJSON();
}

export async function getAssignments(riderId: string) {
  const [active, available] = await Promise.all([
    Order.find({
      rider: riderId,
      status: { $in: ['assigned', 'picked_up', 'out_for_delivery'] },
    })
      .sort({ updatedAt: -1 })
      .populate(ASSIGNMENT_POPULATE)
      .lean(),
    // Unclaimed ready orders the rider can grab.
    Order.find({ rider: { $exists: false }, status: 'ready' })
      .sort({ createdAt: 1 })
      .limit(20)
      .populate(ASSIGNMENT_POPULATE)
      .lean(),
  ]);
  return { active, available };
}

export async function updateLocation(
  riderId: string,
  data: { orderId?: string; lat: number; lng: number }
) {
  await User.updateOne(
    { _id: riderId },
    { 'rider.lastLocation': { lat: data.lat, lng: data.lng, at: new Date() } }
  );
  // Broadcast to anyone tracking the order (PRD FR-ORD-03).
  if (data.orderId) {
    realtime.orderStatus(data.orderId, 'out_for_delivery'); // keep status fresh
    // location is also streamed directly via socket from the rider client
  }
  return { ok: true };
}

export async function getEarnings(riderId: string) {
  const delivered = await Order.find({ rider: riderId, status: 'delivered' })
    .sort({ deliveredAt: -1 })
    .select('code grandTotal deliveryFee deliveredAt restaurant')
    .populate({ path: 'restaurant', select: 'name' })
    .lean();

  // Simple model: rider earns the delivery fee + a flat per-trip incentive.
  const PER_TRIP = 15;
  const trips = delivered.map((o) => ({
    code: o.code,
    at: o.deliveredAt,
    restaurant: (o.restaurant as { name?: string })?.name,
    earning: Math.round((o.deliveryFee + PER_TRIP) * 100) / 100,
  }));
  const total = Math.round(trips.reduce((s, t) => s + t.earning, 0) * 100) / 100;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const today = trips.filter((t) => t.at && new Date(t.at) >= startOfDay);
  const todayEarning = Math.round(today.reduce((s, t) => s + t.earning, 0) * 100) / 100;

  return {
    totalTrips: delivered.length,
    totalEarning: total,
    todayTrips: today.length,
    todayEarning,
    trips,
  };
}
