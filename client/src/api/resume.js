import { api } from './axios.js';

// Resume Intelligence endpoints. Everything is scoped to the signed-in user on
// the server; the client never sends a user id.

export async function listResumesApi() {
  const { data } = await api.get('/api/resume-analysis');
  return data.analyses ?? [];
}

export async function getResumeApi(id) {
  const { data } = await api.get(`/api/resume-analysis/${encodeURIComponent(id)}`);
  return data.analysis;
}

export async function createResumeApi({
  file,
  jobDescription,
  companyName = '',
  companyWebsite = '',
  customInstructions = '',
}) {
  const form = new FormData();
  form.append('resume', file);
  form.append('jobDescription', jobDescription);
  if (companyName) form.append('companyName', companyName);
  if (companyWebsite) form.append('companyWebsite', companyWebsite);
  if (customInstructions) form.append('customInstructions', customInstructions);

  // Axios sets the multipart boundary; never set Content-Type by hand.
  const { data } = await api.post('/api/resume-analysis', form);
  return data.analysis;
}

export async function deleteResumeApi(id) {
  const { data } = await api.delete(`/api/resume-analysis/${encodeURIComponent(id)}`);
  return data;
}

export async function retryResumeApi(id) {
  const { data } = await api.post(`/api/resume-analysis/${encodeURIComponent(id)}/retry`);
  return data.analysis;
}

export async function getRoadmapApi(id) {
  try {
    const { data } = await api.get(
      `/api/resume-analysis/${encodeURIComponent(id)}/preparation`
    );
    return data.roadmap;
  } catch (error) {
    // No plan yet is a normal state, not a failure.
    if (error.status === 404) return null;
    throw error;
  }
}

export async function startRoadmapApi(id) {
  const { data } = await api.post(
    `/api/resume-analysis/${encodeURIComponent(id)}/preparation`
  );
  return data.roadmap;
}

export async function setTopicCompletionApi(id, topicId, completed) {
  const { data } = await api.patch(
    `/api/resume-analysis/${encodeURIComponent(id)}/preparation/topics/${encodeURIComponent(topicId)}`,
    { completed }
  );
  return data.roadmap;
}
