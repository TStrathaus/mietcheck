// Rate Limiting Library with Alert Support
import { LRUCache } from 'lru-cache';
import { alerts } from './alerts';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        // Alert on rate limit exceeded (only once per token per interval)
        if (isRateLimited && tokenCount[0] === limit) {
          alerts.rateLimitExceeded(token).catch(console.error);
        }

        return isRateLimited ? reject() : resolve();
      }),
  };
}

/**
 * Simple rate limiter for API routes
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): { allowed: boolean; headers: Record<string, string> } {
  const rateLimitMap = (global as any).__rateLimitMap || new Map();
  (global as any).__rateLimitMap = rateLimitMap;

  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': (limit - 1).toString(),
        'X-RateLimit-Reset': Math.ceil((now + windowMs) / 1000).toString(),
      },
    };
  }

  if (record.count >= limit) {
    // Alert on first rate limit hit
    if (record.count === limit) {
      alerts.rateLimitExceeded(identifier).catch(console.error);
    }

    return {
      allowed: false,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString(),
        'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
      },
    };
  }

  record.count++;

  return {
    allowed: true,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': (limit - record.count).toString(),
      'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString(),
    },
  };
}
