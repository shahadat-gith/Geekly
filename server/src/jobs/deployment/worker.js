import { pathToFileURL } from 'node:url';
import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import { connectToDB } from '../../config/database.js';
import { QUEUE_NAMES, isQueueConfigured, redisConnection } from '../../infra/queue/bullmq.js';
import Deployment from '../../models/Deployment.js';
import { publishDeployment } from '../../features/hosting/publish.service.js';

// Consumes site-deployment jobs. Processing is idempotent: the claim moves a
// deployment from queued to processing, so a duplicate job exits quietly.

let worker = null;

export async function processDeploymentJob({ deploymentId }) {
  await connectToDB();

  const claimed = await Deployment.findOneAndUpdate(
    { _id: deploymentId, status: 'queued' },
    { $set: { status: 'processing', startedAt: new Date() } },
    { new: true }
  );
  if (!claimed) return { skipped: true };

  try {
    return await publishDeployment(claimed);
  } catch (error) {
    await Deployment.updateOne(
      { _id: claimed._id, status: mongoose.trusted({ $in: ['processing', 'publishing'] }) },
      { $set: { status: 'failed', completedAt: new Date(), errorMessage: error.message.slice(0, 300) } }
    );
    throw error;
  }
}

export async function startDeploymentWorker({ concurrency = 2 } = {}) {
  if (!isQueueConfigured()) {
    console.warn('[queue] REDIS_URL is not set; site deployments cannot be published.');
    return null;
  }
  if (worker) return worker;

  await connectToDB();

  worker = new Worker(QUEUE_NAMES.deployment, async (job) => processDeploymentJob(job.data), {
    connection: redisConnection(),
    concurrency,
  });
  worker.on('failed', (job, error) => {
    console.error(`Deployment job ${job?.id} failed:`, error.message);
  });
  worker.on('error', (error) => {
    console.error('Deployment worker error:', error.message);
  });

  console.log(`[queue] deployment worker listening on "${QUEUE_NAMES.deployment}"`);
  return worker;
}

export async function stopDeploymentWorker() {
  if (!worker) return;
  const current = worker;
  worker = null;
  await current.close();
}

const isEntrypoint =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isEntrypoint) {
  startDeploymentWorker()
    .then(() => {
      const shutdown = async (signal) => {
        console.log(`${signal} received, stopping deployment worker`);
        await stopDeploymentWorker().catch(() => {});
        await mongoose.connection.close().catch(() => {});
        process.exit(0);
      };
      process.on('SIGINT', () => shutdown('SIGINT'));
      process.on('SIGTERM', () => shutdown('SIGTERM'));
    })
    .catch((error) => {
      console.error('Failed to start the deployment worker:', error.message);
      process.exit(1);
    });
}
