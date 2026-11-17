import { Router } from 'express';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { getTopic, listParents } from '../controllers/topicController.js';

const router = Router();

router.get('/parents', asyncHandler(listParents));
router.get('/:slug', asyncHandler(getTopic));

export default router;
