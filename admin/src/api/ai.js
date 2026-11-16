import { api } from './axios.js';

export async function getAiModelsApi(params = {}) {
  const { data } = await api.get('/api/admin/ai/models', { params });
  return data;
}

export async function createAiModelApi(payload) {
  const { data } = await api.post('/api/admin/ai/models', payload);
  return data.model;
}

export async function updateAiModelApi(id, payload) {
  const { data } = await api.patch(`/api/admin/ai/models/${id}`, payload);
  return data.model;
}

export async function deleteAiModelApi(id) {
  const { data } = await api.delete(`/api/admin/ai/models/${id}`);
  return data;
}

// Reference reading and full-coverage drafts can take several minutes,
// especially when a long source is being rewritten without summarization.
export async function generateArticleDraftApi(payload) {
  const { data } = await api.post('/api/admin/ai/articles/generate', payload, {
    timeout: 900000,
  });
  return data;
}

export async function getAiUsageApi(params = {}) {
  const { data } = await api.get('/api/admin/ai/usage', { params });
  return data;
}
