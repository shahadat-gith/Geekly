import { randomUUID } from 'node:crypto';
import { DeleteObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { keys } from './env.js';
import { ApiError } from '../shared/apiError.js';

const client = keys.r2.accountId && keys.r2.accessKeyId && keys.r2.secretAccessKey
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${keys.r2.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: keys.r2.accessKeyId,
        secretAccessKey: keys.r2.secretAccessKey,
      },
    })
  : null;

const storageConfigured = Boolean(client && keys.r2.bucketName && keys.r2.publicUrl);

function assertConfigured() {
  if (!storageConfigured) {
    throw new ApiError(
      503,
      'Image uploads are not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME and R2_PUBLIC_URL in the server .env file.'
    );
  }
}

async function uploadImage({ buffer, contentType, extension, directory }) {
  assertConfigured();
  const key = `${directory}/${randomUUID()}.${extension}`;
  await client.send(
    new PutObjectCommand({
      Bucket: keys.r2.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return { key, url: `${keys.r2.publicUrl}/${key}` };
}

export function uploadArticleImage(options) {
  return uploadImage({ ...options, directory: 'article-media' });
}

// AI generated images are kept apart from admin uploads used by articles.
export function uploadAiGeneratedImage(options) {
  return uploadImage({ ...options, directory: 'ai-generated-images' });
}

export function uploadTopicBanner(options) {
  return uploadImage({ ...options, directory: 'topic-banners' });
}

async function deleteImages(keysToDelete = []) {
  const keysList = [...new Set(keysToDelete.map((key) => String(key || '').trim()).filter(Boolean))];
  if (keysList.length === 0) return;
  assertConfigured();

  await client.send(
    new DeleteObjectsCommand({
      Bucket: keys.r2.bucketName,
      Delete: { Objects: keysList.map((Key) => ({ Key })), Quiet: true },
    })
  );
}

export function deleteArticleImages(keysToDelete = []) {
  return deleteImages(keysToDelete.filter((key) => key.startsWith('article-media/')));
}

export function deleteTopicBanner(key) {
  if (!key || !key.startsWith('topic-banners/')) return Promise.resolve();
  return deleteImages([key]);
}
