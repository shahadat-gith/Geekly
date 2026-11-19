import mongoose from 'mongoose';
import { ApiError } from './errors.js';

// Ids are validated before they reach a query, so a malformed id produces a
// clean client error instead of a cast failure.

/** Reject anything that cannot be an ObjectId. */
export function assertObjectId(value, message = 'Invalid id') {
  if (!mongoose.Types.ObjectId.isValid(value)) throw new ApiError(400, message);
}

/** Ids that must belong to the caller: a bad id is reported as missing. */
export function toObjectId(value, message = 'Not found') {
  if (!mongoose.Types.ObjectId.isValid(String(value ?? ''))) {
    throw new ApiError(404, message);
  }
  return new mongoose.Types.ObjectId(String(value));
}

/** Escape user input before it is embedded in a RegExp. */
export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
