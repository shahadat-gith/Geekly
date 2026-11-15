import mongoose from 'mongoose';

// Every generated image is kept here: prompt, model, storage location, cost
// and timing. The admin gallery and article editors read from this history.
const ImageGenerationSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true, trim: true, maxlength: 1200 },
    model: { type: String, required: true, trim: true, default: '' },
    aspectRatio: { type: String, default: '16:9', trim: true },

    url: { type: String, default: '', trim: true },
    key: { type: String, default: '', trim: true },
    contentType: { type: String, default: '', trim: true },
    bytes: { type: Number, default: 0, min: 0 },

    cost: { type: Number, default: null, min: 0 },
    durationMs: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['success', 'error'], default: 'success' },
    error: { type: String, default: '', maxlength: 500 },

    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', default: null },
    mediaId: { type: String, default: '', trim: true },
  },
  { timestamps: true, versionKey: false, autoIndex: false, autoCreate: false }
);

ImageGenerationSchema.index({ createdAt: -1 }, { name: 'image_generation_recent' });

ImageGenerationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    if (ret._id) ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const { model, models } = mongoose;

export default models.ImageGeneration || model('ImageGeneration', ImageGenerationSchema);
