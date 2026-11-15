import { Router } from 'express';
import { authenticateAdmin } from '../middlewares/auth.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { login, refresh, me } from '../controllers/authController.js';

const router = Router();

// Public admin auth (single admin from .env - see services/authService.js)
router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));

// Protected admin routes
router.get('/me', authenticateAdmin, asyncHandler(me));

export default router;
