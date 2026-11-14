/**
 * Sliding Window In-Memory & Distributed Rate Limiter
 * 
 * Provides rate-limiting protection for sensitive mutations:
 * - Checkout order submissions (prevent bot spam & fake orders)
 * - Admin login / sensitive actions
 * 
 * Automatically uses Upstash REST API if configured, otherwise falls back
 * to a memory-backed sliding window with automated cleanup.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

// Clean up expired entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 60000);
      if (record.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export interface RateLimitOptions {
  limit: number;      // Maximum allowed requests
  windowMs: number;   // Window in milliseconds (e.g. 60_000 for 1 minute)
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 5, windowMs: 60_000 }
): Promise<RateLimitResult> {
  const { limit, windowMs } = options;
  const now = Date.now();

  // If Upstash Redis is configured in production:
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const response = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", `ratelimit:${identifier}`],
          ["PEXPIRE", `ratelimit:${identifier}`, windowMs],
        ]),
        cache: "no-store",
      });

      if (response.ok) {
        const results = await response.json();
        const currentCount = Number(results[0]?.result) || 1;
        const success = currentCount <= limit;
        return {
          success,
          limit,
          remaining: Math.max(0, limit - currentCount),
          reset: now + windowMs,
        };
      }
    } catch (err) {
      console.warn("[RateLimit] Upstash fallback to in-memory:", err);
    }
  }

  // Resilient sliding-window in-memory fallback
  let record = memoryStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(identifier, record);
  }

  // Filter timestamps within the current window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    return {
      success: false,
      limit,
      remaining: 0,
      reset: oldest + windowMs,
    };
  }

  record.timestamps.push(now);

  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    reset: now + windowMs,
  };
}
