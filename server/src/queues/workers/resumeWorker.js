import { connectToDB } from '../../config/mongodb.js';
import { processJob } from './processJob.js';

// SQS-triggered worker for the resume queue (src/queues/workers/, wired in
// template.yaml). The batch size is 1, so one bad message cannot roll back
// another job. Pipelines record their own failure on the document; only an
// infrastructure error (for example a lost database connection) is thrown so
// SQS retries it and eventually moves it to the dead-letter queue.

export async function handler(event) {
  await connectToDB();

  let failed = 0;

  for (const record of event.Records ?? []) {
    let payload;
    try {
      payload = JSON.parse(record.body);
    } catch {
      console.error('Skipping a resume job with invalid JSON:', record.messageId);
      continue;
    }

    try {
      await processJob(payload);
    } catch (error) {
      failed += 1;
      console.error('Resume worker failed:', record.messageId, error.message);
    }
  }

  if (failed) {
    throw new Error(`${failed} resume job(s) could not be processed`);
  }
}
