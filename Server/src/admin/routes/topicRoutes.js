import { Router } from 'express';
import { authenticateAdmin } from '../middlewares/auth.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { list, create, update, remove } from '../controllers/topicController.js';

const router = Router();

router.use(authenticateAdmin);

router.get('/', asyncHandler(list));
router.post('/', asyncHandler(create));
router.patch('/:id', asyncHandler(update));
router.delete('/:id', asyncHandler(remove));

export default router;
