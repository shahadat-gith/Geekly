import * as articleService from './service.js';

export async function list(req, res) {
  const result = await articleService.listArticles({
    search: req.query.search,
    status: req.query.status,
    topic: req.query.topic,
    page: req.query.page,
    limit: req.query.limit,
  });
  res.json(result);
}

export async function get(req, res) {
  const article = await articleService.getArticle(req.params.id);
  res.json({ article });
}

export async function create(req, res) {
  const article = await articleService.createArticle(req.body);
  res.status(201).json({ article });
}

export async function update(req, res) {
  const article = await articleService.updateArticle(req.params.id, req.body);
  res.json({ article });
}

export async function remove(req, res) {
  const result = await articleService.deleteArticle(req.params.id);
  res.json({ message: 'Article deleted', ...result });
}
