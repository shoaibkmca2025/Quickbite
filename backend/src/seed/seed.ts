/**
 * Seeds a fully working demo marketplace:
 *   - 1 admin, 1 restaurant owner, 2 customers, 2 riders
 *   - 2 approved restaurants with menus
 *   - 1 platform coupon
 *
 * Run: npm run seed
 */
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { logger } from '../config/logger';
import { User, hashPassword } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { Coupon } from '../models/Coupon';
import { Order } from '../models/Order';
import { Payment } from '../models/Payment';
import { Review } from '../models/Review';
import { Otp } from '../models/Otp';

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
  await MenuItem.insertMany([
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
  await User.create({
    name: 'Aarav',
    phone: '9000000001',
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
  await User.create({
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
  await User.create({
    name: 'Deepak',
    phone: '9000000003',
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

  logger.info('Seed complete ✔');
  logger.info('--- Demo credentials ---');
  logger.info('Admin (web):       admin@quickbite.test / admin123');
  logger.info('Restaurant (web):  owner@quickbite.test / owner123   (Gourmet Kitchen)');
  logger.info('Restaurant 2:      owner2@quickbite.test / owner123  (Spice Route)');
  logger.info('Customer (mobile): phone 9000000001  (OTP printed in API logs)');
  logger.info('Customer (mobile): phone 9000000002');
  logger.info('Rider (mobile):    phone 9000000003  (online)');
  logger.info(`Admin user id:     ${admin._id}`);

  await disconnectDB();
  await mongoose.connection.close();
}

run().catch(async (err) => {
  logger.error('Seed failed', err);
  await disconnectDB();
  process.exit(1);
});
