import { ApiError } from './errors.js';

// Small in-process limiter for expensive, authenticated endpoints.
//
// Counters live in the instance's memory, so the limit is per warm Lambda
// container rather than global. That is deliberate: it stops double-clicks and
// accidental loops without adding a store or a dependency. The database-level
// claim in the pipelines is what prevents duplicate paid work.

const MAX_TRACKED_KEYS = 5_000;

export function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map();

  function sweep(now) {
    if (hits.size < MAX_TRACKED_KEYS) return;
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }

  return function rateLimit(req, _res, next) {
    const key = String(req.user?._id ?? req.ip ?? 'anonymous');
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      sweep(now);
      next();
      return;
    }

    entry.count += 1;
    if (entry.count > max) {
      next(new ApiError(429, message));
      return;
    }

    next();
  };
}
