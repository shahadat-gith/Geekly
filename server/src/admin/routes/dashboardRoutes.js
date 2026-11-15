import { Router } from 'express';
import { authenticateAdmin } from '../middlewares/auth.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { summary } from '../controllers/dashboardController.js';

const router = Router();

router.get('/', authenticateAdmin, asyncHandler(summary));

export default router;
