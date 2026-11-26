import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { keys } from '../../config/env.js';
import { ApiError } from '../../shared/errors.js';

// BullMQ on Redis is the background-job transport: one queue per feature, JSON
// payloads, and retries with backoff instead of a dead-letter queue.
//
// Jobs are declared in QUEUE_NAMES so publishing to a new queue is one line
// here plus a worker that consumes it.

export const QUEUE_NAMES = {
  resume: 'resume-analysis',
};

let connection = null;
const queues = new Map();

/** Shared Redis connection. BullMQ requires maxRetriesPerRequest: null. */
export function redisConnection() {
  if (!keys.redis.url) return null;

  if (!connection) {
    connection = new IORedis(keys.redis.url, { maxRetriesPerRequest: null });
    connection.on('error', (error) => {
      console.error('Redis connection error:', error.message);
    });
  }

  return connection;
}

/** True when REDIS_URL is set, i.e. jobs can actually be queued. */
export function isQueueConfigured() {
  return Boolean(keys.redis.url);
}

function queueFor(name) {
  const queueName = QUEUE_NAMES[name];
  if (!queueName) throw new ApiError(500, `Unknown queue: ${name}`);

  if (!queues.has(name)) {
    queues.set(name, new Queue(queueName, { connection: redisConnection() }));
  }

  return queues.get(name);
}

/** Publish one JSON payload to a named queue. */
export async function publishJob(name, payload) {
  if (!isQueueConfigured()) {
    throw new ApiError(503, 'Background processing is not configured.');
  }

  await queueFor(name).add(payload?.kind ?? 'job', payload, {
    // Infrastructure failures (lost database connection, Redis hiccup) are
    // retried; the pipeline records AI failures on the document itself.
    attempts: 3,
    backoff: { type: 'exponential', delay: 10_000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  });

  return 'queued';
}
