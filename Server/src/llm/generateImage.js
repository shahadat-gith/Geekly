import { ApiError } from '../shared/apiError.js';
import { IMAGE_ENDPOINT, imageHeaders, requireApiKey } from './client.js';

const TIMEOUT_MS = 120_000;

/**
 * Generate one image from a prompt with the given image model.
 *
 * @param {object} options
 * @param {string} options.model         provider model id from the model table
 * @param {string} options.prompt        what the image should show
 * @param {string} [options.aspectRatio] e.g. "16:9", defaults to 16:9
 * @param {number} [options.n]           images requested, defaults to 1
 * @returns {Promise<{ buffer: Buffer, contentType: string, usage: object|null, model: string }>}
 */
export async function generateImage({
  model,
  prompt,
  aspectRatio = '16:9',
  n = 1,
} = {}) {
  requireApiKey();

  if (!String(model ?? '').trim()) {
    throw new ApiError(400, 'Choose an image model before generating an image.');
  }

  const text = String(prompt ?? '').trim();
  if (!text) throw new ApiError(400, 'A prompt is required to generate an image.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(IMAGE_ENDPOINT, {
      method: 'POST',
      headers: imageHeaders(),
      body: JSON.stringify({ model, prompt: text, aspect_ratio: aspectRatio, n }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const blocked = response.status === 402 || response.status === 403;
      throw new ApiError(
        blocked ? 402 : 502,
        payload?.error?.message || `The image provider returned ${response.status}.`
      );
    }

    const first = payload?.data?.[0];
    if (!first?.b64_json) {
      throw new ApiError(502, 'The image provider returned no image. Try again.');
    }

    return {
      buffer: Buffer.from(first.b64_json, 'base64'),
      contentType: first.media_type || 'image/png',
      usage: payload.usage || null,
      model: payload.model || model,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'AbortError') {
      throw new ApiError(504, 'Image generation timed out. Try again.');
    }
    throw new ApiError(502, 'The image provider failed to generate an image.');
  } finally {
    clearTimeout(timeout);
  }
}
