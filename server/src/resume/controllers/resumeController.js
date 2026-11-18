import {
  createResumeAnalysis,
  deleteResumeAnalysis,
  getPreparationRoadmap,
  getResumeAnalysis,
  listResumeAnalyses,
  retryResumeAnalysis,
  setTopicCompletion,
  startPreparationRoadmap,
} from '../services/resumeService.js';

// POST /api/resume-analysis (multipart: resume + job description)
export async function create(req, res) {
  const analysis = await createResumeAnalysis({
    user: req.user,
    file: req.file,
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

// GET /api/resume-analysis/:id/preparation
export async function getRoadmap(req, res) {
  const roadmap = await getPreparationRoadmap(req.user, req.params.id);
  res.json({ roadmap });
}

// POST /api/resume-analysis/:id/preparation
export async function startRoadmap(req, res) {
  const roadmap = await startPreparationRoadmap(req.user, req.params.id);
  res.status(202).json({ roadmap });
}

// PATCH /api/resume-analysis/:id/preparation/topics/:topicId
export async function toggleTopic(req, res) {
  const roadmap = await setTopicCompletion(
    req.user,
    req.params.id,
    req.params.topicId,
    req.body?.completed !== false
  );
  res.json({ roadmap });
}
