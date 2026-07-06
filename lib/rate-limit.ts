import "server-only";
import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import type { Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitOptions = {
  namespace: string;
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const storeSymbol = Symbol.for("furniture-showroom.rate-limit-store");
const maxBuckets = 5000;

type RateLimitStore = Map<string, RateLimitBucket>;

const globalWithRateLimit = globalThis as typeof globalThis & {
  [storeSymbol]?: RateLimitStore;
};

const memoryStore = globalWithRateLimit[storeSymbol] ?? new Map<string, RateLimitBucket>();
globalWithRateLimit[storeSymbol] = memoryStore;

// Lazy Redis ratelimiters (one per namespace, created only when UPSTASH_REDIS_REST_URL is set)
const redisRatelimitCache = new Map<string, Ratelimit>();

if (process.env.NODE_ENV === "production" && !process.env.UPSTASH_REDIS_REST_URL) {
  console.warn("[rate-limit] UPSTASH_REDIS_REST_URL not set — using in-memory rate limiting (per-instance, resets on cold start)");
}

function msToDuration(ms: number): Duration {
  if (ms < 1_000) return `${ms}ms`;
  if (ms < 60_000) return `${Math.floor(ms / 1_000)} s`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)} m`;
  return `${Math.floor(ms / 3_600_000)} h`;
}

function getRedisRatelimit(namespace: string, limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${namespace}:${limit}:${windowMs}`;
  const cached = redisRatelimitCache.get(cacheKey);
  if (cached) return cached;

  const rl = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, msToDuration(windowMs)),
    prefix: `rl:${namespace}`,
  });
  redisRatelimitCache.set(cacheKey, rl);
  return rl;
}

export async function checkRateLimit({ namespace, key, limit, windowMs }: RateLimitOptions): Promise<RateLimitResult> {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const rl = getRedisRatelimit(namespace, limit, windowMs);
      const result = await rl.limit(key);
      return {
        allowed: result.success,
        remaining: result.remaining,
        retryAfterMs: Math.max(0, result.reset - Date.now()),
      };
    } catch {
      console.warn("[rate-limit] Redis unavailable, falling back to in-memory");
    }
  }

  const now = Date.now();
  cleanupExpiredBuckets(now);

  const storeKey = `${namespace}:${key}`;
  const bucket = memoryStore.get(storeKey);

  if (!bucket || bucket.resetAt <= now) {
    memoryStore.set(storeKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(0, limit - 1), retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, bucket.resetAt - now) };
  }

  bucket.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - bucket.count), retryAfterMs: Math.max(0, bucket.resetAt - now) };
}

export function getClientRateLimitKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const ip = forwardedFor || realIp || "unknown";
  return createHash("sha256").update(ip).digest("base64url");
}

export async function readJsonWithLimit(request: Request, maxBytes: number) {
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    return { ok: false as const, status: 413, error: "payload_too_large" };
  }

  try {
    return { ok: true as const, data: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false as const, status: 400, error: "invalid_json" };
  }
}

function cleanupExpiredBuckets(now: number) {
  if (memoryStore.size <= maxBuckets * 0.8) return;

  const threshold = now - 60000;
  for (const [key, bucket] of memoryStore) {
    if (bucket.resetAt < threshold) {
      memoryStore.delete(key);
      if (memoryStore.size <= maxBuckets * 0.7) break;
    }
  }

  if (memoryStore.size > maxBuckets) {
    let removed = 0;
    const overflow = memoryStore.size - maxBuckets;
    for (const key of memoryStore.keys()) {
      memoryStore.delete(key);
      removed += 1;
      if (removed >= overflow) break;
    }
  }
}
