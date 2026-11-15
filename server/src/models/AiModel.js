import mongoose from 'mongoose';

export const AI_MODEL_TYPES = ['text', 'image', 'video', 'audio', 'embedding', 'rerank'];
export const AI_MODEL_TYPE_LABELS = {
  text: 'Text',
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  embedding: 'Embedding',
  rerank: 'Rerank',
};

// Models are managed by the admin, one row per provider model.
// `modelId` is the provider slug sent with the request (e.g. a vendor/model id).
const AiModelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    modelId: { type: String, required: true, trim: true, maxlength: 200 },
    type: { type: String, enum: AI_MODEL_TYPES, required: true, index: true },

    // Text billing is per token; image billing is per generated image.
    pricePerMillionInput: { type: Number, default: null, min: 0 },
    pricePerMillionOutput: { type: Number, default: null, min: 0 },
    pricePerImage: { type: Number, default: null, min: 0 },
    pricePerMegapixel: { type: Number, default: null, min: 0 },
    pricePerSecond: { type: Number, default: null, min: 0 },
    pricePerMillionCharacters: { type: Number, default: null, min: 0 },

    notes: { type: String, default: '', trim: true, maxlength: 300 },
    isDefault: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false, autoIndex: false, autoCreate: false }
);

AiModelSchema.index({ modelId: 1, type: 1 }, { unique: true, name: 'ai_model_unique' });
AiModelSchema.index({ type: 1, isDefault: 1 }, { name: 'ai_model_default' });

AiModelSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    if (ret._id) ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const { model, models } = mongoose;

export default models.AiModel || model('AiModel', AiModelSchema);
