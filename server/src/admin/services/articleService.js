import mongoose from 'mongoose';
import Article, { ARTICLE_STATUSES } from '../../models/Article.js';
import ArticleBlock from '../../models/ArticleBlock.js';
import Topic from '../../models/Topic.js';
import { ApiError } from '../../shared/apiError.js';
import { slugify, uniqueSlug } from '../utils/slug.js';
import { excerptFrom, sanitizeHtml } from '../utils/html.js';
import { mediaImageKeys, pruneMediaToHtml } from '../utils/media.js';
import { deleteArticleImages } from '../../config/storage.js';
import { recountTopics } from './topicService.js';

const TITLE_MAX = 200;
const SUBTITLE_MAX = 300;
const PAGE_SIZE = 10;

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertObjectId(id, message = 'Invalid article id') {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, message);
}

function serializeTopic(topic) {
  return {
    id: String(topic._id),
    name: topic.name,
    slug: topic.slug,
    depth: topic.depth || 0,
    parent: topic.parent ? String(topic.parent) : null,
  };
}

function serializeArticle(article, { withContent = false } = {}) {
  const topics = (article.topics || [])
    .filter((topic) => topic && typeof topic === 'object' && topic._id)
    .map(serializeTopic);
  const content = article.content || {};

  return {
    id: String(article._id),
    title: article.title,
    subtitle: article.subtitle || '',
    slug: article.slug,
    status: article.status,
    topics,
    topicIds: topics.map((topic) => topic.id),
    tags: article.tags || [],
    referenceVideos: article.referenceVideos || [],
    excerpt: content.html ? excerptFrom(content.html) : '',
    stats: {
      views: article.stats?.views ?? 0,
      reactions: article.stats?.reactions ?? 0,
      comments: article.stats?.comments ?? 0,
      bookmarks: article.stats?.bookmarks ?? 0,
    },
    publishedAt: article.publishedAt,
    lastEditedAt: article.lastEditedAt,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    ...(withContent
      ? {
          content: {
            html: content.html || '',
            media: (content.media || []).map((item) => ({
              id: item.id,
              imagePrompt: item.imagePrompt || '',
              imageUrl: item.imageUrl || '',
              imageKey: item.imageKey || '',
              alt: item.alt || '',
              caption: item.caption || '',
            })),
          },
        }
      : {}),
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

function normalizeTags(value) {
  const list = Array.isArray(value) ? value : String(value ?? '').split(',');
  return [...new Set(
    list.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)
  )].slice(0, 12);
}

function normalizeVideos(value) {
  const list = Array.isArray(value) ? value : String(value ?? '').split('\n');
  return [...new Set(list.map((url) => String(url).trim()).filter(Boolean))].slice(0, 8);
}

async function resolveTopic(topicId) {
  if (!topicId) throw new ApiError(400, 'Choose a topic before saving this article');
  if (!mongoose.Types.ObjectId.isValid(topicId)) throw new ApiError(400, 'Invalid topic');

  const topic = await Topic.findById(topicId);
  if (!topic) throw new ApiError(400, 'The selected topic no longer exists');
  return topic;
}

async function getDocument(id) {
  assertObjectId(id);
  const article = await Article.findById(id).populate('topics', 'name slug depth parent');
  if (!article) throw new ApiError(404, 'Article not found');
  return article;
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
    if (!mongoose.Types.ObjectId.isValid(topic)) throw new ApiError(400, 'Invalid topic filter');
    filter.topics = topic;
  }

  const term = String(search || '').trim();
  if (term) {
    const rx = new RegExp(escapeRegex(term), 'i');
    filter.$or = [{ title: rx }, { subtitle: rx }, { slug: rx }, { tags: rx }];
  }

  const safeLimit = Math.min(Math.max(Number(limit) || PAGE_SIZE, 1), 50);
  const safePage = Math.max(Number(page) || 1, 1);

  const [articles, total, statusRows] = await Promise.all([
    Article.find(filter)
      .select('-content')
      .sort({ updatedAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .populate('topics', 'name slug depth parent')
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
  const status = cleanStatus(payload.status);
  const topic = await resolveTopic(payload.topicId ?? payload.topic);
  const html = sanitizeHtml(payload.contentHtml ?? payload.content?.html);

  if (!html && status === 'published') {
    throw new ApiError(400, 'Write some article content before publishing');
  }

  const slug = await uniqueSlug(Article, payload.slug || slugify(title));
  const now = new Date();

  const article = await Article.create({
    title,
    subtitle: String(payload.subtitle ?? '').trim().slice(0, SUBTITLE_MAX),
    slug,
    topics: [topic._id],
    tags: normalizeTags(payload.tags),
    referenceVideos: normalizeVideos(payload.referenceVideos),
    content: { html, blocks: [], media: pruneMediaToHtml(html, payload.media ?? payload.content?.media) },
    status,
    publishedAt: status === 'published' ? now : null,
    lastEditedAt: now,
  });

  await recountTopics();

  return getArticle(article._id);
}

export async function updateArticle(id, payload = {}) {
  const article = await getDocument(id);

  if (payload.title !== undefined) article.title = cleanTitle(payload.title);
  if (payload.subtitle !== undefined) {
    article.subtitle = String(payload.subtitle ?? '').trim().slice(0, SUBTITLE_MAX);
  }

  if (payload.topicId !== undefined || payload.topic !== undefined) {
    const topic = await resolveTopic(payload.topicId ?? payload.topic);
    article.topics = [topic._id];
  }

  if (payload.slug !== undefined) {
    const base = slugify(payload.slug);
    if (base && base !== article.slug) {
      article.slug = await uniqueSlug(Article, base, article._id);
    }
  }

  if (payload.tags !== undefined) article.tags = normalizeTags(payload.tags);
  if (payload.referenceVideos !== undefined) {
    article.referenceVideos = normalizeVideos(payload.referenceVideos);
  }

  const hasHtml = payload.contentHtml !== undefined || payload.content?.html !== undefined;
  const hasMedia = payload.media !== undefined || payload.content?.media !== undefined;

  if (hasHtml || hasMedia) {
    const current = article.content?.toObject?.() ?? article.content ?? {};
    const previousImageKeys = mediaImageKeys(current.media);
    const html = hasHtml
      ? sanitizeHtml(payload.contentHtml ?? payload.content?.html)
      : current.html || '';
    const incomingMedia = hasMedia ? payload.media ?? payload.content?.media : current.media;

    const nextMedia = pruneMediaToHtml(html, incomingMedia);
    article.content = {
      ...current,
      html,
      blocks: article.content?.blocks || [],
      media: nextMedia,
    };

    const nextImageKeys = new Set(mediaImageKeys(nextMedia));
    const removedImageKeys = previousImageKeys.filter((key) => !nextImageKeys.has(key));
    if (removedImageKeys.length) {
      article.$locals.removedImageKeys = removedImageKeys;
    }
  }

  if (payload.status !== undefined) {
    const status = cleanStatus(payload.status, article.status);
    if (status === 'published' && !article.publishedAt) article.publishedAt = new Date();
    if (status === 'published' && !article.content?.html?.trim()) {
      throw new ApiError(400, 'Write some article content before publishing');
    }
    article.status = status;
  }

  article.lastEditedAt = new Date();
  await article.save();
  await recountTopics();

  if (article.$locals.removedImageKeys?.length) {
    try {
      await deleteArticleImages(article.$locals.removedImageKeys);
    } catch (error) {
      console.error('Failed to clean up removed article images:', error.message);
    }
  }

  return getArticle(article._id);
}

export async function deleteArticle(id) {
  const article = await getDocument(id);

  const imageKeys = mediaImageKeys(article.content?.media);
  await Promise.all([
    ArticleBlock.deleteMany({ article: article._id }),
    Article.deleteOne({ _id: article._id }),
  ]);
  if (imageKeys.length) {
    try {
      await deleteArticleImages(imageKeys);
    } catch (error) {
      console.error('Failed to clean up deleted article images:', error.message);
    }
  }
  await recountTopics();

  return { id: String(article._id) };
}
