import mongoose from 'mongoose';
import Article from '../../models/Article.js';
import Diagram from '../../models/Diagram.js';
import { ApiError } from '../../shared/apiError.js';
import {
  buildDiagramImagePrompt,
  generateImage,
  validateDiagram,
} from '../../llm/index.js';
import {
  deleteArticleAssets,
  uploadArticleDiagramImage,
} from '../../config/storage.js';
import { setArticleDiagramAsset } from './articleService.js';
import { recordAiUsage } from './aiUsageService.js';
import { requireDefaultModel } from './aiModelService.js';

function assertObjectId(value, message) {
  if (!mongoose.Types.ObjectId.isValid(value)) throw new ApiError(400, message);
}

function serializeDiagram(diagram) {
  return {
    id: String(diagram._id),
    articleId: String(diagram.article),
    title: diagram.title,
    caption: diagram.caption || '',
    nodes: (diagram.nodes || []).map((node) => ({
      id: node.id,
      type: node.type,
      label: node.label,
      description: node.description || '',
    })),
    edges: (diagram.edges || []).map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label || '',
      type: edge.type,
    })),
    order: diagram.order || 0,
    createdAt: diagram.createdAt,
    updatedAt: diagram.updatedAt,
  };
}

function diagramNodes(doc) {
  const nodes = [];
  const visit = (node) => {
    if (!node) return;
    if (node.type === 'articleDiagram') nodes.push(node);
    (node.content || []).forEach(visit);
  };
  visit(doc);
  return nodes;
}

function visualFor(doc, diagramId) {
  const node = diagramNodes(doc).find((item) => item.attrs?.diagramId === String(diagramId));
  if (!node) return null;

  const assetUrl = node.attrs?.assetUrl || '';
  return {
    diagramId: String(diagramId),
    status: assetUrl ? 'ready' : 'pending',
    kind: assetUrl ? 'image' : null,
    assetKey: node.attrs?.assetKey || '',
    assetUrl,
    alt: node.attrs?.alt || '',
    caption: node.attrs?.caption || '',
  };
}

async function loadArticle(articleId) {
  assertObjectId(articleId, 'Invalid article id');
  const article = await Article.findById(articleId).select('content title');
  if (!article) throw new ApiError(404, 'Article not found');
  return article;
}

async function loadOwnedDiagram(articleId, diagramId) {
  assertObjectId(articleId, 'Invalid article id');
  assertObjectId(diagramId, 'Invalid diagram id');

  const article = await loadArticle(articleId);
  const diagram = await Diagram.findOne({ _id: diagramId, article: article._id });
  if (!diagram) throw new ApiError(404, 'Diagram not found for this article');

  return { article, diagram };
}

export async function listArticleDiagrams(articleId) {
  const article = await loadArticle(articleId);
  const diagrams = await Diagram.find({ article: article._id }).sort({ order: 1, createdAt: 1 });

  return {
    diagrams: diagrams.map((diagram) => ({
      ...serializeDiagram(diagram),
      visual: visualFor(article.content, diagram._id),
    })),
  };
}

export async function getArticleDiagram(articleId, diagramId) {
  const { article, diagram } = await loadOwnedDiagram(articleId, diagramId);
  return {
    diagram: serializeDiagram(diagram),
    visual: visualFor(article.content, diagram._id),
  };
}

async function replaceVisual(articleId, diagram, upload, { alt, caption } = {}) {
  const previous = await getArticleDiagram(articleId, diagram._id);
  const previousKey = previous.visual?.assetKey || '';

  let updated;
  try {
    updated = await setArticleDiagramAsset(articleId, diagram._id, {
      assetKey: upload.key,
      assetUrl: upload.url,
      alt,
      caption,
    });
  } catch (error) {
    // The new object is not referenced anywhere yet, so remove it rather than
    // leaving an orphan in the bucket.
    try {
      await deleteArticleAssets([upload.key]);
    } catch (cleanupError) {
      console.error('Failed to clean up unused diagram asset:', cleanupError.message);
    }
    throw error;
  }

  const articlePrefix = `articles/${articleId}/diagrams/`;
  if (
    previousKey &&
    previousKey !== upload.key &&
    previousKey.startsWith(articlePrefix)
  ) {
    try {
      await deleteArticleAssets([previousKey]);
    } catch (error) {
      console.error('Failed to clean up replaced diagram asset:', error.message);
    }
  }

  return {
    diagramId: String(diagram._id),
    visual: visualFor(updated.content, diagram._id),
  };
}

/**
 * Generate the diagram visual with the default image model from the stored
 * structured data, then attach the resulting raster image to the article.
 * The image prompt fixes the public reader's light theme and excludes the
 * caption, which is rendered below the image by the article components.
 */
export async function generateArticleDiagramImage(articleId, diagramId) {
  const startedAt = Date.now();
  const selectedModel = await requireDefaultModel('image');
  const modelId = selectedModel.modelId;

  let model = modelId;
  let usage = null;
  let attempted = false;

  try {
    const { diagram } = await loadOwnedDiagram(articleId, diagramId);
    const data = diagram.toObject();

    attempted = true;
    const generated = await generateImage({
      model: modelId,
      prompt: buildDiagramImagePrompt(validateDiagram(data)),
    });
    usage = generated.usage;
    model = generated.model || model;

    const upload = await uploadArticleDiagramImage({
      articleId: String(articleId),
      diagramId: String(diagramId),
      buffer: generated.buffer,
      contentType: generated.contentType,
      extension: generated.extension,
    });

    const result = await replaceVisual(articleId, diagram, upload, {
      alt: diagram.title,
      caption: diagram.caption || diagram.title,
    });

    await recordAiUsage({
      user: 'admin',
      feature: 'diagram-image-generation',
      model,
      status: 'success',
      promptTokens: usage?.promptTokens,
      completionTokens: usage?.completionTokens,
      cost: usage?.cost,
      durationMs: Date.now() - startedAt,
      imageUrl: upload.url,
    });

    return {
      ...result,
      asset: {
        key: upload.key,
        url: upload.url,
        contentType: generated.contentType,
        kind: 'image',
      },
      model,
      usage,
    };
  } catch (error) {
    if (attempted) {
      await recordAiUsage({
        user: 'admin',
        feature: 'diagram-image-generation',
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
    throw new ApiError(
      error.status || 502,
      error.message || 'The image model failed to generate the diagram.',
    );
  }
}

/** Store a manual raster replacement for the exact same diagram placeholder. */
export async function uploadArticleDiagramImageAsset(articleId, diagramId, image) {
  const { diagram } = await loadOwnedDiagram(articleId, diagramId);

  const upload = await uploadArticleDiagramImage({
    articleId: String(articleId),
    diagramId: String(diagramId),
    buffer: image.buffer,
    contentType: image.contentType,
    extension: image.extension,
  });

  const result = await replaceVisual(articleId, diagram, upload, {
    alt: diagram.title,
    caption: diagram.caption || diagram.title,
  });

  return {
    ...result,
    asset: {
      key: upload.key,
      url: upload.url,
      contentType: image.contentType,
      kind: 'image',
    },
  };
}
