import { Router } from 'express';
import { authenticateAdmin } from '../middleware/authenticate.js';
import { asyncHandler } from '../../../shared/asyncHandler.js';
import {
  createModelHandler,
  deleteModelHandler,
  generate,
  models,
  updateModelHandler,
  usage,
} from './controller.js';

const router = Router();

router.use(authenticateAdmin);

router.get('/models', asyncHandler(models));
router.post('/models', asyncHandler(createModelHandler));
router.patch('/models/:id', asyncHandler(updateModelHandler));
router.delete('/models/:id', asyncHandler(deleteModelHandler));

router.get('/usage', asyncHandler(usage));
router.post('/articles/generate', asyncHandler(generate));

export default router;
