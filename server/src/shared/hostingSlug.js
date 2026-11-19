import { RESERVED_SUBDOMAINS } from './reservedSubdomains.js';
import { ApiError } from './errors.js';

const MIN_LENGTH = 3;
const MAX_LENGTH = 63;
const PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

/** Trim and lowercase. Returns '' for non-strings. */
export function normalizeSlug(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/** Returns a reason string when the slug is unusable, otherwise null. */
export function slugProblem(value) {
  const slug = normalizeSlug(value);
  if (slug.length < MIN_LENGTH) return `Use at least ${MIN_LENGTH} characters.`;
  if (slug.length > MAX_LENGTH) return `Use at most ${MAX_LENGTH} characters.`;
  if (!PATTERN.test(slug)) return 'Use lowercase letters, numbers and single hyphens; start and end with a letter or number.';
  if (slug.includes('--')) return 'Double hyphens are not allowed.';
  if (RESERVED_SUBDOMAINS.has(slug)) return 'This name is reserved.';
  return null;
}

/** Normalizes and validates, throwing a 400 ApiError on failure. */
export function assertValidSlug(value) {
  const problem = slugProblem(value);
  if (problem) throw new ApiError(400, problem);
  return normalizeSlug(value);
}
