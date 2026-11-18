import { fileTypeFromBuffer } from 'file-type';
import { ApiError } from '../../../shared/apiError.js';

// Upload limits are enforced twice: multer rejects oversized bodies before the
// buffer is read, and this module re-checks the bytes it actually received.
export const MAX_RESUME_BYTES = 10 * 1024 * 1024;

const FORMATS = {
  pdf: {
    mimeTypes: ['application/pdf'],
    signatures: ['%PDF-'],
    extension: 'pdf',
  },
  docx: {
    mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    // Every OOXML file is a zip; the document part name separates it from xlsx.
    signatures: ['PK\u0003\u0004'],
    contains: 'word/',
    extension: 'docx',
  },
};

function startsWithSignature(buffer, signature) {
  return buffer.subarray(0, 1024).includes(Buffer.from(signature, 'binary'));
}

function looksLikeDocx(buffer) {
  if (!startsWithSignature(buffer, 'PK\u0003\u0004')) return false;
  // The central directory lists "word/document.xml" as plain text in the
  // archive, so a substring check over the tail is enough to reject other zips.
  return buffer.includes(Buffer.from('word/document.xml')) || buffer.includes(Buffer.from('word\\document.xml'));
}

/**
 * Validate uploaded bytes as a supported resume document.
 * Returns the detected format; the declared mimetype is never trusted alone.
 */
export async function validateResumeFile(file) {
  if (!file?.buffer?.length) {
    throw new ApiError(400, 'Choose a resume file to upload.');
  }

  if (file.buffer.length > MAX_RESUME_BYTES) {
    throw new ApiError(413, 'Resume must be 10 MB or smaller.');
  }

  const detected = await fileTypeFromBuffer(file.buffer).catch(() => undefined);
  const declared = String(file.mimetype || '').toLowerCase();

  let format = null;
  if (startsWithSignature(file.buffer, FORMATS.pdf.signatures[0])) {
    format = 'pdf';
  } else if (looksLikeDocx(file.buffer)) {
    format = 'docx';
  }

  if (!format) {
    throw new ApiError(422, 'Upload a PDF or DOCX resume. Other file types cannot be read.');
  }

  const knownMime = FORMATS[format].mimeTypes.includes(detected?.mime ?? declared);
  if (!knownMime && detected?.mime && detected.mime !== FORMATS[format].mimeTypes[0]) {
    // A PDF/DOCX signature that also looks like another format is suspicious
    // (for example an archive renamed to .pdf). Explain instead of guessing.
    throw new ApiError(422, 'The uploaded file does not look like a valid PDF or DOCX document.');
  }

  return {
    format,
    mimeType: FORMATS[format].mimeTypes[0],
    extension: FORMATS[format].extension,
  };
}
