import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { keys } from '../config/env.js';

// Every token the API issues is a signed JWT. Access tokens are stateless;
// refresh tokens carry a `jti` that is recorded on the user so sessions can
// rotate and be revoked. Password-reset tokens carry a `jti` too, so each
// reset link works once.

export function signToken(userId, extra = {}) {
  return jwt.sign({ sub: userId.toString(), ...extra }, keys.jwt.secret, {
    expiresIn: keys.jwt.expiresIn,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, keys.jwt.secret);
}

// Admin sessions use a typed JWT pair. The `type` claim keeps a refresh
// token from being accepted as an access token (and vice versa).
export function signAccessToken(subject, extra = {}) {
  return jwt.sign({ sub: String(subject), type: 'access', ...extra }, keys.jwt.secret, {
    expiresIn: keys.jwt.expiresIn,
  });
}

export function signRefreshToken(subject, extra = {}) {
  return jwt.sign({ sub: String(subject), type: 'refresh', ...extra }, keys.jwt.refreshSecret, {
    expiresIn: keys.jwt.refreshExpiresIn,
  });
}

export function verifyRefreshToken(token) {
  const payload = jwt.verify(token, keys.jwt.refreshSecret);
  if (payload.type !== 'refresh') throw new Error('Not a refresh token');
  return payload;
}

export function issueRefreshToken(userId) {
  const tokenId = new Types.ObjectId().toString();
  const token = signRefreshToken(userId, { jti: tokenId });

  return { token, tokenId, expiresAt: tokenExpiresAt(token) };
}

export function signResetToken(subject, tokenId) {
  return jwt.sign(
    { sub: String(subject), type: 'reset', jti: tokenId },
    keys.jwt.secret,
    { expiresIn: '1h' }
  );
}

export function verifyResetToken(token) {
  const payload = jwt.verify(token, keys.jwt.secret);
  if (payload.type !== 'reset') throw new Error('Not a reset token');
  return payload;
}

export function issueResetToken(userId) {
  const tokenId = new Types.ObjectId().toString();
  return { token: signResetToken(userId, tokenId), tokenId };
}

// Short-lived signed state for OAuth callbacks (CSRF protection).
export function signState(payload) {
  return jwt.sign(payload, keys.jwt.secret, { expiresIn: '10m' });
}

export function verifyState(state) {
  return jwt.verify(state, keys.jwt.secret);
}

// Expiry encoded in a signed token, used when storing its session record.
export function tokenExpiresAt(token) {
  const decoded = jwt.decode(token);
  return decoded?.exp ? new Date(decoded.exp * 1000) : null;
}
