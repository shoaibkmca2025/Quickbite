/**
 * Seeds a fully working demo marketplace:
 *   - 1 admin, 2 restaurant owners, 2 customers, 2 riders
 *   - 2 approved restaurants with menus
 *   - 1 platform coupon
 *   - 4 orders spread across the lifecycle, with payments and a review
 *
 * Destructive: every collection is cleared first. Use `npm run seed:accounts` instead if
 * you only want the login accounts on a database that already holds real data.
 *
 * Run: npm run seed
 */
import mongoose, { Types } from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { logger } from '../config/logger';
import { User, hashPassword } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { Coupon } from '../models/Coupon';
import { Order, IOrderItem, IStatusEvent } from '../models/Order';
import { Payment } from '../models/Payment';
import { Review } from '../models/Review';
import { Otp } from '../models/Otp';
import { OrderStatus, PaymentMethod } from '../utils/constants';
import { computeBill } from '../utils/pricing';
import { orderCode, txnRef } from '../utils/ids';

// City centre (Bengaluru) — customers near here will see both restaurants.
const CENTER: [number, number] = [77.5946, 12.9716]; // [lng, lat]

function near([lng, lat]: [number, number], dx = 0, dy = 0): [number, number] {
  return [lng + dx, lat + dy];
}

async function run() {
  await connectDB();
  logger.info('Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Restaurant.deleteMany({}),
    MenuItem.deleteMany({}),
    Coupon.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Review.deleteMany({}),
    Otp.deleteMany({}),
  ]);

  // ----- Admin -----
  const admin = await User.create({
    name: 'Ops Admin',
    email: 'admin@quickbite.test',
    passwordHash: await hashPassword('admin123'),
    role: 'admin',
  });

  // ----- Restaurant 1: Gourmet Kitchen (matches screenshots) -----
  const gourmet = await Restaurant.create({
    name: 'Gourmet Kitchen',
    partnerId: '8821',
    cuisines: ['Continental', 'Seafood', 'Italian'],
    description: 'Chef-crafted plates, fresh every day.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    rating: 4.6,
    ratingCount: 320,
    priceForTwo: 800,
    address: '12 MG Road',
    city: 'Bengaluru',
    pincode: '560001',
    location: { type: 'Point', coordinates: near(CENTER, 0.002, 0.001) },
    isOpen: true,
    isApproved: true,
    minOrderValue: 99,
    avgPrepTimeMins: 18,
  });

  const owner = await User.create({
    name: 'Alex Chef',
    email: 'owner@quickbite.test',
    passwordHash: await hashPassword('owner123'),
    role: 'restaurant',
    restaurant: gourmet._id,
  });
  gourmet.owner = owner._id as typeof gourmet.owner;
  await gourmet.save();

  // ----- Restaurant 2: Spice Route -----
  const spice = await Restaurant.create({
    name: 'Spice Route',
    partnerId: '8822',
    cuisines: ['Indian', 'North Indian', 'Biryani'],
    description: 'Authentic flavours, generous portions.',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
    rating: 4.4,
    ratingCount: 540,
    priceForTwo: 500,
    address: '45 Indiranagar',
    city: 'Bengaluru',
    pincode: '560038',
    location: { type: 'Point', coordinates: near(CENTER, -0.003, 0.002) },
    isOpen: true,
    isApproved: true,
    minOrderValue: 0,
    avgPrepTimeMins: 22,
  });
  const owner2 = await User.create({
    name: 'Ramesh',
    email: 'owner2@quickbite.test',
    passwordHash: await hashPassword('owner123'),
    role: 'restaurant',
    restaurant: spice._id,
  });
  spice.owner = owner2._id as typeof spice.owner;
  await spice.save();

  // ----- Menus -----
  const menuItems = await MenuItem.insertMany([
    {
      restaurant: gourmet._id,
      name: 'Heirloom Bruschetta',
      description: 'Crispy sourdough, vine-ripened heirloom tomatoes, aged balsamic.',
      price: 250,
      category: 'Starters',
      isVeg: true,
      available: true,
      image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600',
      sortOrder: 1,
    },
    {
      restaurant: gourmet._id,
      name: 'Black Truffle Risotto',
      description: 'Arborio rice, wild porcini mushrooms, fresh black truffle.',
      price: 480,
      category: 'Starters',
      isVeg: true,
      available: true,
      image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600',
      sortOrder: 2,
    },
    {
      restaurant: gourmet._id,
      name: 'Grilled Salmon',
      description: 'Atlantic salmon, lemon butter, seasonal greens.',
      price: 490,
      category: 'Mains',
      isVeg: false,
      available: true,
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600',
      sortOrder: 1,
      optionGroups: [
        {
          name: 'Size',
          required: true,
          multi: false,
          choices: [
            { label: 'Regular', priceDelta: 0 },
            { label: 'Large', priceDelta: 120 },
          ],
        },
      ],
    },
    {
      restaurant: gourmet._id,
      name: 'Wagyu Burger',
      description: 'Signature wagyu patty, extra cheese, brioche bun.',
      price: 370,
      category: 'Mains',
      isVeg: false,
      available: true,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
      sortOrder: 2,
      optionGroups: [
        {
          name: 'Add-ons',
          required: false,
          multi: true,
          choices: [
            { label: 'Extra Cheese', priceDelta: 40 },
            { label: 'Bacon', priceDelta: 60 },
          ],
        },
      ],
    },
    {
      restaurant: gourmet._id,
      name: 'Sparkling Water',
      description: 'Chilled, 330ml.',
      price: 80,
      category: 'Beverages',
      isVeg: true,
      available: true,
      sortOrder: 1,
    },
    {
      restaurant: spice._id,
      name: 'Chicken Biryani',
      description: 'Fragrant basmati, slow-cooked chicken, house spices.',
      price: 280,
      category: 'Mains',
      isVeg: false,
      available: true,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600',
      sortOrder: 1,
    },
    {
      restaurant: spice._id,
      name: 'Paneer Butter Masala',
      description: 'Cottage cheese in a rich tomato-cashew gravy.',
      price: 240,
      category: 'Mains',
      isVeg: true,
      available: true,
      sortOrder: 2,
    },
    {
      restaurant: spice._id,
      name: 'Garlic Naan',
      description: 'Tandoor-baked, brushed with garlic butter.',
      price: 60,
      category: 'Sides',
      isVeg: true,
      available: true,
      sortOrder: 1,
    },
    {
      restaurant: spice._id,
      name: 'Gulab Jamun',
      description: 'Two pieces, warm sugar syrup.',
      price: 90,
      category: 'Desserts',
      isVeg: true,
      available: false, // demo sold-out item
      sortOrder: 1,
    },
  ]);

  // ----- Customers -----
  const aarav = await User.create({
    name: 'Aarav',
    phone: '9000000001',
    email: 'user@quickbite.test',
    passwordHash: await hashPassword('user123'),
    role: 'customer',
    addresses: [
      {
        label: 'Home',
        line: '244 Oakwood Ave',
        city: 'Bengaluru',
        pincode: '560001',
        lat: CENTER[1],
        lng: CENTER[0],
        isDefault: true,
      },
    ],
  });
  const sneha = await User.create({
    name: 'Sneha',
    phone: '9000000002',
    role: 'customer',
    addresses: [
      {
        label: 'Hostel',
        line: 'Block C, University Rd',
        city: 'Bengaluru',
        pincode: '560038',
        lat: CENTER[1] + 0.002,
        lng: CENTER[0] - 0.003,
        isDefault: true,
      },
    ],
  });

  // ----- Riders -----
  const deepak = await User.create({
    name: 'Deepak',
    phone: '9000000003',
    email: 'rider@quickbite.test',
    passwordHash: await hashPassword('rider123'),
    role: 'rider',
    rider: { status: 'online', vehicle: 'Bike', area: 'MG Road', rating: 4.8, totalTrips: 320 },
  });
  await User.create({
    name: 'Vijay',
    phone: '9000000004',
    role: 'rider',
    rider: { status: 'offline', vehicle: 'Scooter', area: 'Indiranagar', rating: 4.6, totalTrips: 150 },
  });

  // ----- Coupon -----
  await Coupon.create({
    code: 'WELCOME50',
    description: 'Flat ₹50 off your first order',
    type: 'flat',
    value: 50,
    minOrderValue: 199,
    perUserLimit: 1,
    active: true,
  });

  // ----- Orders -----
  // One order per lifecycle stage, so no screen is empty on a fresh database:
  //   delivered         -> customer history, rider earnings, admin revenue
  //   out_for_delivery  -> the rider active job + customer live tracking
  //   ready (no rider)  -> the pool of jobs a rider can accept
  //   placed            -> the restaurant portal inbox
  const FLOW: OrderStatus[] = [
    'placed',
    'accepted',
    'preparing',
    'ready',
    'assigned',
    'picked_up',
    'out_for_delivery',
    'delivered',
  ];

  const ACTOR: Record<string, string> = {
    placed: 'customer',
    accepted: 'restaurant',
    preparing: 'restaurant',
    ready: 'restaurant',
    assigned: 'admin',
    picked_up: 'rider',
    out_for_delivery: 'rider',
    delivered: 'rider',
  };

  const minutesAgo = (mins: number) => new Date(Date.now() - mins * 60_000);

  const menuItemByName = (name: string) => {
    const item = menuItems.find((m) => m.name === name);
    if (!item) throw new Error(`Seed error: no menu item named "${name}"`);
    return item;
  };

  /** Replays the status chain up to `target` so the tracking timeline has real timestamps. */
  function historyUpTo(target: OrderStatus, placedAt: Date): IStatusEvent[] {
    const upto = FLOW.slice(0, FLOW.indexOf(target) + 1);
    return upto.map((status, i) => ({
      status,
      at: new Date(placedAt.getTime() + i * 4 * 60_000),
      by: ACTOR[status],
    }));
  }

  async function createOrder(opts: {
    customer: typeof aarav;
    restaurant: typeof gourmet;
    lines: Array<{ name: string; quantity: number; addonsTotal?: number; options?: IOrderItem['options'] }>;
    status: OrderStatus;
    rider?: typeof deepak;
    placedMinsAgo: number;
    paymentMethod: PaymentMethod;
    discount?: number;
  }) {
    const placedAt = minutesAgo(opts.placedMinsAgo);

    const items: IOrderItem[] = opts.lines.map((line) => {
      const menuItem = menuItemByName(line.name);
      const addons = line.addonsTotal ?? 0;
      return {
        menuItem: menuItem._id as Types.ObjectId,
        name: menuItem.name,
        unitPrice: menuItem.price,
        quantity: line.quantity,
        options: line.options ?? [],
        lineTotal: (menuItem.price + addons) * line.quantity,
        isVeg: menuItem.isVeg,
      };
    });

    const bill = computeBill(
      opts.lines.map((line) => ({
        price: menuItemByName(line.name).price,
        quantity: line.quantity,
        addonsTotal: line.addonsTotal,
      })),
      { discount: opts.discount }
    );

    const address = opts.customer.addresses[0];
    const isDelivered = opts.status === 'delivered';

    // Keep the completed order inside the current local day. Rider earnings and the admin
    // daily figures bucket by local midnight, so a seed run just after midnight would
    // otherwise show zero for "today" and look broken.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const deliveredAt = isDelivered
      ? new Date(
          Math.min(
            Math.max(placedAt.getTime() + 38 * 60_000, startOfToday.getTime() + 5 * 60_000),
            Date.now() - 5 * 60_000
          )
        )
      : undefined;

    const statusHistory = historyUpTo(opts.status, placedAt);
    if (deliveredAt) statusHistory[statusHistory.length - 1].at = deliveredAt;

    // COD is only collected on handover, so it stays pending until the order is delivered.
    const paymentStatus =
      opts.paymentMethod === 'cod' ? (isDelivered ? 'paid' : 'pending') : 'paid';

    const order = await Order.create({
      code: orderCode(),
      customer: opts.customer._id,
      restaurant: opts.restaurant._id,
      rider: opts.rider?._id,
      items,
      itemTotal: bill.itemTotal,
      packagingFee: bill.packagingFee,
      deliveryFee: bill.deliveryFee,
      tax: bill.tax,
      discount: bill.discount,
      grandTotal: bill.grandTotal,
      commission: bill.commission,
      restaurantEarning: bill.restaurantEarning,
      ...(opts.discount ? { coupon: { code: 'WELCOME50', discount: opts.discount } } : {}),
      deliveryAddress: {
        label: address.label,
        line: address.line,
        city: address.city,
        pincode: address.pincode,
        lat: address.lat,
        lng: address.lng,
      },
      paymentMethod: opts.paymentMethod,
      paymentStatus,
      status: opts.status,
      statusHistory,
      prepTimeMins: opts.restaurant.avgPrepTimeMins,
      etaAt: new Date(placedAt.getTime() + 40 * 60_000),
      placedAt,
      ...(deliveredAt ? { deliveredAt } : {}),
    });

    const payment = await Payment.create({
      order: order._id,
      customer: opts.customer._id,
      amount: bill.grandTotal,
      method: opts.paymentMethod,
      status: paymentStatus,
      gatewayRef: txnRef(),
    });
    order.payment = payment._id as Types.ObjectId;
    await order.save();

    return order;
  }

  const deliveredOrder = await createOrder({
    customer: aarav,
    restaurant: gourmet,
    lines: [
      { name: 'Grilled Salmon', quantity: 1, addonsTotal: 120, options: [{ groupName: 'Size', label: 'Large', priceDelta: 120 }] },
      { name: 'Sparkling Water', quantity: 2 },
    ],
    status: 'delivered',
    rider: deepak,
    placedMinsAgo: 180,
    paymentMethod: 'upi',
    discount: 50,
  });

  await createOrder({
    customer: aarav,
    restaurant: gourmet,
    lines: [
      { name: 'Wagyu Burger', quantity: 1, addonsTotal: 40, options: [{ groupName: 'Add-ons', label: 'Extra Cheese', priceDelta: 40 }] },
      { name: 'Heirloom Bruschetta', quantity: 1 },
    ],
    status: 'out_for_delivery',
    rider: deepak,
    placedMinsAgo: 22,
    paymentMethod: 'card',
  });

  // No rider assigned — this is what shows up in the rider available-jobs list.
  await createOrder({
    customer: sneha,
    restaurant: spice,
    lines: [
      { name: 'Chicken Biryani', quantity: 2 },
      { name: 'Garlic Naan', quantity: 3 },
    ],
    status: 'ready',
    placedMinsAgo: 12,
    paymentMethod: 'cod',
  });

  // Fresh order waiting for the restaurant to accept.
  await createOrder({
    customer: sneha,
    restaurant: spice,
    lines: [{ name: 'Paneer Butter Masala', quantity: 1 }, { name: 'Garlic Naan', quantity: 2 }],
    status: 'placed',
    placedMinsAgo: 3,
    paymentMethod: 'upi',
  });

  // ----- Review on the completed order -----
  const review = await Review.create({
    order: deliveredOrder._id,
    customer: aarav._id,
    restaurant: gourmet._id,
    rider: deepak._id,
    foodRating: 5,
    deliveryRating: 5,
    comment: 'Salmon was perfectly cooked and it arrived hot. Rider was quick.',
  });
  deliveredOrder.rating = review._id as Types.ObjectId;
  await deliveredOrder.save();

  const [restaurants, items, orders] = await Promise.all([
    Restaurant.countDocuments(),
    MenuItem.countDocuments(),
    Order.countDocuments(),
  ]);

  logger.info('Seed complete ✔');
  logger.info(`Data: ${restaurants} restaurants, ${items} menu items, ${orders} orders, 1 coupon`);
  logger.info('--- Demo credentials ---');
  logger.info('Admin (web):       admin@quickbite.test / admin123');
  logger.info('Customer (mobile): user@quickbite.test  / user123    (or phone 9000000001 + OTP)');
  logger.info('Rider (mobile):    rider@quickbite.test / rider123   (or phone 9000000003 + OTP)');
  logger.info('Restaurant (web):  owner@quickbite.test / owner123   (Gourmet Kitchen)');
  logger.info('Restaurant 2:      owner2@quickbite.test / owner123  (Spice Route)');
  logger.info('Customer (OTP):    phone 9000000002  (OTP printed in API logs)');
  logger.info(`Admin user id:     ${admin._id}`);

  await disconnectDB();
  await mongoose.connection.close();
}

run().catch(async (err) => {
  logger.error('Seed failed', err);
  await disconnectDB();
  process.exit(1);
});
