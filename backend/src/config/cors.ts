import { env } from './env';

/**
 * Origin allow-listing for both the REST API (cors middleware) and Socket.IO.
 *
 * Supports:
 *  - exact origins:      https://quickbite-app.vercel.app
 *  - single-label wildcards: https://*.vercel.app  (matches any *.vercel.app preview URL)
 *  - "*"                 allow any origin (reflected, so it still works with credentials)
 *
 * Origins are normalised in env.ts (trimmed, trailing slash stripped, scheme added).
 */
type OriginMatcher = (origin: string) => boolean;

function compile(pattern: string): OriginMatcher {
  if (pattern === '*') return () => true;
  if (pattern.includes('*')) {
    // Escape regex specials, then turn "*" into "[^.]+" (one DNS label, e.g. a Vercel subdomain).
    const source = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^.]+');
    const re = new RegExp(`^${source}$`);
    return (origin) => re.test(origin);
  }
  return (origin) => origin === pattern;
}

const matchers = env.clientOrigins.map(compile);
export const allowAllOrigins = env.clientOrigins.includes('*');

export function isAllowedOrigin(origin?: string): boolean {
  // Same-origin and non-browser clients (curl, health checks) send no Origin header.
  if (!origin) return true;
  if (allowAllOrigins) return true;
  return matchers.some((m) => m(origin));
}

/** cors-package origin callback, shared by Express and Socket.IO. */
export function corsOrigin(
  origin: string | undefined,
  cb: (err: Error | null, allow?: boolean) => void
): void {
  cb(null, isAllowedOrigin(origin));
}
