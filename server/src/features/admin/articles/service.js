import mongoose from 'mongoose';
import Article, { ARTICLE_STATUSES } from '../../../models/Article.js';
import Diagram from '../../../models/Diagram.js';
import Topic from '../../../models/Topic.js';
import { ApiError } from '../../../shared/errors.js';
import { slugify, uniqueSlug } from '../../../shared/slug.js';
import { assertObjectId, escapeRegex } from '../../../shared/validation.js';
import { excerptFrom } from '../../../shared/html.js';
import {
  articleDocAssetKeys,
  articleDocDiagramIds,
  articleDocHasContent,
  articleDocText,
  sanitizeArticleDoc,
} from '../../../domain/articles/document.js';
import { deleteArticleAssets } from '../../../infra/storage/r2.js';
import { recountTopics } from '../topics/service.js';

const TITLE_MAX = 200;
const SUBTITLE_MAX = 300;
const PAGE_SIZE = 10;

function serializeTopic(topic) {
  if (!topic || typeof topic !== 'object' || !topic.name) return null;
  return {
    id: String(topic._id),
    name: topic.name,
    slug: topic.slug,
    depth: topic.depth || 0,
    parent: topic.parent ? String(topic.parent) : null,
  };
}

function topicIdOf(article) {
  const topic = article.topic;
  if (!topic) return null;
  if (typeof topic === 'object') {
    const id = topic._id || topic.id;
    return id ? String(id) : null;
  }
  return String(topic);
}

function serializeArticle(article, { withContent = false } = {}) {
  const doc = article.content && typeof article.content === 'object' ? article.content : null;
  const text = doc ? articleDocText(doc) : '';

  return {
    id: String(article._id),
    title: article.title,
    subtitle: article.subtitle || '',
    slug: article.slug,
    topic: serializeTopic(article.topic),
    topicId: topicIdOf(article),
    status: article.status,
    referenceVideos: article.referenceVideos || [],
    excerpt: text ? excerptFrom(text) : '',
    stats: {
      views: article.stats?.views ?? 0,
    },
    publishedAt: article.publishedAt,
    lastEditedAt: article.lastEditedAt,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    ...(withContent ? { content: doc } : {}),
  };
}

function cleanTitle(value) {
  const title = String(value ?? '').trim();
  if (!title) throw new ApiError(400, 'Article title is required');
  if (title.length > TITLE_MAX) throw new ApiError(400, `Title must be ${TITLE_MAX} characters or fewer`);
  return title;
}

function cleanStatus(value, fallback = 'draft') {
  if (value === undefined) return fallback;
  if (!ARTICLE_STATUSES.includes(value)) {
    throw new ApiError(400, `Status must be one of: ${ARTICLE_STATUSES.join(', ')}`);
  }
  return value;
}

function normalizeVideos(value) {
  const list = Array.isArray(value) ? value : String(value ?? '').split('\n');
  return [...new Set(list.map((url) => String(url).trim()).filter(Boolean))].slice(0, 8);
}

function cleanSubtitle(value) {
  return String(value ?? '').trim().slice(0, SUBTITLE_MAX);
}

async function getDocument(id) {
  assertObjectId(id, 'Invalid article id');
  const article = await Article.findById(id).populate('topic', 'name slug depth parent');
  if (!article) throw new ApiError(404, 'Article not found');
  return article;
}

function topicIdFromPayload(payload) {
  const value = payload.topicId ?? payload.topic;
  if (value == null) return '';
  if (typeof value === 'object') return value.id ?? value._id ?? '';
  return value;
}

async function resolveTopic(payload) {
  const id = topicIdFromPayload(payload);
  if (!id) throw new ApiError(400, 'Select a topic for this article');
  assertObjectId(id, 'Invalid topic');

  const topic = await Topic.findById(id).select('_id').lean();
  if (!topic) throw new ApiError(400, 'Topic not found');
  return topic._id;
}

async function refreshTopicCounts() {
  try {
    await recountTopics();
  } catch (error) {
    console.error('Failed to refresh topic article counts:', error.message);
  }
}

