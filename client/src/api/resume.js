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
  resumeText = '',
  jobDescription = '',
  jobDescriptionFile,
  companyName = '',
  companyWebsite = '',
  customInstructions = '',
}) {
  // Either side of the comparison can be a file or pasted text.
  const form = new FormData();
  if (file) form.append('resume', file);
  if (resumeText) form.append('resumeText', resumeText);
  if (jobDescriptionFile) form.append('jobDescriptionFile', jobDescriptionFile);
  if (jobDescription) form.append('jobDescription', jobDescription);
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
