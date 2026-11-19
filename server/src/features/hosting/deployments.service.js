import mongoose from 'mongoose';
import Deployment from '../../models/Deployment.js';
import { ApiError } from '../../shared/errors.js';
import { getOwnedProject } from './projects.service.js';
import { contentTypeFor, normalizeUploadPath, validateManifest } from './validate.js';
import { putDeploymentFile } from '../../infra/cloudflare/deploymentStore.js';


function assertDeploymentId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(404, 'Deployment not found.');
}

/** Loads a deployment owned by the user, or throws 404. */
export async function getOwnedDeployment(userId, deploymentId) {
  assertDeploymentId(deploymentId);
  const deployment = await Deployment.findOne({ _id: deploymentId, userId });
  if (!deployment) throw new ApiError(404, 'Deployment not found.');
  return deployment;
}

export async function listDeployments(userId, projectId) {
  const project = await getOwnedProject(userId, projectId);
  return Deployment.find({ projectId: project._id, userId }).sort({ createdAt: -1 }).limit(50);
}

/** Creates a staging deployment and returns it with the validated manifest. */
export async function createDeployment(userId, projectId, entries) {
  const project = await getOwnedProject(userId, projectId);
  if (project.deleting) throw new ApiError(409, 'This site is being deleted.');

  const active = await Deployment.exists({
    projectId: project._id,
    status: mongoose.trusted({ $in: ['staging', 'queued', 'processing', 'publishing'] }),
  });
  if (active) throw new ApiError(409, 'A deployment for this site is already in progress.');

  const { files, totalSize } = validateManifest(entries);
  const deploymentId = new mongoose.Types.ObjectId();

  return Deployment.create({
    _id: deploymentId,
    projectId: project._id,
    userId,
    status: 'staging',
    r2Prefix: `${userId}/${project._id}/${deploymentId}`,
    fileCount: files.length,
    totalSize,
    manifest: files,
  });
}

/** Uploads one file from the manifest to the deployment's immutable prefix. */
export async function uploadDeploymentFile(userId, deploymentId, { relativePath, buffer, mimetype }) {
  const deployment = await getOwnedDeployment(userId, deploymentId);
  if (deployment.status !== 'staging') {
    throw new ApiError(409, 'This deployment is no longer accepting files.');
  }

  const cleanPath = normalizeUploadPath(relativePath);
  const entry = deployment.manifest.find((item) => item.path === cleanPath);
  if (!entry) throw new ApiError(400, `File is not in the manifest: ${cleanPath}`);
  if (buffer.length !== entry.size) throw new ApiError(400, `Size mismatch for ${cleanPath}.`);

  const contentType = contentTypeFor(cleanPath);
  // Fingerprinted assets (hash in the name) can be cached forever; HTML must
  // refresh so a redeploy shows immediately.
  const cacheControl = /\.html?$/i.test(cleanPath)
    ? 'public, max-age=0, must-revalidate'
    : 'public, max-age=31536000, immutable';

  await putDeploymentFile({
    key: `${deployment.r2Prefix}/${cleanPath}`,
    body: buffer,
    contentType,
    cacheControl,
  });

  // Idempotent: a retried upload of the same path must not duplicate the entry.
  await Deployment.updateOne(
    { _id: deployment._id, status: 'staging' },
    { $addToSet: { uploadedPaths: cleanPath } }
  );
  return { path: cleanPath, contentType, mimetype: mimetype || null };
}

/** Freezes the upload and queues the publish job. Returns the deployment. */
export async function finalizeDeployment(userId, deploymentId) {
  const deployment = await getOwnedDeployment(userId, deploymentId);
  if (deployment.status !== 'staging') {
    throw new ApiError(409, 'This deployment has already been finalized.');
  }

  const uploaded = new Set(deployment.uploadedPaths);
  const missing = deployment.manifest.filter((item) => !uploaded.has(item.path));
  if (missing.length) {
    throw new ApiError(400, `${missing.length} file(s) were not uploaded yet.`);
  }

  // Conditional update so two concurrent finalize calls cannot both enqueue.
  const claimed = await Deployment.findOneAndUpdate(
    { _id: deployment._id, status: 'staging' },
    { $set: { status: 'queued' } },
    { new: true }
  );
  if (!claimed) throw new ApiError(409, 'This deployment has already been finalized.');

  return claimed;
}

/**
 * Retry a failed deployment. Its R2 objects are immutable and still verified at
 * publish time, so only the status is reset and the job re-queued.
 */
export async function retryDeployment(userId, deploymentId) {
  const deployment = await getOwnedDeployment(userId, deploymentId);
  if (deployment.status !== 'failed') {
    throw new ApiError(409, 'Only a failed deployment can be retried.');
  }

  const claimed = await Deployment.findOneAndUpdate(
    { _id: deployment._id, status: 'failed' },
    { $set: { status: 'queued', errorMessage: null, completedAt: null } },
    { new: true }
  );
  if (!claimed) throw new ApiError(409, 'This deployment is already being retried.');
  return claimed;
}

