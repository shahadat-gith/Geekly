import mongoose from 'mongoose';
import User from '../../../models/User.js';
import { keys } from '../../../config/env.js';
import { hashPassword, verifyPassword } from '../../../shared/password.js';
import {
  issueRefreshToken,
  issueResetToken,
  signToken,
  verifyRefreshToken,
  verifyResetToken,
} from '../../../shared/jwt.js';
import { ApiError } from '../../../shared/errors.js';
import { sendWelcomeEmail } from '../../../infra/mail/index.js';
import {
  normalizeEmail,
  findUserByEmail,
  findUserByProvider,
  createUser,
  touchLastLogin,
} from '../users/service.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function queueWelcomeEmail(user) {
  // A provider outage must never fail a successful signup. Delivery errors are
  // logged for operators while the client receives its session immediately.
  sendWelcomeEmail(user).catch((error) => {
    console.error('Welcome email failed:', error.message);
  });
}

export function assertOAuthConfigured(provider) {
  const providerKeys = keys.auth[provider];
  if (!providerKeys.clientId || !providerKeys.clientSecret) {
    throw new ApiError(501, `${provider} login is not configured on the server`);
  }
  if (!providerKeys.callbackUrl) {
    throw new ApiError(501, `${provider} callback URL is not configured - set ${provider.toUpperCase()}_CALLBACK_URL in .env`);
  }
}

export function oauthRedirectUri(provider) {
  // Exact URL registered in the provider console (env-overridable).
  return keys.auth[provider].callbackUrl;
}

// Issue a fresh access + refresh token pair for a user. The refresh token
// is a signed JWT; only its id is stored, so it can rotate and be revoked.
async function issueTokens(user) {
  const { token: refreshToken, tokenId, expiresAt } = issueRefreshToken(user._id);

  const stored = await User.findById(user._id).select('+refreshTokens');
  const active = (stored?.refreshTokens || []).filter((t) => t.expiresAt > new Date());
  active.push({ tokenId, expiresAt });
  await User.updateOne({ _id: user._id }, { refreshTokens: active });

  return { token: signToken(user._id), refreshToken };
}

// Exchange a valid refresh token for a new pair (rotates the token, so
// the presented one cannot be reused). User auth is not required - the
// token itself is the credential.
export async function refresh({ refreshToken }) {
  if (!refreshToken) throw new ApiError(400, 'Refresh token is required');

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  if (!payload.jti || !mongoose.Types.ObjectId.isValid(payload.sub)) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(payload.sub).select('+refreshTokens');
  const entry = user?.refreshTokens?.find((t) => t.tokenId === payload.jti);
  if (!user || !entry || entry.expiresAt < new Date()) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  user.refreshTokens = user.refreshTokens.filter((t) => t.tokenId !== payload.jti);
  await user.save({ validateBeforeSave: false });

  return { user, ...(await issueTokens(user)) };
}

// Revoke one refresh token (logout). Always succeeds, even if the token
// is unknown, so the endpoint cannot be used to probe sessions.
export async function logout({ refreshToken }) {
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      if (payload.jti && mongoose.Types.ObjectId.isValid(payload.sub)) {
        await User.updateOne(
          { _id: payload.sub },
          { $pull: { refreshTokens: { tokenId: payload.jti } } }
        );
      }
    } catch {
      // Expired or already revoked: there is no session left to remove.
    }
  }
  return {};
}

// ---------------------------------------------------------------------------
// Email + password
// ---------------------------------------------------------------------------

