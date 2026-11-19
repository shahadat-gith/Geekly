import mongoose from 'mongoose';
import AiModel, { AI_MODEL_TYPES, AI_MODEL_TYPE_LABELS } from '../../models/AiModel.js';
import { ApiError } from '../../shared/errors.js';

const TYPE_ORDER = new Map(AI_MODEL_TYPES.map((type, index) => [type, index]));

export { AI_MODEL_TYPES, AI_MODEL_TYPE_LABELS };

function cleanName(value) {
  const name = String(value ?? '').trim();
  if (!name) throw new ApiError(400, 'Give the model a name.');
  return name.slice(0, 120);
}

function cleanModelId(value) {
  const modelId = String(value ?? '').trim();
  if (!modelId) throw new ApiError(400, 'Add the provider model id, for example vendor/model-name.');
  if (/\s/.test(modelId)) throw new ApiError(400, 'The model id cannot contain spaces.');
  return modelId.slice(0, 200);
}

function cleanType(value) {
  if (!AI_MODEL_TYPES.includes(value)) {
    throw new ApiError(400, `Choose a model type: ${AI_MODEL_TYPES.join(', ')}.`);
  }
  return value;
}

function cleanPrice(value, label) {
  if (value === undefined || value === null || value === '') return null;
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) {
    throw new ApiError(400, `${label} must be a number of 0 or more.`);
  }
  return price;
}

