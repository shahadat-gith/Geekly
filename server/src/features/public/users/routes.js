import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../../../shared/asyncHandler.js';
import { me, update } from './controller.js';

const router = Router();

router.use(authenticate);

router.get('/me', asyncHandler(me));
router.patch('/me', asyncHandler(update));

export default router;
