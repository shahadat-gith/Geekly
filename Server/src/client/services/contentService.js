import mongoose from 'mongoose';
import Article from '../../models/Article.js';
import Topic from '../../models/Topic.js';
import { ApiError } from '../../shared/apiError.js';
import { excerptFrom } from '../../admin/utils/html.js';

// Public content is addressed by its URL path:
//   /system-design                        -> a top-level topic
//   /system-design/basics                 -> the same topic with a sub-topic open
//   /system-design/basics/caching         -> one published article
// Sub-topics never get their own page; they open inside the parent topic.

function serializeTopic(topic) {
  return {
    id: String(topic._id),
    name: topic.name,
    slug: topic.slug,
    description: topic.description || '',
    coverImage: topic.coverImage || {},
    depth: topic.depth || 0,
    parent: topic.parent ? String(topic.parent) : null,
    articleCount: topic.articleCount || 0,
  };
}

function serializeArticle(article) {
  return {
    id: String(article._id),
    title: article.title,
    subtitle: article.subtitle || '',
    slug: article.slug,
    excerpt: excerptFrom(article.content?.html || ''),
    publishedAt: article.publishedAt,
  };
}

async function findTopic(slug, parent = null) {
  return Topic.findOne({ slug, parent }).lean();
}

async function buildTopicPage(root) {
  const children = await Topic.find({ parent: root._id })
    .select('name slug description coverImage depth parent sortOrder articleCount')
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const topicIds = [root._id, ...children.map((child) => child._id)];

  const articles = await Article.find({
    status: 'published',
    topics: mongoose.trusted({ $in: topicIds }),
  })
    .select('title subtitle slug content.html publishedAt topics')
    .sort({ publishedAt: -1 })
    .lean();

  const byTopic = new Map();
  for (const article of articles) {
    const topicId = String(article.topics?.[0] || '');
    if (!byTopic.has(topicId)) byTopic.set(topicId, []);
    byTopic.get(topicId).push(serializeArticle(article));
  }

  return {
    type: 'topic',
    topic: serializeTopic(root),
    subtopics: children.map((child) => ({
      ...serializeTopic(child),
      articles: byTopic.get(String(child._id)) || [],
    })),
    articles: byTopic.get(String(root._id)) || [],
  };
}

function buildArticlePage(article, root, topic) {
  return {
    type: 'article',
    topic: { slug: root.slug, name: root.name },
    subtopic: String(topic._id) === String(root._id)
      ? null
      : { slug: topic.slug, name: topic.name },
    article: {
      ...serializeArticle(article),
      content: {
        html: article.content?.html || '',
        media: (article.content?.media || []).map((item) => ({
          id: item.id,
          imagePrompt: item.imagePrompt || '',
          imageUrl: item.imageUrl || '',
          alt: item.alt || '',
          caption: item.caption || '',
        })),
      },
      tags: article.tags || [],
      referenceVideos: article.referenceVideos || [],
      updatedAt: article.updatedAt,
    },
  };
}

export async function resolveContent(path) {
  const segments = String(path || '')
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0 || segments.length > 3) {
    throw new ApiError(404, 'Page not found');
  }

  const root = await findTopic(segments[0]);
  if (!root) throw new ApiError(404, 'Topic not found');
  if (root.parent) {
    throw new ApiError(404, 'Topic not found');
  }

  if (segments.length === 1) {
    return buildTopicPage(root);
  }

  const child = await findTopic(segments[1], root._id);

  if (child) {
    if (segments.length === 2) return buildTopicPage(root);

    const article = await Article.findOne({
      slug: segments[2],
      status: 'published',
      topics: child._id,
    })
      .select('title subtitle slug content.html content.media publishedAt updatedAt topics tags referenceVideos')
      .lean();

    if (!article) throw new ApiError(404, 'Article not found');
    return buildArticlePage(article, root, child);
  }

  // An article can also sit directly on the top-level topic.
  if (segments.length === 2) {
    const article = await Article.findOne({
      slug: segments[1],
      status: 'published',
      topics: root._id,
    })
      .select('title subtitle slug content.html content.media publishedAt updatedAt topics tags referenceVideos')
      .lean();

    if (article) return buildArticlePage(article, root, root);
  }

  throw new ApiError(404, 'Page not found');
}
