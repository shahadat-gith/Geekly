import multer from 'multer';
import { MAX_RESUME_BYTES } from '../utils/documents/validateFile.js';

// The file is held in memory just long enough to extract text; the bytes are
// discarded with the request and never written to disk or object storage.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES, files: 1, fields: 10 },
  fileFilter(_req, file, callback) {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Some browsers send an empty or generic type for a dropped DOCX.
      'application/octet-stream',
      'application/zip',
    ];
    if (!allowed.includes(String(file.mimetype || '').toLowerCase())) {
      callback(new Error('Upload your resume as a PDF or DOCX file.'));
      return;
    }
    callback(null, true);
  },
}).single('resume');

export function uploadResume(req, res, next) {
  upload(req, res, (error) => {
    if (!error) return next();

    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ message: 'Resume must be 10 MB or smaller.' });
      return;
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({ message: 'Attach one resume file in the "resume" field.' });
      return;
    }
    res.status(error.status || 400).json({
      message: error.message || 'The resume could not be uploaded.',
    });
  });
}
