/**
 * IP-based rate limiting.
 *
 * Primary: Upstash Redis (works across Vercel's serverless instances). Enabled
 * automatically when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set.
 *
 * Fallback: an in-memory sliding window. Used when Upstash is not configured or
 * unreachable. Per-instance only, but still throttles abuse in dev / single
 * instance and guarantees the feature never hard-fails the request path.
 */

let limiterPromise = null;

async function getUpstashLimiter() {
  if (limiterPromise) return limiterPromise;

  limiterPromise = (async () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;

    try {
      const [{ Ratelimit }, { Redis }] = await Promise.all([
        import("@upstash/ratelimit"),
        import("@upstash/redis"),
      ]);
      const redis = new Redis({ url, token });
      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "10 m"),
        prefix: "rl:contact",
        analytics: false,
      });
    } catch (err) {
      console.warn("[rateLimit] Upstash unavailable, using in-memory fallback:", err?.message || err);
      return null;
    }
  })();

  return limiterPromise;
}

// In-memory fallback store: key -> array of request timestamps (ms).
const memoryStore = new Map();

function memoryLimit(key, limit, windowMs) {
  const now = Date.now();
  const hits = (memoryStore.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    memoryStore.set(key, hits);
    return { success: false, remaining: 0, reset: hits[0] + windowMs };
  }
  hits.push(now);
  memoryStore.set(key, hits);
  return { success: true, remaining: limit - hits.length, reset: now + windowMs };
}

/**
 * @param {string} identifier  Usually the client IP.
 * @param {{ limit?: number, windowMs?: number }} [opts]
 * @returns {Promise<{ success: boolean, remaining: number, reset: number }>}
 */
export async function rateLimit(identifier, opts = {}) {
  const { limit = 5, windowMs = 10 * 60 * 1000 } = opts;
  const limiter = await getUpstashLimiter();

  if (limiter) {
    try {
      const { success, remaining, reset } = await limiter.limit(identifier);
      return { success, remaining, reset };
    } catch (err) {
      console.warn("[rateLimit] Upstash limit check failed, falling back to memory limit:", err?.message || err);
    }
  }
  return memoryLimit(identifier, limit, windowMs);
}

/**
 * Best-effort client IP extraction for Vercel / proxied environments.
 * @param {Request} request
 * @returns {string}
 */
export function getClientIp(request) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
