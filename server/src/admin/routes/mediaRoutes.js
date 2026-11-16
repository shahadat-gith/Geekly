import { Router } from 'express';
import { authenticateAdmin } from '../middlewares/auth.js';
import { uploadErrorHandler, uploadSingleImage } from '../middlewares/upload.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { upload, uploadTopicBanner } from '../controllers/mediaController.js';

const router = Router();

router.use(authenticateAdmin);
router.post('/upload', uploadSingleImage, asyncHandler(upload));
router.post('/topic-banner', uploadSingleImage, asyncHandler(uploadTopicBanner));

router.use(uploadErrorHandler);

export default router;
