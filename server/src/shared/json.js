import { ApiError } from './errors.js';

const BAD_JSON = 'The AI returned a response that could not be read. Please try again.';

// Models wrap JSON in fences or a sentence of preamble often enough that every
// AI feature shares one tolerant reader.

function jsonSource(content) {
  let text = String(content ?? '').trim().replace(/^```(?:json)?\s*|\s*```$/gi, '');

  if (!text.startsWith('{')) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end <= start) return '';
    text = text.slice(start, end + 1);
  }

  return text;
}

/** Parse a completion that must contain exactly one JSON object. */
export function parseJsonObject(content, message = BAD_JSON) {
  const text = jsonSource(content);
  if (!text) throw new ApiError(502, message);

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ApiError(502, message);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new ApiError(502, message);
  }

  return parsed;
}
