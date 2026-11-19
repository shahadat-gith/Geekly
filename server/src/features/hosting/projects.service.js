import mongoose from 'mongoose';
import Project from '../../models/Project.js';
import Deployment from '../../models/Deployment.js';
import { ApiError } from '../../shared/errors.js';
import { assertValidSlug, normalizeSlug, slugProblem } from '../../shared/hostingSlug.js';
import { deleteSiteMapping } from '../../infra/cloudflare/kv.js';
import { deletePrefix } from '../../infra/cloudflare/deploymentStore.js';

function assertObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(404, 'Project not found.');
}

/** Loads a project owned by the user, or throws 404 (never reveals other owners). */
export async function getOwnedProject(userId, projectId) {
  assertObjectId(projectId);
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) throw new ApiError(404, 'Project not found.');
  return project;
}

export async function listProjects(userId) {
  return Project.find({ userId, deleting: mongoose.trusted({ $ne: true }) }).sort({ createdAt: -1 });
}

export async function checkSlug(slugInput) {
  const slug = normalizeSlug(slugInput);
  const problem = slugProblem(slug);
  if (problem) return { slug, available: false, reason: problem };
  const taken = await Project.exists({ slug });
  return taken
    ? { slug, available: false, reason: 'That address is already taken.' }
    : { slug, available: true, reason: null };
}

export async function createProject(userId, { name, slug }) {
  const cleanName = typeof name === 'string' ? name.trim() : '';
  if (!cleanName) throw new ApiError(400, 'Give the site a name.');
  const cleanSlug = assertValidSlug(slug);

  try {
    return await Project.create({ userId, name: cleanName, slug: cleanSlug });
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, 'That address is already taken.');
    throw error;
  }
}

export async function updateProject(userId, projectId, { name, slug }) {
  const project = await getOwnedProject(userId, projectId);
  if (project.deleting) throw new ApiError(409, 'This site is being deleted.');

  if (name !== undefined) {
    const cleanName = typeof name === 'string' ? name.trim() : '';
    if (!cleanName) throw new ApiError(400, 'Give the site a name.');
    project.name = cleanName;
  }

  if (slug !== undefined) {
    const cleanSlug = assertValidSlug(slug);
    if (cleanSlug !== project.slug) {
      const hasLive = Boolean(project.currentDeploymentId);
      if (hasLive) {
        // Changing the address would orphan the live KV mapping; keep it simple.
        throw new ApiError(409, 'The address cannot change while the site is live. Unpublish it first.');
      }
      project.slug = cleanSlug;
    }
  }

  try {
    await project.save();
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, 'That address is already taken.');
    throw error;
  }
  return project;
}

/**
 * Deletes a project: KV first (stops serving), then R2 objects under the
 * project prefix, then the records. Each step is idempotent so a retry after a
 * partial failure finishes the job. The slug is freed only at the end.
 */
export async function deleteProject(userId, projectId) {
  const project = await getOwnedProject(userId, projectId);
  if (!project.deleting) {
    project.deleting = true;
    await project.save();
  }

  await deleteSiteMapping(project.slug);
  await deletePrefix(`${userId}/${project._id}/`);
  await Deployment.deleteMany({ projectId: project._id });
  await Project.deleteOne({ _id: project._id });
}
