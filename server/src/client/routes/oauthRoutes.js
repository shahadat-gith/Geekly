import { Router } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import {
  googleStart,
  googleCallback,
  githubStart,
  githubCallback,
} from '../controllers/authController.js';

const router = Router();

router.get('/google', googleStart);
router.get('/google/callback', asyncHandler(googleCallback));
router.get('/github', githubStart);
router.get('/github/callback', asyncHandler(githubCallback));

export default router;
