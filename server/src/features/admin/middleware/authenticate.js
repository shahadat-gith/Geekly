import { keys } from '../../../config/env.js';
import { verifyToken } from '../../../shared/jwt.js';
import { ApiError } from '../../../shared/errors.js';
import { asyncHandler } from '../../../shared/asyncHandler.js';

// Requires a valid ADMIN token (signed with `role: 'admin'`).
// Regular user tokens are rejected. The admin is defined by .env,
// so there is no database lookup here.
export const authenticateAdmin = asyncHandler(async (req, res, next) => {
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

  // Refresh tokens are signed for the refresh endpoint only; they must never
  // be accepted as a bearer credential on admin routes.
  if (payload.type === 'refresh') throw new ApiError(401, 'Invalid or expired token');
  if (payload.role !== 'admin') throw new ApiError(403, 'Admin access required');

  req.admin = { email: keys.admin.email, role: 'admin' };
  next();
});
