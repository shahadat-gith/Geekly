import { api } from './axios.js';

export async function listParentTopicsApi() {
  const { data } = await api.get('/api/topics/parents');
  return data.topics;
}

// Resolves a nested content path (system-design, system-design/basics,
// system-design/basics/caching) to a topic page or a single article.
export async function getContentApi(path) {
  const { data } = await api.get('/api/content', {
    params: { path },
  });
  return data;
}