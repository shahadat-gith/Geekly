import { pathToFileURL } from 'node:url';
import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import { connectToDB } from '../../config/database.js';
import { QUEUE_NAMES, isQueueConfigured, redisConnection } from '../../infra/queue/bullmq.js';
import { processJob } from './process.js';

// BullMQ consumer for the resume queue. src/index.js starts it in-process when
// REDIS_URL is set; `npm run worker` runs it on its own so API instances stay
// free of AI work.
//
// The pipeline records its own failure on the document, so a handled failure
// completes the job. Only an infrastructure error is thrown, and BullMQ retries
// those with backoff before leaving the job in the failed set.

let worker = null;

export async function startResumeWorker({ concurrency = 2 } = {}) {
  if (!isQueueConfigured()) {
    console.warn('[queue] REDIS_URL is not set; resume jobs run in-process.');
    return null;
  }

  if (worker) return worker;

  await connectToDB();

  worker = new Worker(QUEUE_NAMES.resume, async (job) => processJob(job.data), {
    connection: redisConnection(),
    concurrency,
  });

  worker.on('failed', (job, error) => {
    console.error(`Resume job ${job?.id} failed:`, error.message);
  });
  worker.on('error', (error) => {
    console.error('Resume worker error:', error.message);
  });

  console.log(`[queue] resume worker listening on "${QUEUE_NAMES.resume}"`);
  return worker;
}

export async function stopResumeWorker() {
  if (!worker) return;
  const current = worker;
  worker = null;
  await current.close();
}

// Standalone process: `npm run worker`.
const isEntrypoint =
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isEntrypoint) {
  startResumeWorker()
    .then(() => {
      const shutdown = async (signal) => {
        console.log(`${signal} received, stopping worker`);
        await stopResumeWorker().catch(() => {});
        await mongoose.connection.close().catch(() => {});
        process.exit(0);
      };

      process.on('SIGINT', () => shutdown('SIGINT'));
      process.on('SIGTERM', () => shutdown('SIGTERM'));
    })
    .catch((error) => {
      console.error('Failed to start the resume worker:', error.message);
      process.exit(1);
    });
}
