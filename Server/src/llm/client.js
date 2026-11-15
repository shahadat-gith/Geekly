import OpenAI from 'openai';
import { keys } from '../config/env.js';
import { ApiError } from '../shared/apiError.js';

// Provider configuration for every LLM call. Text models use OpenRouter's
// OpenAI-compatible chat endpoint; image models use OpenRouter's Image API.
// Model ids come from the admin-managed model table, never from this module.

export const IMAGE_ENDPOINT = 'https://openrouter.ai/api/v1/images';

const apiKey = keys.openrouter.apiKey;
const attribution = {
  'HTTP-Referer': keys.auth.adminUrl,
  'X-Title': 'Noob Engineer Admin',
};

export function requireApiKey() {
  if (!apiKey) {
    throw new ApiError(
      503,
      'AI is not configured. Add OPENROUTER_API_KEY to the server .env file.'
    );
  }
}

export const chatClient = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      maxRetries: 1,
      defaultHeaders: attribution,
    })
  : null;

export function imageHeaders() {
  return {
    ...attribution,
    Authorization: `Bearer ${apiKey || ''}`,
    'Content-Type': 'application/json',
  };
}
