import { fileTypeFromBuffer } from 'file-type';
import { ApiError } from './errors.js';

const IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/avif', 'avif'],
]);

/** Validate uploaded bytes as a raster image before storing them. */
export async function validatedImage(file) {
  if (!file?.buffer) throw new ApiError(400, 'Choose an image to upload');
  const detected = await fileTypeFromBuffer(file.buffer);
  const extension = IMAGE_TYPES.get(detected?.mime);
  if (!extension) {
    throw new ApiError(400, 'Upload a JPEG, PNG, WebP, GIF or AVIF image');
  }
  return { buffer: file.buffer, contentType: detected.mime, extension };
}
