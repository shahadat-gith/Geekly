import { Router } from 'express';
import { authenticate } from '../../client/middlewares/auth.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { createRateLimiter } from '../../shared/rateLimit.js';
import { uploadResume } from '../middlewares/upload.js';
import {
  create,
  get,
  getRoadmap,
  list,
  remove,
  retry,
  startRoadmap,
  toggleTopic,
} from '../controllers/resumeController.js';

const router = Router();

// Every route belongs to the signed-in user.
router.use(authenticate);

// AI work costs money, so submissions are limited per account and instance.
const createLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 6,
  message: 'You have started several analyses this hour. Try again a little later.',
});

const retryLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 12,
  message: 'That is a lot of retries. Try again a little later.',
});

router.get('/', asyncHandler(list));
router.post('/', createLimit, uploadResume, asyncHandler(create));

router.get('/:id/preparation', asyncHandler(getRoadmap));
router.post('/:id/preparation', retryLimit, asyncHandler(startRoadmap));
router.patch('/:id/preparation/topics/:topicId', asyncHandler(toggleTopic));

router.post('/:id/retry', retryLimit, asyncHandler(retry));
router.get('/:id', asyncHandler(get));
router.delete('/:id', asyncHandler(remove));

export default router;
