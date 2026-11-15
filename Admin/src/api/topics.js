import { api } from './axios.js';

export async function listTopicsApi({ search = '' } = {}) {
  const { data } = await api.get('/api/admin/topics', {
    params: { search },
  });
  return data;
}

export async function createTopicApi(payload) {
  const { data } = await api.post('/api/admin/topics', payload);
  return data.topic;
}

export async function updateTopicApi(id, payload) {
  const { data } = await api.patch(`/api/admin/topics/${id}`, payload);
  return data.topic;
}

export async function deleteTopicApi(id) {
  const { data } = await api.delete(`/api/admin/topics/${id}`);
  return data;
}
