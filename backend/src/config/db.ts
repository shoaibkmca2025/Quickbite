import dns from 'dns/promises';
import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

mongoose.set('strictQuery', true);

const MAX_ATTEMPTS = 4;
const BASE_RETRY_MS = 1500;

/** Never let credentials reach the logs. */
export function redactUri(uri: string): string {
  return uri.replace(/\/\/[^@/]+@/, '//***:***@');
}

/** The host portion of a connection string, e.g. "cluster0.abcde.mongodb.net". */
function hostOf(uri: string): string {
  const match = /^mongodb(?:\+srv)?:\/\/(?:[^@/]+@)?([^/?,]+)/i.exec(uri);
  return match ? match[1] : 'unknown-host';
}

function isSrv(uri: string): boolean {
  return /^mongodb\+srv:\/\//i.test(uri);
}

function message(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * A failed SRV lookup is ambiguous: either the cluster hostname does not exist, or the
 * platform's resolver is broken. Probing a hostname we know is live separates the two,
 * which is the difference between "fix your MONGODB_URI" and "retry the deploy".
 */
async function diagnoseDns(uri: string): Promise<string> {
  const host = hostOf(uri);
  try {
    await dns.resolveSrv(`_mongodb._tcp.${host}`);
    return `DNS now resolves "${host}" — the earlier failure looks transient.`;
  } catch (hostErr) {
    try {
      await dns.resolve('mongodb.com');
      return (
        `DNS is working (mongodb.com resolves) but has no SRV record for "${host}" ` +
        `(${message(hostErr)}). That hostname does not exist.`
      );
    } catch {
      return `DNS lookups are failing for every hostname, not just "${host}" — this is a network/resolver problem, not a bad URI.`;
    }
  }
}

/** Turn a driver error into something the person reading the deploy log can act on. */
async function explain(err: unknown, uri: string): Promise<string[]> {
  const msg = message(err);
  const host = hostOf(uri);

  if (msg.includes('querySrv') || (msg.includes('ENOTFOUND') && isSrv(uri))) {
    return [
      `The SRV hostname "${host}" could not be resolved.`,
      await diagnoseDns(uri),
      'Most likely the Atlas cluster was deleted, renamed, or paused-then-recreated, so MONGODB_URI points at a hostname that no longer exists.',
      'Fix: MongoDB Atlas → Database → Connect → Drivers → copy the current connection string, then update MONGODB_URI in the Render dashboard and redeploy.',
    ];
  }

  if (msg.includes('ENOTFOUND') || msg.includes('EAI_AGAIN')) {
    return [
      `The hostname "${host}" could not be resolved.`,
      'Check MONGODB_URI for a typo, and that the value has no stray quotes or line breaks.',
    ];
  }

  if (/authentication failed/i.test(msg) || msg.includes('bad auth')) {
    return [
      'The cluster was reached but rejected the credentials.',
      'Check the database user and password in MONGODB_URI. If the password contains @ : / ? # [ ] %, it must be percent-encoded.',
      'Also confirm the <db_password> placeholder from the Atlas UI was actually replaced.',
    ];
  }

  if (/server selection timed out|ETIMEDOUT|connection timed out/i.test(msg)) {
    return [
      `Reached DNS for "${host}" but no server accepted a connection before the timeout.`,
      "Most often this is the Atlas IP access list: Render's outbound IPs are not static, so add 0.0.0.0/0 under Atlas → Network Access (or add Render's static outbound IPs on a paid plan).",
      'It can also mean the cluster is paused — resume it in Atlas.',
    ];
  }

  return [`Unrecognised connection error: ${msg}`];
}

/** Credentials are wrong no matter how many times we ask, so stop immediately. */
function isPermanent(err: unknown): boolean {
  const msg = message(err);
  return /authentication failed/i.test(msg) || msg.includes('bad auth');
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = env.mongoUri;
  logger.info(`Connecting to MongoDB at ${redactUri(uri)}`);

  let lastErr: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000,
      });
      logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      lastErr = err;

      if (isPermanent(err) || attempt === MAX_ATTEMPTS) break;

      // Exponential backoff, so a slow-to-wake cluster or a brief DNS blip does not
      // fail the whole deploy.
      const delay = BASE_RETRY_MS * 2 ** (attempt - 1);
      logger.warn(
        `MongoDB connection attempt ${attempt}/${MAX_ATTEMPTS} failed (${message(err)}). Retrying in ${delay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  logger.error(`MongoDB connection failed after ${MAX_ATTEMPTS} attempt(s)`, message(lastErr));
  for (const line of await explain(lastErr, uri)) {
    logger.error(`  → ${line}`);
  }
  throw lastErr;
}

export function dbState(): 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'unknown' {
  return (
    (
      {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
      } as const
    )[mongoose.connection.readyState as 0 | 1 | 2 | 3] ?? 'unknown'
  );
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
