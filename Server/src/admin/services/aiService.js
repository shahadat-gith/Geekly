import mongoose from 'mongoose';
import {
  ARTICLE_SYSTEM_PROMPT,
  buildArticlePrompt,
  generateContent,
  generateImage,
} from '../../llm/index.js';
import Topic from '../../models/Topic.js';
import { ApiError } from '../../shared/apiError.js';
import { uploadAiGeneratedImage } from '../../config/storage.js';
import { htmlToText, sanitizeHtml } from '../utils/html.js';
import { mediaIdsInHtml, normalizeMedia } from '../utils/media.js';
import { fetchReference } from '../utils/referenceFetcher.js';
import { createArticle } from './articleService.js';
import { recordAiUsage } from './aiUsageService.js';
import { recordImageGeneration } from './imageHistoryService.js';
import { requireDefaultModel } from './aiModelService.js';

const IMAGE_ASPECT_RATIOS = ['16:9', '4:3', '1:1', '3:4', '9:16'];

const MAX_IMAGE_PROMPT = 1200;
const IMAGE_EXTENSIONS = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['image/avif', 'avif'],
  ['image/svg+xml', 'svg'],
]);

function reportedCost(usage) {
  const value = usage?.cost;
  if (value === undefined || value === null || value === '') return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function parseJson(content) {
  const source = String(content ?? '').trim().replace(/^```(?:json)?\s*|\s*```$/gi, '');
  try {
    return JSON.parse(source);
  } catch {
    const start = source.indexOf('{');
    const end = source.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(source.slice(start, end + 1));
      } catch {
        // Return a consistent provider error below.
      }
    }
  }
  throw new ApiError(502, 'The AI response was not valid JSON. Try generating again.');
}

