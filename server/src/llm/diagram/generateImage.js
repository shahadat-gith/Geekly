import { keys } from '../../config/env.js';
import { ApiError } from '../../shared/apiError.js';
import { requireApiKey } from '../client.js';

const IMAGE_ENDPOINT = 'https://openrouter.ai/api/v1/images';
const REQUEST_TIMEOUT_MS = 180_000;

const CONTENT_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

function providerMessage(body) {
  try {
    const parsed = JSON.parse(body);
    return String(parsed?.error?.message || parsed?.message || '').trim();
  } catch {
    return String(body || '').trim();
  }
}

function providerError(status, body) {
  const detail = providerMessage(body).replace(/\s+/g, ' ').slice(0, 260);
  return new ApiError(
    502,
    detail
      ? `The image model could not generate the diagram: ${detail}`
      : 'The image model could not generate the diagram. Check the image model in Settings and try again.',
  );
}

function hasParameterError(status, body) {
  if (status !== 400 && status !== 422) return false;
  return /parameter|aspect|resolution|output[_ ]format|unsupported|not support|unknown field/i.test(body);
}

async function requestImage(payload) {
  let response;
  try {
    response = await fetch(IMAGE_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${keys.openrouter.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': keys.auth.adminUrl,
        'X-Title': 'Geekly Admin',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw new ApiError(504, 'The image model took too long to respond. Try again.');
    }
    throw new ApiError(502, 'Could not reach the image model. Check the server connection and try again.');
  }

  return { response, body: await response.text() };
}

/**
 * Ask the default image model for one raster diagram image.
 * The result is returned as bytes so the caller can store it in R2.
 */
export async function generateImage({ model, prompt, aspectRatio = '16:9' } = {}) {
  requireApiKey();

  if (!String(model ?? '').trim()) {
    throw new ApiError(400, 'Choose an image model before generating a diagram.');
  }
  if (!String(prompt ?? '').trim()) {
    throw new ApiError(400, 'The diagram image prompt is empty.');
  }

  const fullPayload = {
    model,
    prompt,
    n: 1,
    output_format: 'png',
    aspect_ratio: aspectRatio,
  };

  let { response, body } = await requestImage(fullPayload);

  // Image providers differ in which optional parameters they accept. If the
  // request failed only because of an optional parameter, retry with the
  // smallest documented payload instead of sending the editor to fix JSON.
  if (!response.ok && hasParameterError(response.status, body)) {
    ({ response, body } = await requestImage({ model, prompt, n: 1 }));
  }

  if (!response.ok) throw providerError(response.status, body);

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    throw new ApiError(502, 'The image model returned an unreadable response.');
  }

  const image = payload?.data?.find((item) => item?.b64_json);
  if (!image?.b64_json) {
    throw new ApiError(502, 'The image model returned no image. Try again.');
  }

  const rawType = String(image.media_type || 'image/png').toLowerCase().split(';')[0].trim();
  const extension = CONTENT_TYPES[rawType];
  if (!extension) {
    throw new ApiError(
      502,
      'The image model returned an unsupported format (SVG is not used). Choose a raster image model in Settings.',
    );
  }

  const usage = payload.usage
    ? {
        promptTokens: payload.usage.prompt_tokens,
        completionTokens: payload.usage.completion_tokens,
        totalTokens: payload.usage.total_tokens,
        cost: payload.usage.cost ?? null,
      }
    : null;

  return {
    buffer: Buffer.from(image.b64_json, 'base64'),
    contentType: rawType,
    extension,
    usage,
    model: payload.model || model,
  };
}

export { CONTENT_TYPES };
