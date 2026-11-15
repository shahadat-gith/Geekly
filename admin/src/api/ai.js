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

// Reference reading plus a full article draft usually takes 20-90 seconds,
// and longer research pieces can take a few minutes.
export async function generateArticleDraftApi(payload) {
  const { data } = await api.post('/api/admin/ai/articles/generate', payload, {
    timeout: 300000,
  });
  return data;
}

// One image usually takes 5-30 seconds.
export async function generateImageApi(payload) {
  const { data } = await api.post('/api/admin/ai/images/generate', payload, {
    timeout: 180000,
  });
  return data;
}

export async function getGeneratedImagesApi(params = {}) {
  const { data } = await api.get('/api/admin/ai/images', { params });
  return data;
}

export async function getAiUsageApi(params = {}) {
  const { data } = await api.get('/api/admin/ai/usage', { params });
  return data;
}
