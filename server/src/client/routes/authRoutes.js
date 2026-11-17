import { Router } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  googleStart,
  googleCallback,
  githubStart,
  githubCallback,
} from '../controllers/authController.js';

// OAuth - start redirects to the provider, callback swaps the code for a token.
// These live in their own router because the provider consoles have
// /auth/<provider>/callback registered, so they are mounted at /auth as well
// as under the JSON API.
export const oauthRouter = Router();

oauthRouter.get('/google', googleStart);
oauthRouter.get('/google/callback', asyncHandler(googleCallback));
oauthRouter.get('/github', githubStart);
oauthRouter.get('/github/callback', asyncHandler(githubCallback));

const router = Router();

// Email + password
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));

// OAuth, also reachable under the API mount.
router.use(oauthRouter);

export default router;
