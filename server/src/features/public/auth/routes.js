import { Router } from 'express';
import { asyncHandler } from '../../../shared/asyncHandler.js';
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
} from './controller.js';

const router = Router();

// Email + password
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));

// OAuth - start redirects to the provider, callback swaps the code for a token.
// Both sit under the same /api/auth mount as the rest of the auth endpoints, so
// the callback URLs registered with the providers are /api/auth/<provider>/callback.
router.get('/google', googleStart);
router.get('/google/callback', asyncHandler(googleCallback));
router.get('/github', githubStart);
router.get('/github/callback', asyncHandler(githubCallback));

export default router;
