import {
  createResumeAnalysis,
  deleteResumeAnalysis,
  getResumeAnalysis,
  listResumeAnalyses,
  retryResumeAnalysis,
} from './resume.service.js';

// POST /api/resume-analysis (multipart: resume and job description, each as a
// file or as text)
export async function create(req, res) {
  const analysis = await createResumeAnalysis({
    user: req.user,
    file: req.file,
    jobDescriptionFile: req.jobDescriptionFile,
    body: req.body ?? {},
  });
  res.status(202).json({ analysis });
}

// GET /api/resume-analysis
export async function list(req, res) {
  const analyses = await listResumeAnalyses(req.user);
  res.json({ analyses });
}

// GET /api/resume-analysis/:id
export async function get(req, res) {
  const analysis = await getResumeAnalysis(req.user, req.params.id);
  res.json({ analysis });
}

// DELETE /api/resume-analysis/:id
export async function remove(req, res) {
  const result = await deleteResumeAnalysis(req.user, req.params.id);
  res.json(result);
}

// POST /api/resume-analysis/:id/retry
export async function retry(req, res) {
  const analysis = await retryResumeAnalysis(req.user, req.params.id);
  res.status(202).json({ analysis });
}
