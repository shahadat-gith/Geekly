import { api } from './axios.js';

export async function listParentTopicsApi() {
  const { data } = await api.get('/api/topics/parents');
  return data.topics;
}

// A topic page in one request: the sidebar (subtopics with article links) and
// the article the topic opens on.
export async function getTopicApi(slug) {
  const { data } = await api.get(`/api/topics/${encodeURIComponent(slug)}`);
  return data;
}
