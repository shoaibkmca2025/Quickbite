/**
 * Creates (or updates) the three demo login accounts without touching any other data.
 *
 * Unlike `npm run seed`, this script is idempotent and NON-destructive — it never clears a
 * collection, so it is safe to run against a database that already has real orders in it.
 * Re-running it just resets the passwords.
 *
 * Run: npm run seed:accounts
 */
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { logger } from '../config/logger';
import { User, hashPassword } from '../models/User';
import { Role } from '../utils/constants';

interface AccountSpec {
  label: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  /** Extra fields applied only when the account is first created. */
  onCreate?: Record<string, unknown>;
}

const ACCOUNTS: AccountSpec[] = [
  {
    label: 'Admin (web portal)',
    name: 'Ops Admin',
    email: 'admin@quickbite.test',
    password: 'admin123',
    role: 'admin',
  },
  {
    label: 'Customer (mobile app)',
    name: 'Aarav',
    email: 'user@quickbite.test',
    password: 'user123',
    phone: '9000000001',
    role: 'customer',
    onCreate: {
      addresses: [
        {
          label: 'Home',
          line: '244 Oakwood Ave',
          city: 'Bengaluru',
          pincode: '560001',
          lat: 12.9716,
          lng: 77.5946,
          isDefault: true,
        },
      ],
    },
  },
  {
    label: 'Rider (mobile app)',
    name: 'Deepak',
    email: 'rider@quickbite.test',
    password: 'rider123',
    phone: '9000000003',
    role: 'rider',
    onCreate: {
      rider: { status: 'online', vehicle: 'Bike', area: 'MG Road', rating: 4.8, totalTrips: 320 },
    },
  },
];

async function upsert(spec: AccountSpec) {
  // Match on email first, then phone, so an account seeded earlier with only a phone number
  // gains a password instead of becoming a duplicate.
  const existing =
    (await User.findOne({ email: spec.email })) ??
    (spec.phone ? await User.findOne({ phone: spec.phone }) : null);

  const passwordHash = await hashPassword(spec.password);

  if (existing) {
    existing.name = spec.name;
    existing.email = spec.email;
    existing.role = spec.role;
    existing.passwordHash = passwordHash;
    existing.isActive = true;
    if (spec.phone) existing.phone = spec.phone;
    if (spec.role === 'rider' && !existing.rider) {
      existing.rider = { status: 'offline', rating: 5, totalTrips: 0 };
    }
    await existing.save();
    return { user: existing, created: false };
  }

  const user = await User.create({
    name: spec.name,
    email: spec.email,
    phone: spec.phone,
    role: spec.role,
    passwordHash,
    ...spec.onCreate,
  });
  return { user, created: true };
}

async function run() {
  await connectDB();

  const rows: Array<{ label: string; email: string; password: string; action: string }> = [];
  for (const spec of ACCOUNTS) {
    const { user, created } = await upsert(spec);
    rows.push({
      label: spec.label,
      email: spec.email,
      password: spec.password,
      action: created ? 'created' : 'updated',
    });
    logger.info(`${created ? 'Created' : 'Updated'} ${spec.role}: ${spec.email} (${user._id})`);
  }

  logger.info('');
  logger.info('--- Login credentials ---');
  for (const r of rows) {
    logger.info(`${r.label.padEnd(24)} ${r.email.padEnd(24)} ${r.password.padEnd(10)} (${r.action})`);
  }
  logger.info('');
  logger.info('Change these before exposing the deployment publicly.');

  await disconnectDB();
  await mongoose.connection.close();
}

run().catch(async (err) => {
  logger.error('Account seeding failed', err instanceof Error ? err.message : err);
  await disconnectDB();
  process.exit(1);
});
