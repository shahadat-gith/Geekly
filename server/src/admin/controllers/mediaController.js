import { uploadArticleImage, uploadTopicBanner as uploadTopicBannerImage } from '../../config/storage.js';
import { validatedImage } from '../utils/imageUpload.js';

export async function upload(req, res) {
  const image = await uploadArticleImage(await validatedImage(req.file));
  res.status(201).json({ image });
}

export async function uploadTopicBanner(req, res) {
  const image = await uploadTopicBannerImage(await validatedImage(req.file));
  res.status(201).json({ image });
}
