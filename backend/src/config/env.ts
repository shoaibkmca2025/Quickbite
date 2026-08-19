import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

/**
 * Values pasted into a hosting dashboard often arrive wrapped in quotes or with a trailing
 * newline. Those characters end up inside hostnames and secrets and surface later as
 * confusing DNS or auth errors, so strip them before anything reads the value. An empty
 * value is treated as unset rather than as a valid empty string.
 */
function read(name: string): string | undefined {
  const raw = process.env[name];
  if (raw === undefined) return undefined;
  let cleaned = raw.trim();
  const quote = cleaned[0];
  if ((quote === '"' || quote === "'") && cleaned.length > 1 && cleaned.endsWith(quote)) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned === '' ? undefined : cleaned;
}

/**
 * The fallback is a development convenience only. In production a missing value is a
 * misconfiguration — booting with a localhost database or a well-known "dev" JWT secret is
 * worse than refusing to start, so production requires the variable to be set explicitly.
 */
function required(name: string, devFallback?: string): string {
  const value = read(name) ?? (isProd ? undefined : devFallback);
  if (value === undefined) {
    throw new Error(
      isProd
        ? `Missing required environment variable: ${name}. Set it in your host's dashboard (Render → the service → Environment) and redeploy.`
        : `Missing required environment variable: ${name}`,
    );
  }
  return value;
}

function num(name: string, fallback: number): number {
  const raw = read(name);
  if (raw === undefined) return fallback;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function bool(name: string, fallback: boolean): boolean {
  const raw = read(name);
  if (raw === undefined) return fallback;
  return raw.toLowerCase() === 'true';
}

/** Catch the mistakes that produce unreadable driver errors much later in startup. */
function mongoUri(): string {
  const uri = required('MONGODB_URI', 'mongodb://127.0.0.1:27017/quickbite');

  if (!/^mongodb(\+srv)?:\/\//i.test(uri)) {
    throw new Error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://".');
  }
  if (/<[^>]+>/.test(uri)) {
    throw new Error(
      'MONGODB_URI still contains an Atlas placeholder such as <db_password>. Replace it with the real value.',
    );
  }
  if (isProd && /(127\.0\.0\.1|localhost)/.test(uri)) {
    throw new Error(
      'MONGODB_URI points at localhost in production. Set it to your MongoDB Atlas connection string.',
    );
  }
  return uri;
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
  clientOrigins: (read('CLIENT_ORIGINS') ?? '*')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean)
    .map((o) => (o === '*' || o.includes('://') ? o : `https://${o}`)),

  mongoUri: mongoUri(),

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
