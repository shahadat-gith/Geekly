import { resolveContent } from '../services/contentService.js';

// GET /api/content?path=system-design/basics
// One endpoint resolves a nested content path to either a topic or an article.
export async function resolve(req, res) {
  const content = await resolveContent(req.query.path);
  res.json(content);
}
