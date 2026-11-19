import multer from 'multer';
import { MAX_RESUME_BYTES } from './documents/validate.js';

// The files are held in memory just long enough to extract text; the bytes are
// discarded with the request and never written to disk or object storage.
// Both fields are optional: either side of the comparison can be pasted as text.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES, files: 2, fields: 10 },
  fileFilter(_req, file, callback) {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Some browsers send an empty or generic type for a dropped DOCX.
      'application/octet-stream',
      'application/zip',
    ];
    if (!allowed.includes(String(file.mimetype || '').toLowerCase())) {
      callback(new Error('Upload a PDF or DOCX file.'));
      return;
    }
    callback(null, true);
  },
}).fields([
  { name: 'resume', maxCount: 1 },
  { name: 'jobDescriptionFile', maxCount: 1 },
]);

export function uploadResume(req, res, next) {
  upload(req, res, (error) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({ message: 'Each file must be 10 MB or smaller.' });
        return;
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        res.status(400).json({
          message: 'Attach one resume file in "resume" and one job description in "jobDescriptionFile".',
        });
        return;
      }
      res.status(error.status || 400).json({
        message: error.message || 'The files could not be uploaded.',
      });
      return;
    }

    req.file = req.files?.resume?.[0];
    req.jobDescriptionFile = req.files?.jobDescriptionFile?.[0];
    next();
  });
}
