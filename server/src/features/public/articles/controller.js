import { getArticleById } from './service.js';

// GET /api/articles/:id
// One published article, fetched when a reader picks it from the sidebar.
export async function getArticle(req, res) {
  const article = await getArticleById(req.params.id);
  res.json({ article });
}