function cleanText(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

function normalizeTags(value) {
  const tags = Array.isArray(value) ? value : String(value ?? '').split(',');
  return [...new Set(tags.map((tag) => String(tag).trim().toLowerCase().replace(/^#/, '')).filter(Boolean))].slice(0, 8);
}

// The model may wrap content inside figure placeholders; only the id matters.
function normalizeFigureMarkup(html) {
  return html.replace(
    /<figure\b[^>]*data-article-media\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*>[\s\S]*?<\/figure>/gi,
    (_match, doubleQuoted, singleQuoted) =>
      `<figure data-article-media="${doubleQuoted || singleQuoted}"></figure>`
  );
}

function mediaForHtml(html, incoming) {
  const media = normalizeMedia(incoming);
  const byId = new Map(media.map((item) => [item.id, item]));
  return [...mediaIdsInHtml(html)]
    .map((id) => byId.get(id) || {
      id,
      imagePrompt: '',
      imageUrl: '',
      imageKey: '',
      alt: '',
      caption: '',
    })
    .slice(0, 8);
}

async function getTopic(topicId) {
  if (!topicId || !mongoose.Types.ObjectId.isValid(topicId)) {
    throw new ApiError(400, 'Choose a valid topic before generating an article');
  }

  const topic = await Topic.findById(topicId).lean();
  if (!topic) throw new ApiError(400, 'The selected topic no longer exists');

  const ancestors = Array.isArray(topic.ancestors) ? topic.ancestors : [];
  const parents = await Promise.all(
    ancestors.map((id) => Topic.findById(id).select('name').lean())
  );
  const names = new Map(parents.filter(Boolean).map((parent) => [String(parent._id), parent.name]));

  return {
    id: String(topic._id),
    name: topic.name,
    path: [...ancestors.map((id) => names.get(String(id))).filter(Boolean), topic.name].join(' / '),
    description: topic.description || '',
  };
}

/** Write a full article draft with the default text model. */
export async function generateArticle(payload = {}) {
  const startedAt = Date.now();
  const selectedModel = await requireDefaultModel('text');
  const modelId = selectedModel.modelId;

  let reference = null;
  let usage = null;
  let model = modelId;
  let attempted = false;

  try {
    const topic = await getTopic(payload.topicId ?? payload.topic);
    const instructions = cleanText(payload.instructions, 2_000);
    const fetched = await fetchReference(payload.reference);
    reference = fetched.reference;
    const warnings = fetched.warning ? [fetched.warning] : [];

    attempted = true;
    const generated = await generateContent({
      system: ARTICLE_SYSTEM_PROMPT,
      prompt: buildArticlePrompt({ topic, reference, instructions }),
      temperature: null,
      json: true,
      model: modelId,
    });

    usage = generated.usage;
    model = generated.model || model;

    const parsed = parseJson(generated.content);
    const html = normalizeFigureMarkup(sanitizeHtml(parsed.html));
    if (!htmlToText(html) && mediaIdsInHtml(html).size === 0) {
      throw new ApiError(502, 'The AI returned no usable article content. Try again.');
    }

    const article = await createArticle({
      title: cleanText(parsed.title, 200) || topic.name,
      subtitle: cleanText(parsed.subtitle, 300),
      topicId: topic.id,
      tags: normalizeTags(parsed.tags),
      contentHtml: html,
      media: mediaForHtml(html, parsed.media),
      status: 'draft',
    });

    await recordAiUsage({
      user: 'admin',
      model,
      status: 'success',
      promptTokens: usage?.promptTokens,
      completionTokens: usage?.completionTokens,
      cost: usage?.cost,
      durationMs: Date.now() - startedAt,
    });

    return {
      article,
      reference: reference
        ? { url: reference.url, title: reference.title, characters: reference.text.length }
        : null,
      warnings,
      model,
      usage,
    };
  } catch (error) {
    if (attempted) {
      await recordAiUsage({
        user: 'admin',
        model,
        status: 'error',
        promptTokens: usage?.promptTokens,
        completionTokens: usage?.completionTokens,
        cost: usage?.cost,
        durationMs: Date.now() - startedAt,
        error: error.message,
      });
    }

    if (error instanceof ApiError) throw error;
    throw new ApiError(error.status || 502, error.message || 'The AI provider failed to generate the article.');
  }
}

/** Generate one article image with the default image model and keep its details. */
export async function generateArticleImage(payload = {}) {
  const prompt = cleanText(payload.prompt, MAX_IMAGE_PROMPT);
  if (!prompt) throw new ApiError(400, 'Write a prompt before generating an image.');

  const selectedModel = await requireDefaultModel('image');

  const aspectRatio = IMAGE_ASPECT_RATIOS.includes(payload.aspectRatio)
    ? payload.aspectRatio
    : '16:9';

  const articleId = payload.articleId ?? null;
  const mediaId = cleanText(payload.mediaId, 64);
  const startedAt = Date.now();
  let generated = null;

  try {
    generated = await generateImage({
      prompt,
      aspectRatio,
      model: selectedModel.modelId,
    });

    const contentType = generated.contentType || 'image/png';
    const buffer = generated.buffer;
    const uploaded = await uploadAiGeneratedImage({
      buffer,
      contentType,
      extension: IMAGE_EXTENSIONS.get(contentType) || 'png',
    });

    const cost = reportedCost(generated.usage);

    const record = await recordImageGeneration({
      prompt,
      model: generated.model || selectedModel.modelId,
      aspectRatio,
      url: uploaded.url,
      key: uploaded.key,
      contentType,
      bytes: buffer.length,
      cost,
      durationMs: Date.now() - startedAt,
      status: 'success',
      articleId,
      mediaId,
    });

    await recordAiUsage({
      user: 'admin',
      feature: 'image-generation',
      model: generated.model || selectedModel.modelId,
      status: 'success',
      promptTokens: generated.usage?.prompt_tokens,
      completionTokens: generated.usage?.completion_tokens,
      cost,
      durationMs: Date.now() - startedAt,
    });

    return {
      image: record || {
        id: '',
        prompt,
        model: generated.model || selectedModel.modelId,
        aspectRatio,
        url: uploaded.url,
        key: uploaded.key,
        contentType,
        bytes: buffer.length,
        cost,
        durationMs: Date.now() - startedAt,
        status: 'success',
      },
      usage: generated.usage
        ? {
            promptTokens: generated.usage.prompt_tokens ?? 0,
            completionTokens: generated.usage.completion_tokens ?? 0,
            totalTokens: generated.usage.total_tokens ?? 0,
            cost: reportedCost(generated.usage),
          }
        : null,
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    await recordImageGeneration({
      prompt,
      model: selectedModel.modelId,
      aspectRatio,
      durationMs,
      status: 'error',
      error: error.message,
      articleId,
      mediaId,
    });

    await recordAiUsage({
      user: 'admin',
      feature: 'image-generation',
      model: selectedModel.modelId,
      status: 'error',
      promptTokens: generated?.usage?.prompt_tokens,
      completionTokens: generated?.usage?.completion_tokens,
      cost: reportedCost(generated?.usage),
      durationMs,
      error: error.message,
    });

    if (error instanceof ApiError) throw error;
    throw new ApiError(error.status || 502, error.message || 'The image could not be generated.');
  }
}
