interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const ipRequestCounts = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipRequestCounts.entries()) {
      if (now > record.resetTime) {
        ipRequestCounts.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  timer.unref?.();
}

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

/**
 * Checks if a request from a client identifier is within rate limits.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 30, windowMs: 60 * 1000 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const existing = ipRequestCounts.get(identifier);

  if (!existing || now > existing.resetTime) {
    ipRequestCounts.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetTime: now + config.windowMs,
    };
  }

  if (existing.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: config.limit - existing.count,
    resetTime: existing.resetTime,
  };
}

/**
 * Extracts a safe client identifier (IP) from request headers.
 */
export function getClientIdentifier(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
