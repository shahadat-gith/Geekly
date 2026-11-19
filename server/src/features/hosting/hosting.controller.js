import { ApiError } from '../../shared/errors.js';
import { publishJob } from '../../infra/queue/bullmq.js';
import * as projects from './projects.service.js';
import * as deployments from './deployments.service.js';
import { rollbackDeployment } from './publish.service.js';

// Responses expose ids and status only, never storage keys or file contents.
const privateNoStore = (res) => res.set('Cache-Control', 'private, no-store');

async function enqueue(deployment) {
  await publishJob('deployment', {
    kind: 'publish-site',
    deploymentId: String(deployment._id),
  });
}

export async function checkSlug(req, res) {
  privateNoStore(res);
  res.json(await projects.checkSlug(req.params.slug));
}

export async function createProject(req, res) {
  privateNoStore(res);
  const project = await projects.createProject(req.user._id, req.body || {});
  res.status(201).json({ project });
}

export async function listProjects(req, res) {
  privateNoStore(res);
  res.json({ projects: await projects.listProjects(req.user._id) });
}

export async function getProject(req, res) {
  privateNoStore(res);
  const project = await projects.getOwnedProject(req.user._id, req.params.projectId);
  res.json({ project });
}

export async function updateProject(req, res) {
  privateNoStore(res);
  const project = await projects.updateProject(req.user._id, req.params.projectId, req.body || {});
  res.json({ project });
}

export async function deleteProject(req, res) {
  privateNoStore(res);
  await projects.deleteProject(req.user._id, req.params.projectId);
  res.status(204).end();
}

export async function listDeployments(req, res) {
  privateNoStore(res);
  res.json({ deployments: await deployments.listDeployments(req.user._id, req.params.projectId) });
}

export async function createDeployment(req, res) {
  privateNoStore(res);
  const deployment = await deployments.createDeployment(
    req.user._id,
    req.params.projectId,
    req.body?.files,
  );
  res.status(201).json({ deployment });
}

export async function getDeployment(req, res) {
  privateNoStore(res);
  const deployment = await deployments.getOwnedDeployment(req.user._id, req.params.deploymentId);
  res.json({ deployment });
}

export async function uploadFile(req, res) {
  privateNoStore(res);
  if (!req.file) throw new ApiError(400, 'Attach one file in the "file" field.');
  const result = await deployments.uploadDeploymentFile(req.user._id, req.params.deploymentId, {
    relativePath: req.body?.path,
    buffer: req.file.buffer,
    mimetype: req.file.mimetype,
  });
  res.json({ uploaded: result });
}

export async function finalize(req, res) {
  privateNoStore(res);
  const deployment = await deployments.finalizeDeployment(req.user._id, req.params.deploymentId);
  await enqueue(deployment);
  res.status(202).json({ deployment });
}

export async function retry(req, res) {
  privateNoStore(res);
  const deployment = await deployments.retryDeployment(req.user._id, req.params.deploymentId);
  await enqueue(deployment);
  res.status(202).json({ deployment });
}

export async function rollback(req, res) {
  privateNoStore(res);
  const deployment = await rollbackDeployment(req.user._id, req.params.deploymentId);
  res.json({ deployment });
}

