import { SESv2Client } from '@aws-sdk/client-sesv2';
import { keys } from '../../config/env.js';

// One SES client for every transactional email. Credentials come from the AWS
// default provider chain: the Lambda execution role in AWS, environment
// variables or a shared profile locally.
let client = null;

export function sesClient() {
  if (!client) {
    client = new SESv2Client({ region: keys.aws.region });
  }
  return client;
}
