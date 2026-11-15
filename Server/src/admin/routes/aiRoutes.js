import { Router } from 'express';
import { authenticateAdmin } from '../middlewares/auth.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import {
  createModelHandler,
  deleteModelHandler,
  generate,
  generateImage,
  images,
  models,
  updateModelHandler,
  usage,
} from '../controllers/aiController.js';

const router = Router();

router.use(authenticateAdmin);

router.get('/models', asyncHandler(models));
router.post('/models', asyncHandler(createModelHandler));
router.patch('/models/:id', asyncHandler(updateModelHandler));
router.delete('/models/:id', asyncHandler(deleteModelHandler));

router.get('/usage', asyncHandler(usage));
router.get('/images', asyncHandler(images));
router.post('/articles/generate', asyncHandler(generate));
router.post('/images/generate', asyncHandler(generateImage));

export default router;
