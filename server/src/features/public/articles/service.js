import mongoose from 'mongoose';
import Article from '../../../models/Article.js';
import { ApiError } from '../../../shared/errors.js';

// Everything a reader needs from an article, plus the fields a topic page
// needs to build its sidebar links from the same query.
const ARTICLE_FIELDS =
  'title subtitle slug content topic publishedAt referenceVideos';

// Sidebar entries only need enough to render a link and fetch the article by id.
export function serializeArticleLink(article) {
  return {
    id: String(article._id),
    title: article.title,
    slug: article.slug,
  };
}

export function serializeArticle(article) {
  return {
    id: String(article._id),
    title: article.title,
    subtitle: article.subtitle || '',
    slug: article.slug,
    content: article.content || null,
    referenceVideos: article.referenceVideos || [],
    publishedAt: article.publishedAt,
  };
}

// Published articles of the given topics, in creation order: the order the
// lessons were written in is the order they read in.
export async function listArticlesForTopics(topicIds) {
  if (!topicIds.length) return [];

  return Article.find({
    status: 'published',
    topic: mongoose.trusted({ $in: topicIds }),
  })
    .select(ARTICLE_FIELDS)
    .sort({ createdAt: 1, _id: 1 })
    .lean();
}

export async function getArticleById(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Article not found');
  }

  const article = await Article.findOne({ _id: id, status: 'published' })
    .select(ARTICLE_FIELDS)
    .lean();
  if (!article) throw new ApiError(404, 'Article not found');

  return serializeArticle(article);
}