export async function register({ email, password, fullname }) {
  if (!email || !EMAIL_RE.test(normalizeEmail(email))) {
    throw new ApiError(400, 'A valid email is required');
  }
  if (!fullname?.trim()) throw new ApiError(400, 'Full name is required');
  if (!password || password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  const normalized = normalizeEmail(email);
  if (await findUserByEmail(normalized)) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await createUser({
    email: normalized,
    fullname,
    passwordHash: await hashPassword(password),
    provider: { name: 'email', id: normalized },
  });

  const tokens = await issueTokens(user);

  queueWelcomeEmail(user);

  return { user, ...tokens };
}

export async function login({ email, password }) {
  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  // +passwordHash: the field is `select: false`, so queries skip it by default.
  const user = await User.findOne({ email: normalizeEmail(email) }).select('+passwordHash');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  if (user.provider?.name !== 'email' || !(await verifyPassword(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  await touchLastLogin(user);
  return { user, ...(await issueTokens(user)) };
}

// ---------------------------------------------------------------------------
// Password reset (forgot + reset)
// ---------------------------------------------------------------------------

// Always answers the same way, whether or not the email exists, so the
// endpoint cannot be used to check which emails have accounts.
// In development the raw token is included in the response so the flow can
// be tested; production reset delivery still needs its email template wired.
export async function forgotPassword({ email }) {
  if (!email) throw new ApiError(400, 'Email is required');

  const user = await User.findOne({ email: normalizeEmail(email) }).select('+passwordResetToken');
  if (user) {
    const { token, tokenId } = issueResetToken(user._id);
    user.passwordResetToken = tokenId;
    await user.save({ validateBeforeSave: false });
    if (keys.server.environment !== 'production') return { token };
  }
  return {};
}

export async function resetPassword({ token, password }) {
  if (!token) throw new ApiError(400, 'Reset token is required');
  if (!password || password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  // The JWT carries the user and its own expiry; the stored id makes the
  // link single-use, so a replayed link is rejected.
  let payload;
  try {
    payload = verifyResetToken(token);
  } catch {
    throw new ApiError(400, 'Reset token is invalid or expired');
  }

  if (!payload.jti || !mongoose.Types.ObjectId.isValid(payload.sub)) {
    throw new ApiError(400, 'Reset token is invalid or expired');
  }

  const user = await User.findById(payload.sub).select('+passwordResetToken +passwordHash');

  if (!user || user.passwordResetToken !== payload.jti) {
    throw new ApiError(400, 'Reset token is invalid or expired');
  }

  user.passwordHash = await hashPassword(password);
  user.passwordResetToken = null;
  // Accounts have one provider, so resetting a password switches an
  // OAuth-only account to email sign-in.
  if (user.provider?.name !== 'email') {
    user.provider = { name: 'email', id: normalizeEmail(user.email) };
  }
  await user.save({ validateBeforeSave: false });
  return {};
}

// ---------------------------------------------------------------------------
// OAuth (Google / GitHub) - authorization code flow
// ---------------------------------------------------------------------------

export function buildAuthorizeUrl(provider) {
  assertOAuthConfigured(provider);
  const { clientId } = keys.auth[provider];
  const redirectUri = oauthRedirectUri(provider);

  if (provider === 'google') {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    allow_signup: 'true',
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

async function exchangeCode(provider, code) {
  const { clientId, clientSecret } = keys.auth[provider];

  if (provider === 'google') {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: oauthRedirectUri('google'),
        grant_type: 'authorization_code',
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new ApiError(400, 'Google login failed - invalid or expired code');
    return data.access_token;
  }

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    // GitHub requires form-encoded parameters here. A JSON body is rejected
    // as 400 even though the response itself is requested as JSON.
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: oauthRedirectUri('github'),
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new ApiError(400, 'GitHub login failed - invalid or expired code');
  }
  return data.access_token;
}

async function fetchGoogleProfile(accessToken) {
  const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new ApiError(400, 'Could not load your Google profile');
  const p = await res.json();
  return {
    providerId: p.sub,
    email: p.email,
    emailVerified: p.email_verified === true,
    fullname: p.name,
    avatarUrl: p.picture,
  };
}

async function fetchGithubProfile(accessToken) {
  const headers = { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json' };

  const userRes = await fetch('https://api.github.com/user', { headers });
  if (!userRes.ok) throw new ApiError(400, 'Could not load your GitHub profile');
  const profile = await userRes.json();

  // `/user` only exposes a public email and does not tell us whether it is
  // verified. Read the full list (we request user:email) and trust only a
  // verified address, preferring the public one then the primary one.
  const emailsRes = await fetch('https://api.github.com/user/emails', { headers });
  const emails = emailsRes.ok ? await emailsRes.json() : [];
  const verifiedEmails = Array.isArray(emails) ? emails.filter((e) => e.verified) : [];
  const publicEmail = String(profile.email || '').toLowerCase();
  const chosen =
    verifiedEmails.find((e) => String(e.email).toLowerCase() === publicEmail) ||
    verifiedEmails.find((e) => e.primary) ||
    verifiedEmails[0];

  // Never merge into an existing account using an unverified address. A
  // synthetic address keeps the GitHub identity usable without claiming an
  // email that GitHub has not confirmed.
  const email = chosen?.email || `${profile.id}+github@users.noreply.github.com`;
  const emailVerified = Boolean(chosen);

  return {
    providerId: String(profile.id),
    email,
    emailVerified,
    fullname: profile.name || profile.login,
    avatarUrl: profile.avatar_url,
  };
}

// Find the existing account for an OAuth identity, or create a new one.
export async function findOrCreateOAuthUser(provider, profile) {
  // 1. Known provider identity.
  const existing = await findUserByProvider(provider, profile.providerId);
  if (existing) {
    await touchLastLogin(existing);
    return existing;
  }

  // 2. Same verified email as an existing account: sign in to that account
  // but keep its provider, so its current sign-in method keeps working.
  const email = normalizeEmail(profile.email);
  const byEmail = await findUserByEmail(email);
  if (byEmail) {
    if (!profile.emailVerified) {
      throw new ApiError(
        409,
        'An account with this email already exists. Sign in with your original method.'
      );
    }
    await touchLastLogin(byEmail);
    return byEmail;
  }

  // 3. Brand new account, with this provider as its single sign-in method.
  const created = await createUser({
    email,
    fullname: profile.fullname || email.split('@')[0],
    provider: { name: provider, id: profile.providerId },
    emailVerified: profile.emailVerified,
    avatar: profile.avatarUrl ? { url: profile.avatarUrl } : undefined,
  });

  // A GitHub account without a verified email gets a synthetic address that
  // cannot receive mail, so only welcome accounts we can actually reach.
  if (created.emailVerified) queueWelcomeEmail(created);
  return created;
}

export async function oauthLogin(provider, code) {
  assertOAuthConfigured(provider);
  const accessToken = await exchangeCode(provider, code);
  const profile =
    provider === 'google'
      ? await fetchGoogleProfile(accessToken)
      : await fetchGithubProfile(accessToken);
  const user = await findOrCreateOAuthUser(provider, profile);
  return { user, ...(await issueTokens(user)) };
}
