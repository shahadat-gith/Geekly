import mongoose from 'mongoose';
import User from '../../models/User.js';
import { verifyToken } from '../../shared/jwt.js';
import { ApiError } from '../../shared/apiError.js';
import { asyncHandler } from '../../shared/asyncHandler.js';

// Requires a valid `Authorization: Bearer <token>` header.
// Attaches the user to `req.user` and calls next().
export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  let payload;
  try {
    payload = verifyToken(header.slice('Bearer '.length).trim());
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }

  // Admin tokens carry sub='admin', which is not a user id - reject cleanly.
  if (!payload.sub || !mongoose.Types.ObjectId.isValid(payload.sub)) {
    throw new ApiError(401, 'Invalid token');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'User no longer exists');

  req.user = user;
  next();
});

// Same as authenticate(), but the route also works for guests.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  try {
    const payload = verifyToken(header.slice('Bearer '.length).trim());
    const user = await User.findById(payload.sub);
    if (user) req.user = user;
  } catch {
    // Invalid token on an optional-auth route: continue as guest.
  }
  next();
});
