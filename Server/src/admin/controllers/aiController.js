import { generateArticle, generateArticleImage } from '../services/aiService.js';
import { getAiUsageDashboard } from '../services/aiUsageService.js';
import { listImageGenerations } from '../services/imageHistoryService.js';
import {
  AI_MODEL_TYPES,
  createModel,
  deleteModel,
  listModels,
  updateModel,
} from '../services/aiModelService.js';

export async function models(req, res) {
  res.json({
    models: await listModels({ type: req.query.type }),
    types: AI_MODEL_TYPES,
  });
}

export async function createModelHandler(req, res) {
  res.status(201).json({ model: await createModel(req.body) });
}

export async function updateModelHandler(req, res) {
  res.json({ model: await updateModel(req.params.id, req.body) });
}

export async function deleteModelHandler(req, res) {
  res.json(await deleteModel(req.params.id));
}

export async function generate(req, res) {
  res.json(await generateArticle(req.body));
}

export async function generateImage(req, res) {
  res.status(201).json(await generateArticleImage(req.body));
}

export async function images(req, res) {
  res.json(
    await listImageGenerations({
      page: req.query.page,
      limit: req.query.limit,
      model: req.query.model,
      status: req.query.status,
    })
  );
}

export async function usage(req, res) {
  res.json(
    await getAiUsageDashboard({
      page: req.query.page,
      limit: req.query.limit,
      feature: req.query.feature,
      status: req.query.status,
    })
  );
}
