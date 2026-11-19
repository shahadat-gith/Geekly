import { Router } from 'express';
import { authenticate } from '../public/middleware/authenticate.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { createRateLimiter } from '../../shared/rateLimit.js';
import { uploadResume } from './upload.js';
import { create, get, list, remove, retry } from './resume.controller.js';

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

router.post('/:id/retry', retryLimit, asyncHandler(retry));
router.get('/:id', asyncHandler(get));
router.delete('/:id', asyncHandler(remove));

export default router;
