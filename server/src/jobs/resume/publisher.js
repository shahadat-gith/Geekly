import { ApiError } from '../../shared/errors.js';
import { isQueueConfigured, publishJob } from '../../infra/queue/bullmq.js';
import { processJob } from './process.js';

// Resume reviews go through the BullMQ resume queue.
//
// Local development has no Redis: the job runs after the response is flushed.
// On Lambda a missing REDIS_URL fails loudly instead of silently doing the work
// in-request.

const QUEUE = 'resume';
const onLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

export async function enqueueResumeJob({ kind, id }) {
  if (isQueueConfigured()) {
    try {
      await publishJob(QUEUE, { kind, id });
      return 'queued';
    } catch (error) {
      console.error('Could not enqueue the resume job:', error.message);
      throw new ApiError(503, 'Could not start the job right now. Please try again.');
    }
  }

  if (onLambda) {
    throw new ApiError(
      503,
      'Background processing is not configured. Set REDIS_URL on the API function.'
    );
  }

  setImmediate(() => {
    processJob({ kind, id }).catch((error) => {
      console.error('Inline resume job failed:', error.message);
    });
  });

  return 'inline';
}
