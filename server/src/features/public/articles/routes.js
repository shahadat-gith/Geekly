import { Router } from 'express';
import { asyncHandler } from '../../../shared/asyncHandler.js';
import { getArticle } from './controller.js';

const router = Router();

router.get('/:id', asyncHandler(getArticle));

export default router;
