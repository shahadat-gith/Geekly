import mongoose from 'mongoose';

export const DEPLOYMENT_STATUSES = [
  'staging', 'queued', 'processing', 'publishing', 'success', 'failed', 'cancelled',
];

// One immutable upload of a project. Files live under `r2Prefix`, which is never
// overwritten; rollback re-points KV at an older prefix.
const DeploymentSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: DEPLOYMENT_STATUSES, default: 'staging', index: true },
    r2Prefix: { type: String, required: true },
    fileCount: { type: Number, default: 0, min: 0 },
    totalSize: { type: Number, default: 0, min: 0 },
    // Manifest sent at creation: [{ path, size }]. Used to verify uploads and finalize.
    manifest: { type: [{ _id: false, path: String, size: Number }], default: [] },
    uploadedPaths: { type: [String], default: [] },
    isRollback: { type: Boolean, default: false },
    errorMessage: { type: String, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false, autoIndex: false, autoCreate: false }
);

DeploymentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    if (ret._id) ret.id = ret._id.toString();
    delete ret._id;
    delete ret.manifest;
    delete ret.uploadedPaths;
    return ret;
  },
});

const { model, models } = mongoose;

export default models.Deployment || model('Deployment', DeploymentSchema);
