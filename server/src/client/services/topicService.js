import Topic from '../../models/Topic.js';
import { ApiError } from '../../shared/apiError.js';
import {
  listArticlesForTopics,
  serializeArticle,
  serializeArticleLink,
} from './articleService.js';

// Parent topics listed on the home page.
export async function listParentTopics() {
  const topics = await Topic.find({ depth: 0 })
    .select('name slug description coverImage sortOrder')
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  return topics.map((topic) => ({
    id: String(topic._id),
    name: topic.name,
    slug: topic.slug,
    description: topic.description || '',
    coverImage: topic.coverImage || {},
  }));
}

function serializeTopic(topic) {
  return {
    id: String(topic._id),
    name: topic.name,
    slug: topic.slug,
    description: topic.description || '',
  };
}

function indexByTopic(articles) {
  const byTopic = new Map();
  for (const article of articles) {
    const key = article.topic ? String(article.topic) : '';
    if (!key) continue;
    if (!byTopic.has(key)) byTopic.set(key, []);
    byTopic.get(key).push(article);
  }
  return byTopic;
}

// The article a topic opens on: the Introduction section when one exists,
// otherwise the first article the topic has.
function findDefaultArticle(root, subtopics, articlesOf) {
  const intro = subtopics.find(
    (subtopic) =>
      subtopic.slug === 'introduction' ||
      subtopic.name.trim().toLowerCase() === 'introduction',
  );
  if (intro) {
    const [article] = articlesOf(intro);
    if (article) return article;
  }

  const direct = articlesOf(root);
  const introArticle = direct.find((article) => /^introduction\b/i.test(article.title));
  if (introArticle) return introArticle;
  if (direct.length) return direct[0];

  for (const subtopic of subtopics) {
    const [article] = articlesOf(subtopic);
    if (article) return article;
  }

  return null;
}

// A topic page arrives in one request: its subtopics with lightweight article
// links, any articles sitting directly on the topic, and the opening article.
export async function getTopicContent(slug) {
  const root = await Topic.findOne({ slug, parent: null })
    .select('name slug description')
    .lean();
  if (!root) throw new ApiError(404, 'Topic not found');

  const subtopics = await Topic.find({ parent: root._id })
    .select('name slug')
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const published = await listArticlesForTopics([
    root._id,
    ...subtopics.map((subtopic) => subtopic._id),
  ]);

  const byTopic = indexByTopic(published);
  const articlesOf = (topic) => byTopic.get(String(topic._id)) ?? [];

  const featured = findDefaultArticle(root, subtopics, articlesOf);

  return {
    topic: serializeTopic(root),
    subtopics: subtopics.map((subtopic) => ({
      ...serializeTopic(subtopic),
      articles: articlesOf(subtopic).map(serializeArticleLink),
    })),
    articles: articlesOf(root).map(serializeArticleLink),
    defaultArticle: featured ? serializeArticle(featured) : null,
  };
}
