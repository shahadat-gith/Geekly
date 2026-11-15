import { fileTypeFromBuffer } from 'file-type';
import { ApiError } from '../../shared/apiError.js';
import { uploadArticleImage, uploadTopicBanner as uploadTopicBannerImage } from '../../config/storage.js';

const IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/avif', 'avif'],
]);

async function validatedImage(file) {
  if (!file?.buffer) throw new ApiError(400, 'Choose an image to upload');
  const detected = await fileTypeFromBuffer(file.buffer);
  const extension = IMAGE_TYPES.get(detected?.mime);
  if (!extension) {
    throw new ApiError(400, 'Upload a JPEG, PNG, WebP, GIF or AVIF image');
  }
  return { buffer: file.buffer, contentType: detected.mime, extension };
}

export async function upload(req, res) {
  const image = await uploadArticleImage(await validatedImage(req.file));
  res.status(201).json({ image });
}

export async function uploadTopicBanner(req, res) {
  const image = await uploadTopicBannerImage(await validatedImage(req.file));
  res.status(201).json({ image });
}
