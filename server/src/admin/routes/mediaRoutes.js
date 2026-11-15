import { Router } from 'express';
import multer from 'multer';
import { authenticateAdmin } from '../middlewares/auth.js';
import { asyncHandler } from '../../shared/asyncHandler.js';
import { upload, uploadTopicBanner } from '../controllers/mediaController.js';

const router = Router();
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('Upload an image file'));
      return;
    }
    callback(null, true);
  },
});

router.use(authenticateAdmin);
router.post('/upload', uploadImage.single('image'), asyncHandler(upload));
router.post('/topic-banner', uploadImage.single('image'), asyncHandler(uploadTopicBanner));

router.use((error, _req, res, _next) => {
  const tooLarge = error.code === 'LIMIT_FILE_SIZE';
  res.status(tooLarge ? 413 : error.status || 400).json({
    message: tooLarge ? 'Image must be 10 MB or smaller' : error.message,
  });
});

export default router;
