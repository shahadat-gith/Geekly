import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { keys } from '../../config/env.js';
import { ApiError } from '../../shared/apiError.js';

// One SQS client per process, shared by every queue. Queue targets are declared
// in config/env.js as keys.sqs.<name> = { url, arn }, so publishing to a new
// queue is a config change rather than another client.

let client = null;

function sqsClient() {
  if (!client) {
    client = new SQSClient({ region: keys.sqs.region });
  }
  return client;
}

/** True when the named queue has a URL, i.e. jobs can actually be published. */
export function isQueueConfigured(name) {
  return Boolean(keys.sqs[name]?.url);
}

/** Publish one JSON payload to a named queue. */
export async function publishJob(name, payload) {
  const target = keys.sqs[name];

  if (!target?.url) {
    throw new ApiError(503, 'Background processing is not configured.');
  }

  await sqsClient().send(
    new SendMessageCommand({
      QueueUrl: target.url,
      MessageBody: JSON.stringify(payload),
    })
  );

  return 'queued';
}
