import { randomBytes } from 'node:crypto';
import { keys } from '../../../config/env.js';
import { signState, verifyState } from '../../../shared/jwt.js';
import { ApiError } from '../../../shared/errors.js';
import * as authService from './service.js';

const OAUTH_STATE_COOKIE = 'geekly_oauth_state';
// OAuth callbacks are mounted at /api/auth/<provider>/callback. The cookie
// path must cover that API path or the browser drops it before the callback.
const OAUTH_STATE_PATH = '/api/auth';

function oauthStateCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: keys.server.environment === 'production',
    path: OAUTH_STATE_PATH,
    maxAge: 10 * 60 * 1000,
  };
}

function clearOAuthStateCookie(res) {
  const options = oauthStateCookieOptions();
  delete options.maxAge;
  res.clearCookie(OAUTH_STATE_COOKIE, options);
}

function readCookie(req, name) {
  const header = req.headers.cookie;
  if (!header) return null;

  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

// Controllers only translate HTTP <-> services. All business logic,
// validation and DB work lives in the services.

export async function register(req, res) {
  const { user, token, refreshToken } = await authService.register(req.body);
  res.status(201).json({ user, token, refreshToken });
}

export async function login(req, res) {
  const { user, token, refreshToken } = await authService.login(req.body);
  res.json({ user, token, refreshToken });
}

export async function refresh(req, res) {
  const { user, token, refreshToken } = await authService.refresh(req.body);
  res.json({ user, token, refreshToken });
}

export async function logout(req, res) {
  await authService.logout(req.body);
  res.json({ message: 'Logged out' });
}

export async function forgotPassword(req, res) {
  const result = await authService.forgotPassword(req.body);
  res.json({ message: 'If an account exists for that email, a password reset link has been sent.', ...result });
}

export async function resetPassword(req, res) {
  await authService.resetPassword(req.body);
  res.json({ message: 'Password has been reset. You can now sign in.' });
}

// ---------------------------------------------------------------------------
// OAuth
// ---------------------------------------------------------------------------

function oauthStart(provider) {
  return (req, res) => {
    const nonce = randomBytes(32).toString('hex');
    const state = signState({ provider, nonce });
    res.cookie(OAUTH_STATE_COOKIE, nonce, oauthStateCookieOptions());
    const url = authService.buildAuthorizeUrl(provider);
    res.redirect(`${url}&state=${encodeURIComponent(state)}`);
  };
}

function oauthCallback(provider) {
  return async (req, res) => {
    const { code, state, error } = req.query;
    const expectedNonce = readCookie(req, OAUTH_STATE_COOKIE);
    // The state is single-use, so clear it before any response path.
    clearOAuthStateCookie(res);

    // Provider-side failure (user denied access, etc.) - never crash the flow.
    if (error) {
      if (keys.auth.frontendUrl) {
        return res.redirect(`${keys.auth.frontendUrl}/auth/callback?error=${encodeURIComponent(String(error))}`);
      }
      throw new ApiError(400, `${provider} login failed: ${error}`);
    }

    if (!code) throw new ApiError(400, `Missing ${provider} authorization code`);

    try {
      const payload = verifyState(state);
      if (
        payload.provider !== provider ||
        !expectedNonce ||
        payload.nonce !== expectedNonce
      ) {
        throw new Error('provider or nonce mismatch');
      }
    } catch {
      if (keys.auth.frontendUrl) {
        return res.redirect(`${keys.auth.frontendUrl}/auth/callback?error=invalid_state`);
      }
      throw new ApiError(400, 'Invalid or expired login state - please try again');
    }

    let tokens;
    try {
      tokens = await authService.oauthLogin(provider, code);
    } catch (err) {
      if (keys.auth.frontendUrl) {
        return res.redirect(`${keys.auth.frontendUrl}/auth/callback?error=${encodeURIComponent(err.message)}`);
      }
      throw err;
    }

    // SPA flow: hand the tokens to the frontend callback page.
    // Without FRONTEND_URL configured, return them as JSON instead.
    if (keys.auth.frontendUrl) {
      const q = new URLSearchParams({ token: tokens.token, refreshToken: tokens.refreshToken });
      return res.redirect(`${keys.auth.frontendUrl}/auth/callback?${q}`);
    }
    res.json({ token: tokens.token, refreshToken: tokens.refreshToken });
  };
}

export const googleStart = oauthStart('google');
export const googleCallback = oauthCallback('google');
export const githubStart = oauthStart('github');
export const githubCallback = oauthCallback('github');
