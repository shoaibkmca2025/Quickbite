import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function bool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return raw.toLowerCase() === 'true';
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: num('PORT', 4000),
  // Allowed browser origins for CORS (REST + Socket.IO). We normalise each entry so common
  // mistakes don't silently block requests:
  //  - strip trailing slashes (the browser's Origin header never has one)
  //  - add "https://" if the scheme is missing (so "foo.vercel.app" works like the full URL)
  // Wildcards (e.g. "https://*.vercel.app") and "*" are passed through. See config/cors.ts.
  clientOrigins: (process.env.CLIENT_ORIGINS ?? '*')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean)
    .map((o) => (o === '*' || o.includes('://') ? o : `https://${o}`)),

  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/quickbite'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev-access-secret'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '30d',
  },

  otp: {
    devMode: bool('OTP_DEV_MODE', true),
    ttlSeconds: num('OTP_TTL_SECONDS', 300),
  },

  payment: {
    devMode: bool('PAYMENT_DEV_MODE', true),
  },

  pricing: {
    deliveryFee: num('DEFAULT_DELIVERY_FEE', 29),
    packagingFee: num('PACKAGING_FEE', 10),
    taxRate: num('TAX_RATE', 0.05),
    commissionRate: num('PLATFORM_COMMISSION_RATE', 0.15),
  },
};

export type Env = typeof env;
