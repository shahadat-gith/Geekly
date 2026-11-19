import Deployment from '../../models/Deployment.js';
import Project from '../../models/Project.js';
import { ApiError } from '../../shared/errors.js';
import { getOwnedDeployment } from './deployments.service.js';
import { objectExists } from '../../infra/cloudflare/deploymentStore.js';
import { putSiteMapping } from '../../infra/cloudflare/kv.js';

/**
 * Points the live site at a deployment. Order matters:
 * 1) every object is verified in R2, 2) status is publishing, 3) KV is written,
 * 4) the project pointer and success status are stored.
 * A failed KV write leaves the previous mapping live.
 */
export async function publishDeployment(deployment) {
  const project = await Project.findById(deployment.projectId);
  if (!project || project.deleting) throw new Error('Project is missing or being deleted.');

  for (const item of deployment.manifest) {
    const present = await objectExists(`${deployment.r2Prefix}/${item.path}`);
    if (!present) throw new Error(`Missing uploaded file: ${item.path}`);
  }

  // Ordering guard: never replace a newer live deployment with an older one.
  if (project.currentDeploymentId) {
    const current = await Deployment.findById(project.currentDeploymentId);
    if (current && current.createdAt > deployment.createdAt && !deployment.isRollback) {
      await Deployment.updateOne(
        { _id: deployment._id },
        { $set: { status: 'cancelled', completedAt: new Date(), errorMessage: 'A newer deployment is already live.' } }
      );
      return { skipped: true };
    }
  }

  await Deployment.updateOne({ _id: deployment._id }, { $set: { status: 'publishing' } });

  try {
    await putSiteMapping(project.slug, deployment.r2Prefix);
  } catch (error) {
    await Deployment.updateOne(
      { _id: deployment._id },
      { $set: { status: 'failed', completedAt: new Date(), errorMessage: 'Publishing failed. The previous version is still live.' } }
    );
    throw error;
  }

  // Re-writing KV on retry is harmless because the target prefix is deterministic.
  await Project.updateOne({ _id: project._id }, { $set: { currentDeploymentId: deployment._id } });
  await Deployment.updateOne(
    { _id: deployment._id },
    { $set: { status: 'success', completedAt: new Date(), errorMessage: null } }
  );
  return { skipped: false };
}

/** Rollback re-points KV at an older successful deployment. No re-upload. */
export async function rollbackDeployment(userId, deploymentId) {
  const target = await getOwnedDeployment(userId, deploymentId);
  if (target.status !== 'success') {
    throw new ApiError(409, 'Only a successful deployment can be restored.');
  }

  const project = await Project.findOne({ _id: target.projectId, userId });
  if (!project || project.deleting) throw new ApiError(404, 'Project not found.');
  if (String(project.currentDeploymentId) === String(target._id)) {
    throw new ApiError(409, 'That version is already live.');
  }

  await putSiteMapping(project.slug, target.r2Prefix);
  await Project.updateOne({ _id: project._id }, { $set: { currentDeploymentId: target._id } });
  return target;
}