function serialize(doc) {
  return {
    id: String(doc._id),
    name: doc.name,
    modelId: doc.modelId,
    type: doc.type,
    pricePerMillionInput: doc.pricePerMillionInput ?? null,
    pricePerMillionOutput: doc.pricePerMillionOutput ?? null,
    pricePerImage: doc.pricePerImage ?? null,
    pricePerMegapixel: doc.pricePerMegapixel ?? null,
    pricePerSecond: doc.pricePerSecond ?? null,
    pricePerMillionCharacters: doc.pricePerMillionCharacters ?? null,
    notes: doc.notes || '',
    isDefault: Boolean(doc.isDefault),
    enabled: doc.enabled !== false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function priceSortValue(model) {
  if (model.type === 'image') return model.pricePerImage ?? model.pricePerMegapixel ?? Infinity;
  if (model.type === 'video') return model.pricePerSecond ?? Infinity;
  if (model.type === 'audio') return model.pricePerMillionCharacters ?? model.pricePerMillionInput ?? Infinity;
  if (model.type === 'text') return model.pricePerMillionInput ?? Infinity;
  return model.pricePerMillionInput ?? model.pricePerImage ?? Infinity;
}

/** All models, default first inside each type, then cheapest first. */
export async function listModels({ type } = {}) {
  const filter = {};
  if (type) filter.type = cleanType(type);

  const models = await AiModel.find(filter).lean();

  return models
    .map(serialize)
    .sort(
      (a, b) =>
        (TYPE_ORDER.get(a.type) ?? 99) - (TYPE_ORDER.get(b.type) ?? 99) ||
        Number(b.isDefault) - Number(a.isDefault) ||
        priceSortValue(a) - priceSortValue(b) ||
        a.name.localeCompare(b.name)
    );
}

async function clearDefault(type) {
  await AiModel.updateMany({ type, isDefault: true }, { $set: { isDefault: false } });
}

export async function createModel(payload = {}) {
  const type = cleanType(payload.type);
  const modelId = cleanModelId(payload.modelId);

  const existing = await AiModel.findOne({ modelId, type }).lean();
  if (existing) throw new ApiError(409, 'That model is already in the list for this type.');

  const wantsDefault = payload.isDefault === true;
  const typeCount = await AiModel.countDocuments({ type });

  const doc = await AiModel.create({
    name: cleanName(payload.name),
    modelId,
    type,
    pricePerMillionInput: cleanPrice(payload.pricePerMillionInput, 'Input price'),
    pricePerMillionOutput: cleanPrice(payload.pricePerMillionOutput, 'Output price'),
    pricePerImage: cleanPrice(payload.pricePerImage, 'Image price'),
    pricePerMegapixel: cleanPrice(payload.pricePerMegapixel, 'Price per megapixel'),
    pricePerSecond: cleanPrice(payload.pricePerSecond, 'Video price per second'),
    pricePerMillionCharacters: cleanPrice(payload.pricePerMillionCharacters, 'Price per million characters'),
    notes: String(payload.notes ?? '').trim().slice(0, 300),
    enabled: payload.enabled !== false,
    isDefault: false,
  });

  if (wantsDefault || typeCount === 0) {
    await clearDefault(type);
    doc.isDefault = true;
    await doc.save();
  }

  return serialize(doc);
}

export async function updateModel(id, payload = {}) {
  const doc = await AiModel.findById(id);
  if (!doc) throw new ApiError(404, 'Model not found');

  if (payload.name !== undefined) doc.name = cleanName(payload.name);
  if (payload.modelId !== undefined) doc.modelId = cleanModelId(payload.modelId);
  if (payload.type !== undefined) doc.type = cleanType(payload.type);
  if (payload.pricePerMillionInput !== undefined) {
    doc.pricePerMillionInput = cleanPrice(payload.pricePerMillionInput, 'Input price');
  }
  if (payload.pricePerMillionOutput !== undefined) {
    doc.pricePerMillionOutput = cleanPrice(payload.pricePerMillionOutput, 'Output price');
  }
  if (payload.pricePerImage !== undefined) {
    doc.pricePerImage = cleanPrice(payload.pricePerImage, 'Image price');
  }
  if (payload.pricePerMegapixel !== undefined) {
    doc.pricePerMegapixel = cleanPrice(payload.pricePerMegapixel, 'Price per megapixel');
  }
  if (payload.pricePerSecond !== undefined) {
    doc.pricePerSecond = cleanPrice(payload.pricePerSecond, 'Video price per second');
  }
  if (payload.pricePerMillionCharacters !== undefined) {
    doc.pricePerMillionCharacters = cleanPrice(payload.pricePerMillionCharacters, 'Price per million characters');
  }
  if (payload.notes !== undefined) doc.notes = String(payload.notes).trim().slice(0, 300);
  if (payload.enabled !== undefined) doc.enabled = Boolean(payload.enabled);

  const duplicate = await AiModel.findOne({
    modelId: doc.modelId,
    type: doc.type,
    _id: mongoose.trusted({ $ne: doc._id }),
  }).lean();
  if (duplicate) throw new ApiError(409, 'That model is already in the list for this type.');

  await doc.save();

  if (payload.isDefault === true) {
    await clearDefault(doc.type);
    doc.isDefault = true;
    await doc.save();
  } else if (payload.isDefault === false) {
    doc.isDefault = false;
    await doc.save();
  }

  return serialize(doc);
}

export async function deleteModel(id) {
  const doc = await AiModel.findById(id);
  if (!doc) throw new ApiError(404, 'Model not found');

  const { type, isDefault } = doc;
  await AiModel.deleteOne({ _id: doc._id });

  // Keep every type usable: promote another enabled model when the default goes.
  if (isDefault) {
    const next = await AiModel.findOne({ type, enabled: true }).sort({ createdAt: 1 });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }

  return { id: String(doc._id) };
}

/** Default model for a type, falling back to the oldest enabled model. */
export async function getDefaultModel(type) {
  return (
    (await AiModel.findOne({ type, isDefault: true, enabled: true }).lean()) ||
    (await AiModel.findOne({ type, enabled: true }).sort({ createdAt: 1 }).lean())
  );
}

export async function requireDefaultModel(type) {
  const model = await getDefaultModel(type);
  if (!model) {
    throw new ApiError(400, `No ${type} model is set up. Add one in Settings and mark it as default.`);
  }
  return serialize(model);
}
