import { FilterQuery, Types } from 'mongoose';
import { Restaurant, IRestaurant } from '../../models/Restaurant';
import { MenuItem } from '../../models/MenuItem';
import { Order } from '../../models/Order';
import { Review } from '../../models/Review';
import { User, hashPassword } from '../../models/User';
import { ApiError } from '../../utils/ApiError';
import { partnerId } from '../../utils/ids';
import { ACTIVE_ORDER_STATUSES } from '../../utils/constants';

interface ListParams {
  q?: string;
  cuisine?: string;
  veg?: 'true' | 'false';
  minRating?: number;
  sort?: 'relevance' | 'rating' | 'deliveryTime' | 'cost';
  lat?: number;
  lng?: number;
  city?: string;
  page: number;
  limit: number;
}

/** Escape user-supplied text so it can be used safely inside a RegExp (avoids crashes on "(", "*", etc.). */
function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function listRestaurants(params: ListParams) {
  const filter: FilterQuery<IRestaurant> = { isApproved: true };
  if (params.city) filter.city = new RegExp(`^${escapeRegex(params.city)}$`, 'i');
  if (params.cuisine) filter.cuisines = { $in: [new RegExp(escapeRegex(params.cuisine), 'i')] };
  if (params.minRating !== undefined) filter.rating = { $gte: params.minRating };

  // Pure-veg filter (PRD FR-DISC-04): keep only restaurants that have no available non-veg item.
  if (params.veg === 'true') {
    const nonVegRestaurantIds = await MenuItem.find({ isVeg: false, available: true }).distinct('restaurant');
    filter._id = { $nin: nonVegRestaurantIds };
  }

  // Keyword search (PRD FR-DISC-03): match restaurant name/cuisine AND restaurants whose
  // menu contains a dish matching the query, so customers can search by food (e.g. "biryani").
  let dishMatch: RegExp | null = null;
  if (params.q) {
    dishMatch = new RegExp(escapeRegex(params.q), 'i');
    const dishRestaurantIds = await MenuItem.find({
      available: true,
      $or: [{ name: dishMatch }, { description: dishMatch }, { category: dishMatch }],
    }).distinct('restaurant');
    filter.$or = [
      { name: dishMatch },
      { cuisines: dishMatch },
      ...(dishRestaurantIds.length ? [{ _id: { $in: dishRestaurantIds } }] : []),
    ];
  }

  // Geospatial discovery (PRD FR-DISC-01/02): only restaurants within ~15km of the user.
  // $geoWithin/$centerSphere (unlike $near) works with pagination + countDocuments.
  if (params.lat !== undefined && params.lng !== undefined) {
    const RADIUS_KM = 15;
    filter.location = {
      $geoWithin: { $centerSphere: [[params.lng, params.lat], RADIUS_KM / 6378.1] },
    };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    rating: { rating: -1 },
    deliveryTime: { avgPrepTimeMins: 1 },
    cost: { priceForTwo: 1 },
    relevance: { rating: -1 },
  };
  const sort = sortMap[params.sort ?? 'relevance'];

  const skip = (params.page - 1) * params.limit;
  const query = Restaurant.find(filter).skip(skip).limit(params.limit).sort(sort);

  const [items, total] = await Promise.all([
    query.lean(),
    Restaurant.countDocuments(filter),
  ]);

  // Surface which dishes matched so the customer app can show "Has: Chicken Biryani, …"
  // under each result (PRD FR-DISC-03) — makes food search visibly useful.
  if (dishMatch && items.length) {
    const matched = await MenuItem.find({
      restaurant: { $in: items.map((r) => r._id) },
      available: true,
      $or: [{ name: dishMatch }, { description: dishMatch }, { category: dishMatch }],
    })
      .select('restaurant name')
      .lean();

    const byRestaurant = new Map<string, string[]>();
    for (const dish of matched) {
      const key = String(dish.restaurant);
      const names = byRestaurant.get(key) ?? [];
      if (names.length < 3 && !names.includes(dish.name)) names.push(dish.name);
      byRestaurant.set(key, names);
    }
    for (const restaurant of items as (typeof items[number] & { matchedDishes?: string[] })[]) {
      restaurant.matchedDishes = byRestaurant.get(String(restaurant._id)) ?? [];
    }
  }

  return { items, total };
}

