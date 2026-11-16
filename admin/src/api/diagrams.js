import { api } from './axios.js';

export async function listArticleDiagramsApi(articleId) {
  const { data } = await api.get(`/api/admin/articles/${articleId}/diagrams`);
  return data;
}

export async function getArticleDiagramApi(articleId, diagramId) {
  const { data } = await api.get(`/api/admin/articles/${articleId}/diagrams/${diagramId}`);
  return data;
}

// Generation happens on the API: it reads the Diagram document, prompts the
// default image model for a light-theme technical image, stores it in R2 and
// returns the asset reference for the editor node. Image generation can take
// a while, so this request has its own longer timeout.
export async function generateArticleDiagramImageApi(articleId, diagramId) {
  const { data } = await api.post(
    `/api/admin/articles/${articleId}/diagrams/${diagramId}/generate`,
    {},
    { timeout: 240000 },
  );
  return data;
}

export async function uploadArticleDiagramImageApi(articleId, diagramId, file) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post(
    `/api/admin/articles/${articleId}/diagrams/${diagramId}/image`,
    form,
    { timeout: 60000 },
  );
  return data;
}
