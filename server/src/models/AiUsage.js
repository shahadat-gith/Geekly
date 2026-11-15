import mongoose from 'mongoose';

const AiUsageSchema = new mongoose.Schema(
  {
    user: { type: String, enum: ['client', 'admin'], default: 'admin' },
    feature: { type: String, trim: true, default: 'article-generation' },
    model: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['success', 'error'], default: 'success' },
    promptTokens: { type: Number, default: 0, min: 0 },
    completionTokens: { type: Number, default: 0, min: 0 },
    totalTokens: { type: Number, default: 0, min: 0 },
    durationMs: { type: Number, default: 0, min: 0 },
    cost: { type: Number, default: null, min: 0 },
    error: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true, versionKey: false, autoIndex: false, autoCreate: false }
);

AiUsageSchema.index({ createdAt: -1 }, { name: 'usage_recent' });
AiUsageSchema.index({ status: 1, createdAt: -1 }, { name: 'usage_status' });

AiUsageSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    if (ret._id) ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const { model, models } = mongoose;

export default models.AiUsage || model('AiUsage', AiUsageSchema);
