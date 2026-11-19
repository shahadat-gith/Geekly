import {
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { keys } from '../../config/env.js';

// S3-compatible client for the private `geekly-deployments` R2 bucket. This is
// separate from the public assets bucket in infra/storage/r2.js.

let client = null;

function s3() {
  if (!client) {
    const { accountId, r2 } = keys.cloudflare;
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: r2.accessKeyId, secretAccessKey: r2.secretAccessKey },
    });
  }
  return client;
}

const bucket = () => keys.cloudflare.r2.buckets.deployments;

export async function putDeploymentFile({ key, body, contentType, cacheControl }) {
  await s3().send(new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: cacheControl,
  }));
}

export async function objectExists(key) {
  try {
    await s3().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
    return true;
  } catch (error) {
    if (error.$metadata?.httpStatusCode === 404 || error.name === 'NotFound') return false;
    throw error;
  }
}

/** Deletes every object under a prefix, in batches of up to 1000. Returns the count. */
export async function deletePrefix(prefix) {
  let removed = 0;
  let token;
  do {
    const page = await s3().send(new ListObjectsV2Command({
      Bucket: bucket(),
      Prefix: prefix,
      ContinuationToken: token,
    }));
    const objects = (page.Contents || []).map((item) => ({ Key: item.Key }));
    if (objects.length) {
      await s3().send(new DeleteObjectsCommand({
        Bucket: bucket(),
        Delete: { Objects: objects, Quiet: true },
      }));
      removed += objects.length;
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return removed;
}
