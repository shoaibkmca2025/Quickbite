import bcrypt from 'bcryptjs';
import { Otp } from '../../models/Otp';
import { User, IUser } from '../../models/User';
import { ApiError } from '../../utils/ApiError';
import { generateOtp, sendOtpSms } from '../../utils/otp';
import { env } from '../../config/env';
import { issueTokens, verifyRefreshToken } from '../../utils/jwt';
import { Role } from '../../utils/constants';

const MAX_OTP_ATTEMPTS = 5;

export async function requestOtp(phone: string): Promise<{ devCode?: string }> {
  const code = generateOtp();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + env.otp.ttlSeconds * 1000);

  // Replace any existing OTP for this phone.
  await Otp.findOneAndUpdate(
    { phone },
    { phone, codeHash, attempts: 0, expiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await sendOtpSms(phone, code);

  // Only expose the code in dev so the mobile app can auto-fill / display it.
  return env.otp.devMode ? { devCode: code } : {};
}

export async function verifyOtp(input: {
  phone: string;
  code: string;
  name?: string;
  role?: Extract<Role, 'customer' | 'rider'>;
}) {
  const record = await Otp.findOne({ phone: input.phone });
  if (!record) throw ApiError.badRequest('No OTP requested for this number, or it expired');
  if (record.expiresAt < new Date()) {
    await record.deleteOne();
    throw ApiError.badRequest('OTP expired, please request a new one');
  }
  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await record.deleteOne();
    throw ApiError.badRequest('Too many attempts, please request a new OTP');
  }

  const valid = await bcrypt.compare(input.code, record.codeHash);
  if (!valid) {
    record.attempts += 1;
    await record.save();
    throw ApiError.badRequest('Incorrect OTP');
  }

  await record.deleteOne();

  // Find or create the user.
  let user = await User.findOne({ phone: input.phone });
  if (!user) {
    const role = input.role ?? 'customer';
    user = await User.create({
      phone: input.phone,
      name: input.name ?? 'QuickBite User',
      role,
      ...(role === 'rider'
        ? { rider: { status: 'offline', rating: 5, totalTrips: 0 } }
        : {}),
    });
  } else if (input.name && user.name === 'QuickBite User') {
    user.name = input.name;
    await user.save();
  }

  const tokens = issueTokens({ sub: String(user._id), role: user.role });
  return { user: user.toJSON(), ...tokens };
}

export async function passwordLogin(email: string, password: string) {
  const user = await User.findOne({ email }).select('+passwordHash').populate('restaurant');
  if (!user || !user.passwordHash) throw ApiError.unauthorized('Invalid email or password');
  const match = await user.comparePassword(password);
  if (!match) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.forbidden('Account is suspended');

  const restaurantId = user.restaurant ? String((user.restaurant as { _id: unknown })._id) : undefined;
  const tokens = issueTokens({ sub: String(user._id), role: user.role, restaurantId });
  return { user: user.toJSON(), ...tokens };
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized('Account not found or inactive');
  const tokens = issueTokens({
    sub: payload.sub,
    role: payload.role,
    restaurantId: payload.restaurantId,
  });
  return tokens;
}

export async function getMe(userId: string): Promise<IUser | null> {
  return User.findById(userId).populate('restaurant');
}
