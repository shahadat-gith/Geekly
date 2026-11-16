import { randomUUID } from 'node:crypto';
import { DeleteObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { keys } from './env.js';
import { ApiError } from '../shared/apiError.js';

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${keys.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: keys.r2.accessKeyId,
    secretAccessKey: keys.r2.secretAccessKey,
  },
})


async function putObject({ key, buffer, contentType, cacheControl }) {
  await client.send(
    new PutObjectCommand({
      Bucket: keys.r2.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: cacheControl || 'public, max-age=31536000, immutable',
    })
  );

  return { key, url: `${keys.r2.publicUrl}/${key}` };
}

async function uploadImage({ buffer, contentType, extension, directory }) {
  return putObject({
    key: `${directory}/${randomUUID()}.${extension}`,
    buffer,
    contentType,
  });
}

export function uploadArticleImage(options) {
  return uploadImage({ ...options, directory: 'article-media' });
}

// Diagram images (AI generated or manually uploaded) are grouped under their
// article and diagram so ownership is unambiguous. Each replacement gets a new
// key; the previous object is removed only after the article points at the new
// one, so a failed generation never breaks the published reader.
export function uploadArticleDiagramImage({
  articleId,
  diagramId,
  buffer,
  contentType,
  extension,
}) {
  return putObject({
    key: `articles/${articleId}/diagrams/${diagramId}-${randomUUID()}.${extension}`,
    buffer,
    contentType,
  });
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

  await client.send(
    new DeleteObjectsCommand({
      Bucket: keys.r2.bucketName,
      Delete: { Objects: keysList.map((Key) => ({ Key })), Quiet: true },
    })
  );
}

export function deleteArticleAssets(keysToDelete = []) {
  return deleteImages(
    keysToDelete.filter(
      (key) => key.startsWith('article-media/') || key.startsWith('articles/'),
    ),
  );
}

export function deleteArticleImages(keysToDelete = []) {
  return deleteArticleAssets(keysToDelete);
}

export function deleteTopicBanner(key) {
  if (!key || !key.startsWith('topic-banners/')) return Promise.resolve();
  return deleteImages([key]);
}
