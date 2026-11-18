import "server-only";

/**
 * Minimal fixed-window rate limiter (in-memory, per server instance).
 * Good enough for a single Node server; on serverless use a shared store
 * (e.g. Upstash Redis or a Supabase table) — see README.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

function sweep(now: number) {
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
}

/** Count one hit and report whether the caller is still within the limit. */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    sweep(now);
    return { ok: true, retryAfterMs: 0 };
  }
  bucket.count += 1;
  return { ok: bucket.count <= limit, retryAfterMs: bucket.resetAt - now };
}

/** Check without counting (e.g. block a login before verifying credentials). */
export function isRateLimited(key: string, limit: number) {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= Date.now()) return { limited: false, retryAfterMs: 0 };
  return { limited: bucket.count >= limit, retryAfterMs: bucket.resetAt - Date.now() };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

export function clientKeyFromHeaders(h: Headers) {
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim();
}