function assetKeyBelongsToArticle(key, articleId) {
  return (
    key.startsWith('article-media/') ||
    key.startsWith(`articles/${articleId}/diagrams/`)
  );
}

async function cleanupDiagramDocuments(articleId, diagramIds) {
  const objectIds = [...diagramIds].filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!objectIds.length) return;
  await Diagram.deleteMany({
    article: articleId,
    _id: mongoose.trusted({ $in: objectIds }),
  });
}

export async function listArticles({
  search = '',
  status = 'all',
  topic = '',
  page = 1,
  limit = PAGE_SIZE,
} = {}) {
  const filter = {};

  if (status && status !== 'all') {
    if (!ARTICLE_STATUSES.includes(status)) throw new ApiError(400, 'Invalid status filter');
    filter.status = status;
  }

  if (topic) {
    assertObjectId(topic, 'Invalid topic filter');
    filter.topic = topic;
  }

  const term = String(search || '').trim();
  if (term) {
    const rx = new RegExp(escapeRegex(term), 'i');
    filter.$or = [{ title: rx }, { subtitle: rx }, { slug: rx }];
  }

  const safeLimit = Math.min(Math.max(Number(limit) || PAGE_SIZE, 1), 50);
  const safePage = Math.max(Number(page) || 1, 1);

  const [articles, total, statusRows] = await Promise.all([
    Article.find(filter)
      .select('-content')
      .populate('topic', 'name slug depth parent')
      .sort({ updatedAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    Article.countDocuments(filter),
    Article.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const counts = { all: 0, draft: 0, published: 0, archived: 0 };
  for (const row of statusRows) {
    if (row._id in counts) counts[row._id] = row.count;
    counts.all += row.count;
  }

  return {
    articles: articles.map((article) => serializeArticle(article)),
    counts,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.max(Math.ceil(total / safeLimit), 1),
    },
  };
}

export async function getArticle(id) {
  const article = await getDocument(id);
  return serializeArticle(article, { withContent: true });
}

export async function createArticle(payload = {}) {
  const title = cleanTitle(payload.title);
  const topic = await resolveTopic(payload);
  const status = cleanStatus(payload.status);
  const incomingDoc =
    payload.contentJson !== undefined ? payload.contentJson : payload.content;
  const doc = sanitizeArticleDoc(incomingDoc);
  if (!doc) throw new ApiError(400, 'The article content document is required and must be valid');

  if (status === 'published' && !articleDocHasContent(doc)) {
    throw new ApiError(400, 'Write some article content before publishing');
  }

  const slug = await uniqueSlug(Article, payload.slug || slugify(title));
  const now = new Date();

  const article = await Article.create({
    title,
    subtitle: cleanSubtitle(payload.subtitle),
    slug,
    topic,
    referenceVideos: normalizeVideos(payload.referenceVideos),
    content: doc,
    status,
    publishedAt: status === 'published' ? now : null,
    lastEditedAt: now,
  });

  await refreshTopicCounts();
  return getArticle(article._id);
}

export async function updateArticle(id, payload = {}) {
  const article = await getDocument(id);
  const previousTitle = article.title;
  const previousStatus = article.status;

  if (payload.title !== undefined) article.title = cleanTitle(payload.title);
  if (payload.subtitle !== undefined) article.subtitle = cleanSubtitle(payload.subtitle);

  if (payload.topicId !== undefined || payload.topic !== undefined) {
    article.topic = await resolveTopic(payload);
  }

  if (payload.referenceVideos !== undefined) {
    article.referenceVideos = normalizeVideos(payload.referenceVideos);
  }

  const hasDoc = payload.contentJson !== undefined || payload.content !== undefined;
  let removedAssetKeys = [];
  let removedDiagramIds = [];

  if (hasDoc) {
    const incomingDoc = payload.contentJson ?? payload.content;
    const doc = sanitizeArticleDoc(incomingDoc);
    if (!doc) throw new ApiError(400, 'The article content document is required and must be valid');

    const previousKeys = articleDocAssetKeys(article.content);
    const nextKeys = new Set(articleDocAssetKeys(doc));
    removedAssetKeys = previousKeys.filter(
      (key) => !nextKeys.has(key) && assetKeyBelongsToArticle(key, article._id),
    );

    const previousDiagrams = articleDocDiagramIds(article.content);
    const nextDiagrams = articleDocDiagramIds(doc);
    removedDiagramIds = [...previousDiagrams].filter((diagramId) => !nextDiagrams.has(diagramId));

    article.content = doc;
  }

  if (payload.status !== undefined) {
    const status = cleanStatus(payload.status, article.status);
    if (status === 'published' && !article.publishedAt) article.publishedAt = new Date();
    const hasContent = articleDocHasContent(article.content);
    if (status === 'published' && !hasContent) {
      throw new ApiError(400, 'Write some article content before publishing');
    }
    article.status = status;
  }

  // The URL slug follows the title that is actually being saved, not the one
  // the AI suggested for the first draft. Explicit slugs (API clients) win;
  // otherwise regenerate when the title changes or the article is published.
  const explicitSlug = payload.slug !== undefined ? slugify(payload.slug) : '';
  const titleChanged = article.title !== previousTitle;
  const isBeingPublished = article.status === 'published' && previousStatus !== 'published';

  if (explicitSlug) {
    if (explicitSlug !== article.slug) {
      article.slug = await uniqueSlug(Article, explicitSlug, article._id);
    }
  } else if (titleChanged || isBeingPublished) {
    article.slug = await uniqueSlug(Article, slugify(article.title), article._id);
  }

  article.lastEditedAt = new Date();
  await article.save();
  await refreshTopicCounts();

  if (removedDiagramIds.length) {
    try {
      await cleanupDiagramDocuments(article._id, removedDiagramIds);
    } catch (error) {
      console.error('Failed to clean up removed article diagrams:', error.message);
    }
  }

  if (removedAssetKeys.length) {
    try {
      await deleteArticleAssets(removedAssetKeys);
    } catch (error) {
      console.error('Failed to clean up removed article assets:', error.message);
    }
  }

  return getArticle(article._id);
}

export async function deleteArticle(id) {
  const article = await getDocument(id);
  const assetKeys = articleDocAssetKeys(article.content).filter((key) =>
    assetKeyBelongsToArticle(key, article._id),
  );

  await Promise.all([
    Diagram.deleteMany({ article: article._id }),
    Article.deleteOne({ _id: article._id }),
  ]);
  await refreshTopicCounts();

  if (assetKeys.length) {
    try {
      await deleteArticleAssets(assetKeys);
    } catch (error) {
      console.error('Failed to clean up deleted article assets:', error.message);
    }
  }

  return { id: String(article._id) };
}

// Used by the diagram service once a generated or uploaded image has been
// stored. Only the referenced node attributes change; diagram structure stays
// in the Diagram collection.
export async function setArticleDiagramAsset(articleId, diagramId, asset = {}) {
  const article = await getDocument(articleId);
  const doc = sanitizeArticleDoc(article.content);
  if (!doc) throw new ApiError(400, 'The article content document is required and must be valid');

  let updated = false;
  const visit = (node) => {
    if (!node) return;
    if (node.type === 'articleDiagram' && node.attrs?.diagramId === String(diagramId)) {
      node.attrs = {
        ...node.attrs,
        ...(asset.assetKey ? { assetKey: String(asset.assetKey) } : {}),
        ...(asset.assetUrl ? { assetUrl: String(asset.assetUrl) } : {}),
        ...(asset.alt ? { alt: String(asset.alt).slice(0, 500) } : {}),
        ...(asset.caption ? { caption: String(asset.caption).slice(0, 500) } : {}),
      };
      updated = true;
    }
    (node.content || []).forEach(visit);
  };
  visit(doc);

  if (!updated) throw new ApiError(404, 'This article has no placeholder for that diagram');

  article.content = doc;
  article.lastEditedAt = new Date();
  await article.save();

  return { content: article.content };
}
