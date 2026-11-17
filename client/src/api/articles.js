import { api } from './axios.js';

// One published article, addressed by the id the sidebar already has.
export async function getArticleApi(id) {
  const { data } = await api.get(`/api/articles/${encodeURIComponent(id)}`);
  return data.article;
}
