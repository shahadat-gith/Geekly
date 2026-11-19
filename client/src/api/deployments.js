import { api } from './axios.js';

// Static site hosting endpoints. Everything is scoped to the signed-in user on
// the server; the client never sends a user id.

export async function listProjectsApi() {
  const { data } = await api.get('/api/deployments/projects');
  return data.projects ?? [];
}

export async function getProjectApi(projectId) {
  const { data } = await api.get(`/api/deployments/projects/${encodeURIComponent(projectId)}`);
  return data.project;
}

export async function createProjectApi({ name, slug }) {
  const { data } = await api.post('/api/deployments/projects', { name, slug });
  return data.project;
}

export async function updateProjectApi(projectId, payload) {
  const { data } = await api.patch(`/api/deployments/projects/${encodeURIComponent(projectId)}`, payload);
  return data.project;
}

export async function deleteProjectApi(projectId) {
  await api.delete(`/api/deployments/projects/${encodeURIComponent(projectId)}`);
}

export async function checkSlugApi(slug, { signal } = {}) {
  const { data } = await api.get(`/api/deployments/check-slug/${encodeURIComponent(slug)}`, { signal });
  return data;
}

export async function listDeploymentsApi(projectId) {
  const { data } = await api.get(`/api/deployments/projects/${encodeURIComponent(projectId)}/deployments`);
  return data.deployments ?? [];
}

export async function getDeploymentApi(deploymentId) {
  const { data } = await api.get(`/api/deployments/${encodeURIComponent(deploymentId)}`);
  return data.deployment;
}

export async function createDeploymentApi(projectId, files) {
  const { data } = await api.post(
    `/api/deployments/projects/${encodeURIComponent(projectId)}/deployments`,
    { files },
  );
  return data.deployment;
}

/** Uploads one file. `onProgress` receives a 0–1 fraction for this file. */
export async function uploadDeploymentFileApi(deploymentId, { file, path }, { onProgress, signal } = {}) {
  const form = new FormData();
  form.append('path', path);
  form.append('file', file, file.name);
  const { data } = await api.put(
    `/api/deployments/${encodeURIComponent(deploymentId)}/files`,
    form,
    {
      signal,
      onUploadProgress: (event) => {
        if (onProgress && event.total) onProgress(event.loaded / event.total);
      },
    },
  );
  return data.uploaded;
}

export async function finalizeDeploymentApi(deploymentId) {
  const { data } = await api.post(`/api/deployments/${encodeURIComponent(deploymentId)}/finalize`);
  return data.deployment;
}

export async function retryDeploymentApi(deploymentId) {
  const { data } = await api.post(`/api/deployments/${encodeURIComponent(deploymentId)}/retry`);
  return data.deployment;
}

export async function rollbackDeploymentApi(deploymentId) {
  const { data } = await api.post(`/api/deployments/${encodeURIComponent(deploymentId)}/rollback`);
  return data.deployment;
}
