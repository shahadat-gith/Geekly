import multer from 'multer';

// Shared multipart middleware for every admin image upload. The in-memory
// buffer is validated by the controller before anything reaches R2.
export const uploadSingleImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('Upload an image file'));
      return;
    }
    callback(null, true);
  },
}).single('image');

export function uploadErrorHandler(error, _req, res, next) {
  if (!error) return next();
  const tooLarge = error.code === 'LIMIT_FILE_SIZE';
  res.status(tooLarge ? 413 : error.status || 400).json({
    message: tooLarge ? 'Image must be 10 MB or smaller' : error.message,
  });
}
