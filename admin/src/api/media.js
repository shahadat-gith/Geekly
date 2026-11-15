import { api } from './axios.js';

async function uploadImage(endpoint, file) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post(endpoint, form, { timeout: 60000 });
  return data.image;
}

export function uploadArticleImageApi(file) {
  return uploadImage('/api/admin/media/upload', file);
}

export function uploadTopicBannerApi(file) {
  return uploadImage('/api/admin/media/topic-banner', file);
}
