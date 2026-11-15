import { api } from './axios.js';

export async function listArticlesApi({
  search = '',
  status = 'all',
  topic = '',
  page = 1,
  limit = 10,
} = {}) {
  const { data } = await api.get('/api/admin/articles', {
    params: { search, status, topic, page, limit },
  });
  return data;
}

export async function getArticleApi(id) {
  const { data } = await api.get(`/api/admin/articles/${id}`);
  return data.article;
}

export async function createArticleApi(payload) {
  const { data } = await api.post('/api/admin/articles', payload);
  return data.article;
}

export async function updateArticleApi(id, payload) {
  const { data } = await api.patch(`/api/admin/articles/${id}`, payload);
  return data.article;
}

export async function deleteArticleApi(id) {
  const { data } = await api.delete(`/api/admin/articles/${id}`);
  return data;
}
