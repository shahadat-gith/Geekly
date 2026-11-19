import mongoose from 'mongoose';

// A hosted static site. `slug` becomes `<slug>.geekly.in`.
// Indexes are declared here but built out-of-band (autoIndex is off); see
// scripts/hosting-indexes.js.
const ProjectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    currentDeploymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deployment', default: null },
    deleting: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false, autoIndex: false, autoCreate: false }
);

ProjectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    if (ret._id) ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const { model, models } = mongoose;

export default models.Project || model('Project', ProjectSchema);
