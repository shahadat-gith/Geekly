import { generateArticle } from './service.js';
import { getAiUsageDashboard } from './usage.service.js';
import {
  AI_MODEL_TYPES,
  createModel,
  deleteModel,
  listModels,
  updateModel,
} from '../../../domain/ai/models.js';

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
