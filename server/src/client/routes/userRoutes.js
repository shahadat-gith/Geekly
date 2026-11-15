import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { me, update } from '../controllers/userController.js';

const router = Router();

router.use(authenticate);

router.get('/me', asyncHandler(me));
router.patch('/me', asyncHandler(update));

export default router;