export async function getRestaurantWithMenu(id: string) {
  const restaurant = await Restaurant.findById(id).lean();
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  const menu = await MenuItem.find({ restaurant: id }).sort({ category: 1, sortOrder: 1 }).lean();

  // Group menu by category for the customer app.
  const categories: Record<string, typeof menu> = {};
  for (const item of menu) {
    (categories[item.category] ??= []).push(item);
  }
  return { restaurant, menu, categories };
}

export async function listReviews(restaurantId: string, limit = 20) {
  return Review.find({ restaurant: restaurantId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate({ path: 'customer', select: 'name avatar' })
    .lean();
}

export async function registerRestaurant(input: {
  ownerName: string;
  email: string;
  password: string;
  phone?: string;
  name: string;
  cuisines: string[];
  address: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
  minOrderValue?: number;
}) {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const restaurant = await Restaurant.create({
    name: input.name,
    partnerId: partnerId(),
    cuisines: input.cuisines,
    address: input.address,
    city: input.city,
    pincode: input.pincode,
    location: { type: 'Point', coordinates: [input.lng ?? 0, input.lat ?? 0] },
    minOrderValue: input.minOrderValue ?? 0,
    isApproved: false, // ops approves later (PRD FR-RST-01)
  });

  const owner = await User.create({
    name: input.ownerName,
    email: input.email,
    phone: input.phone,
    passwordHash: await hashPassword(input.password),
    role: 'restaurant',
    restaurant: restaurant._id,
  });

  restaurant.owner = owner._id as typeof restaurant.owner;
  await restaurant.save();

  return { restaurant: restaurant.toObject(), owner: owner.toJSON() };
}

export async function updateRestaurant(restaurantId: string, updates: Record<string, unknown>) {
  const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, updates, {
    new: true,
    runValidators: true,
  });
  if (!restaurant) throw ApiError.notFound('Restaurant not found');
  return restaurant;
}

/** Dashboard metrics for the restaurant portal home (PRD §screenshots). */
export async function getDashboardStats(restaurantId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [todayAgg, activeCount, avgPrep] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          restaurant: toObjectId(restaurantId),
          createdAt: { $gte: startOfDay },
          status: { $nin: ['pending_payment', 'rejected', 'cancelled'] },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: '$restaurantEarning' },
        },
      },
    ]),
    Order.countDocuments({ restaurant: restaurantId, status: { $in: ACTIVE_ORDER_STATUSES } }),
    Order.aggregate([
      { $match: { restaurant: toObjectId(restaurantId), prepTimeMins: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$prepTimeMins' } } },
    ]),
  ]);

  return {
    todayOrders: todayAgg[0]?.count ?? 0,
    todayRevenue: Math.round((todayAgg[0]?.revenue ?? 0) * 100) / 100,
    activeOrders: activeCount,
    avgPrepTimeMins: Math.round(avgPrep[0]?.avg ?? 0),
  };
}

function toObjectId(id: string) {
  return new Types.ObjectId(id);
}

/** Earnings dashboard for the restaurant portal (revenue trends + daily history + payouts). */
export async function getEarnings(restaurantId: string) {
  const rid = toObjectId(restaurantId);
  const since = new Date();
  since.setDate(since.getDate() - 32);

  const daily = await Order.aggregate([
    {
      $match: {
        restaurant: rid,
        status: { $in: ['delivered', 'out_for_delivery', 'picked_up', 'ready', 'preparing', 'accepted'] },
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orderCount: { $sum: 1 },
        gross: { $sum: '$restaurantEarning' },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  // Treat the most recent 3 days as "pending" payout; older as "paid".
  const history = daily.map((d, idx) => ({
    date: d._id,
    orderCount: d.orderCount,
    grossRevenue: Math.round(d.gross * 100) / 100,
    payoutStatus: idx < 3 ? 'pending' : 'paid',
  }));

  const pendingPayout = Math.round(
    history.filter((h) => h.payoutStatus === 'pending').reduce((s, h) => s + h.grossRevenue, 0) * 100
  ) / 100;
  const lastPayout = Math.round(
    (history.find((h) => h.payoutStatus === 'paid')?.grossRevenue ?? 0) * 100
  ) / 100;

  // Last 7 days for the revenue chart (oldest -> newest).
  const last7 = [...history].slice(0, 7).reverse();

  return { pendingPayout, lastPayout, history, revenueTrend: last7 };
}
