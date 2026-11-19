import { timingSafeEqual } from 'node:crypto';
import { keys } from '../../../config/env.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../../shared/jwt.js';
import { ApiError } from '../../../shared/errors.js';

// There is no Admin model or database table - the single admin is defined
// by ADMIN_EMAIL / ADMIN_PASSWORD in .env (see .env.example).

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a ?? ''));
  const bufB = Buffer.from(String(b ?? ''));
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

function issueTokens() {
  const claims = { role: 'admin' };
  return {
    accessToken: signAccessToken('admin', claims),
    refreshToken: signRefreshToken('admin', claims),
  };
}

export function login({ email, password }) {
  if (!email || !password) throw new ApiError(400, 'Email and password are required');
  if (!keys.admin.email || !keys.admin.password) {
    throw new ApiError(503, 'Admin credentials are not configured on the server');
  }

  const emailOk = safeEqual(String(email).trim().toLowerCase(), keys.admin.email);
  const passwordOk = safeEqual(password, keys.admin.password);
  if (!emailOk || !passwordOk) throw new ApiError(401, 'Invalid email or password');

  return issueTokens();
}

// Exchanges a JWT refresh token for a fresh pair. Both tokens rotate on every
// refresh, so a captured access token cannot be extended indefinitely.
export function refresh({ refreshToken } = {}) {
  if (!refreshToken) throw new ApiError(400, 'Refresh token is required');

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  if (payload.role !== 'admin') throw new ApiError(401, 'Invalid refresh token');
  return issueTokens();
}

export function me() {
  return { email: keys.admin.email, role: 'admin' };
}
