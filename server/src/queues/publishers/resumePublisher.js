import { ApiError } from '../../shared/apiError.js';
import { isQueueConfigured, publishJob } from './sqsPublisher.js';
import { processJob } from '../workers/processJob.js';

// Resume Intelligence jobs (analysis, preparation plan) go to their own queue.
//
// Local development has no queue: the job runs after the response is flushed.
// A deployed API without SQS_RESUME_ANALYSIS_QUEUE_URL fails loudly instead of
// silently doing the work in-request.

const QUEUE = 'resume';
const onLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

export async function enqueueResumeJob({ kind, id }) {
  if (isQueueConfigured(QUEUE)) {
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
      'Background processing is not configured. Set SQS_RESUME_ANALYSIS_QUEUE_URL on the API function.'
    );
  }

  setImmediate(() => {
    processJob({ kind, id }).catch((error) => {
      console.error('Inline resume job failed:', error.message);
    });
  });

  return 'inline';
}
