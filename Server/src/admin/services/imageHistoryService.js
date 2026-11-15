import mongoose from 'mongoose';
import ImageGeneration from '../../models/ImageGeneration.js';
import Article from '../../models/Article.js';

const PAGE_SIZE = 12;

function serialize(doc) {
  const article = doc.article;

  return {
    id: String(doc._id),
    prompt: doc.prompt,
    model: doc.model,
    aspectRatio: doc.aspectRatio || '16:9',
    url: doc.url || '',
    key: doc.key || '',
    contentType: doc.contentType || '',
    bytes: doc.bytes || 0,
    cost: doc.cost ?? null,
    durationMs: doc.durationMs || 0,
    status: doc.status || 'success',
    error: doc.error || '',
    mediaId: doc.mediaId || '',
    article: article && article._id
      ? { id: String(article._id), title: article.title, slug: article.slug }
      : null,
    createdAt: doc.createdAt,
  };
}

// Recording is best-effort: a failed insert must never lose the image the
// admin already paid for.
export async function recordImageGeneration({
  prompt,
  model,
  aspectRatio = '16:9',
  url = '',
  key = '',
  contentType = '',
  bytes = 0,
  cost = null,
  durationMs = 0,
  status = 'success',
  error = '',
  articleId = null,
  mediaId = '',
} = {}) {
  try {
    const doc = await ImageGeneration.create({
      prompt: String(prompt ?? '').trim().slice(0, 1200),
      model: String(model ?? '').trim(),
      aspectRatio,
      url,
      key,
      contentType,
      bytes,
      cost: cost === undefined || cost === null || cost === ''
        ? null
        : Number.isFinite(Number(cost)) && Number(cost) >= 0
          ? Number(cost)
          : null,
      durationMs: Number(durationMs) > 0 ? Math.round(Number(durationMs)) : 0,
      status,
      error: String(error ?? '').trim().slice(0, 500),
      article: articleId && mongoose.Types.ObjectId.isValid(articleId) ? articleId : null,
      mediaId: String(mediaId ?? '').trim().slice(0, 64),
    });

    return serialize(doc);
  } catch (logError) {
    console.error('Could not record generated image:', logError.message);
    return null;
  }
}

export async function listImageGenerations({ page = 1, limit = PAGE_SIZE, model = '', status = '' } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || PAGE_SIZE, 1), 48);
  const safePage = Math.max(Number(page) || 1, 1);

  const filter = {};
  if (model) filter.model = String(model).trim();
  if (status === 'success' || status === 'error') filter.status = status;

  const [documents, total] = await Promise.all([
    ImageGeneration.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .populate({ path: 'article', select: 'title slug', model: Article })
      .lean(),
    ImageGeneration.countDocuments(filter),
  ]);

  return {
    images: documents.map(serialize),
    pagination: {
      page: Math.min(safePage, Math.max(Math.ceil(total / safeLimit), 1)),
      limit: safeLimit,
      total,
      pages: Math.max(Math.ceil(total / safeLimit), 1),
    },
  };
}
