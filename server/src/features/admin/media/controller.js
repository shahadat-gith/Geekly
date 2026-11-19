import { uploadArticleImage, uploadTopicBanner as uploadTopicBannerImage } from '../../../infra/storage/r2.js';
import { validatedImage } from '../../../shared/images.js';

export async function upload(req, res) {
  const image = await uploadArticleImage(await validatedImage(req.file));
  res.status(201).json({ image });
}

export async function uploadTopicBanner(req, res) {
  const image = await uploadTopicBannerImage(await validatedImage(req.file));
  res.status(201).json({ image });
}
