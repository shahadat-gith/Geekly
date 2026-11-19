import { ApiError } from '../../../shared/errors.js';

// A worker that dies mid-run leaves its document in PROCESSING. Pipelines update
// the document while work is happening, so a document untouched for this long
// is stale and may be claimed by the next delivery.

export const STALE_AFTER_MS = 10 * 60 * 1000;

export function staleBefore() {
  return new Date(Date.now() - STALE_AFTER_MS);
}

/** Configuration and provider messages are shown; anything else is generic. */
export function userMessage(error, fallback) {
  return error instanceof ApiError ? error.message : fallback;
}
