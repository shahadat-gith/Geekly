import mongoose from 'mongoose';
import {
  ARTICLE_SYSTEM_PROMPT,
  buildArticlePrompt,
  generateContent,
  validateDiagram,
} from '../../llm/index.js';
import Topic from '../../models/Topic.js';
import Diagram from '../../models/Diagram.js';
import { ApiError } from '../../shared/apiError.js';
import { sanitizeHtml } from '../utils/html.js';
import { articleDocHasContent, htmlToArticleDoc } from '../utils/articleDoc.js';
import { fetchReference } from '../utils/referenceFetcher.js';
import { createArticle, deleteArticle, getArticle } from './articleService.js';
import { recordAiUsage } from './aiUsageService.js';
import { requireDefaultModel } from './aiModelService.js';

const DIAGRAM_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;

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

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

// The model may wrap diagram placeholders in other markup. The placeholder id
// is the only part the pipeline needs.
function normalizeFigureMarkup(html) {
  return String(html ?? '')
    .replace(
      /<figure\b[^>]*data-article-diagram\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*>[\s\S]*?<\/figure>/gi,
      (_match, doubleQuoted, singleQuoted) =>
        `<figure data-article-diagram="${doubleQuoted || singleQuoted}"></figure>`,
    )
    .replace(
      /<figure\b[^>]*data-article-media\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*>[\s\S]*?<\/figure>/gi,
      '',
    );
}

function diagramPlaceholderNodes(doc) {
  const nodes = [];
  const visit = (node) => {
    if (!node) return;
    if (node.type === 'articleDiagram') nodes.push(node);
    (node.content || []).forEach(visit);
  };
  visit(doc);
  return nodes;
}

function prepareDiagrams(rawDiagrams) {
  if (rawDiagrams === undefined || rawDiagrams === null) return [];
  if (!Array.isArray(rawDiagrams)) {
    throw new ApiError(502, 'The AI returned diagram data in an unsupported shape.');
  }
  const seen = new Set();
  return rawDiagrams.map((raw, index) => {
    if (!isObject(raw)) {
      throw new ApiError(502, 'The AI returned an invalid diagram entry.');
    }

    const key = cleanText(raw.id, 64) || `viz-${index + 1}`;
    if (!DIAGRAM_KEY_PATTERN.test(key)) {
      throw new ApiError(502, `The AI returned an invalid diagram id "${key}".`);
    }
    if (seen.has(key)) {
      throw new ApiError(502, `The AI returned duplicate diagram id "${key}".`);
    }
    seen.add(key);

    let data;
    try {
      data = validateDiagram({
        title: raw.title,
        caption: raw.caption,
        direction: raw.direction,
        nodes: raw.nodes,
        edges: raw.edges,
        groups: raw.groups,
      });
    } catch (error) {
      throw new ApiError(
        502,
        `The AI returned invalid data for diagram "${key}": ${error.message}`,
      );
    }

    return {
      key,
      data,
      objectId: new mongoose.Types.ObjectId(),
    };
  });
}

function attachDiagramIds(doc, diagrams) {
  if (!diagrams.length) {
    if (diagramPlaceholderNodes(doc).length) {
      throw new ApiError(502, 'The AI inserted diagram placeholders without matching diagram data.');
    }
    return;
  }

  const byKey = new Map(diagrams.map((diagram) => [diagram.key, diagram]));
  const nodes = diagramPlaceholderNodes(doc);
  const seen = new Set();

  for (const node of nodes) {
    const key = String(node.attrs?.diagramId || '');
    const diagram = byKey.get(key);
    if (!diagram) {
      throw new ApiError(502, `The AI inserted a placeholder for unknown diagram "${key}".`);
    }
    if (seen.has(key)) {
      throw new ApiError(502, `The AI inserted the diagram "${key}" placeholder more than once.`);
    }
    seen.add(key);
    node.attrs.diagramId = String(diagram.objectId);
    node.attrs.alt = diagram.data.title;
    node.attrs.caption = diagram.data.caption || diagram.data.title;
  }

  for (const diagram of diagrams) {
    if (!seen.has(diagram.key)) {
      throw new ApiError(502, `The AI returned diagram "${diagram.key}" without an article placeholder.`);
    }
  }
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

/** Write a full article draft and its structured diagrams with the text model. */
export async function generateArticle(payload = {}) {
  const startedAt = Date.now();
  const selectedModel = await requireDefaultModel('text');
  const modelId = selectedModel.modelId;

  let reference = null;
  let usage = null;
  let model = modelId;
  let attempted = false;
  let createdArticleId = null;

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
    const doc = htmlToArticleDoc(html);
    if (!doc || !articleDocHasContent(doc)) {
      throw new ApiError(502, 'The AI returned no usable article content. Try again.');
    }

    const diagrams = prepareDiagrams(parsed.diagrams);
    attachDiagramIds(doc, diagrams);

    const article = await createArticle({
      title: cleanText(parsed.title, 200) || topic.name,
      subtitle: cleanText(parsed.subtitle, 300),
      topicId: topic.id,
      contentJson: doc,
      status: 'draft',
    });
    createdArticleId = article.id;

    if (diagrams.length) {
      await Diagram.insertMany(
        diagrams.map((diagram, index) => ({
          _id: diagram.objectId,
          article: article.id,
          title: diagram.data.title,
          caption: diagram.data.caption || diagram.data.title,
          direction: diagram.data.direction,
          nodes: diagram.data.nodes,
          edges: diagram.data.edges,
          groups: diagram.data.groups,
          order: index,
        })),
      );
    }

    const savedArticle = await getArticle(article.id);
    createdArticleId = null;

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
      article: savedArticle,
      diagrams: diagrams.map((diagram) => ({
        id: String(diagram.objectId),
        title: diagram.data.title,
      })),
      reference: reference
        ? { url: reference.url, title: reference.title, characters: reference.text.length }
        : null,
      warnings,
      model,
      usage,
    };
  } catch (error) {
    if (createdArticleId) {
      try {
        await deleteArticle(createdArticleId);
      } catch (cleanupError) {
        console.error('Failed to clean up an incomplete AI article:', cleanupError.message);
      }
    }

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
