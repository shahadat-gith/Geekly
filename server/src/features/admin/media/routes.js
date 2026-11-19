import { Router } from 'express';
import { authenticateAdmin } from '../middleware/authenticate.js';
import { uploadErrorHandler, uploadSingleImage } from '../middleware/upload.js';
import { asyncHandler } from '../../../shared/asyncHandler.js';
import { upload, uploadTopicBanner } from './controller.js';

const router = Router();

router.use(authenticateAdmin);
router.post('/upload', uploadSingleImage, asyncHandler(upload));
router.post('/topic-banner', uploadSingleImage, asyncHandler(uploadTopicBanner));

router.use(uploadErrorHandler);

export default router;
