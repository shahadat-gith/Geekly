import { ApiError } from '../shared/apiError.js';
import { chatClient, requireApiKey } from './client.js';

/**
 * Ask one text model for a completion.
 *
 * @param {object} options
 * @param {string} options.model        provider model id from the model table
 * @param {string} options.system       system prompt: who the model is and its rules
 * @param {string} options.prompt       user prompt: the actual request
 * @param {number|null} [options.temperature] omit with null when the model rejects it
 * @param {boolean} [options.json]      ask the provider for a JSON object
 * @returns {Promise<{ content: string, usage: object|null, model: string }>}
 */
export async function generateContent({
  model,
  system,
  prompt,
  temperature = 0.6,
  json = false,
} = {}) {
  requireApiKey();

  if (!String(model ?? '').trim()) {
    throw new ApiError(400, 'Choose a model before generating content.');
  }

  if (!String(system ?? '').trim() || !String(prompt ?? '').trim()) {
    throw new ApiError(400, 'generateContent needs both a system prompt and a user prompt.');
  }

  let completion;
  try {
    completion = await chatClient.chat.completions.create({
      model,
      ...(typeof temperature === 'number' ? { temperature } : {}),
      ...(json ? { response_format: { type: 'json_object' } } : {}),

      usage: { include: true },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    });
  } catch {
    throw new ApiError(502, 'The AI provider failed to generate content.');
  }

  const choice = completion.choices?.[0];
  const content = choice?.message?.content;
  if (!content || !String(content).trim()) {
    throw new ApiError(
      502,
      `The AI returned an empty response${choice?.finish_reason ? ` (finish reason: ${choice.finish_reason})` : ''}. Try again.`
    );
  }

  return {
    content,
    usage: completion.usage
      ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
          cost: completion.usage.cost ?? null,
        }
      : null,
    model: completion.model || model,
  };
}
