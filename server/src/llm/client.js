import OpenAI from 'openai';
import { keys } from '../config/env.js';
import { ApiError } from '../shared/apiError.js';

// Provider configuration for every text LLM call. Model ids come from the
// admin-managed model table, never from this module.

const apiKey = keys.openrouter.apiKey;
const attribution = {
  'HTTP-Referer': keys.auth.adminUrl,
  'X-Title': 'Geekly Admin',
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
