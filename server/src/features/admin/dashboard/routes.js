import { Router } from 'express';
import { authenticateAdmin } from '../middleware/authenticate.js';
import { asyncHandler } from '../../../shared/asyncHandler.js';
import { summary } from './controller.js';

const router = Router();

router.get('/', authenticateAdmin, asyncHandler(summary));

export default router;
