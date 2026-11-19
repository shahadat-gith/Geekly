import { generateContent } from '../../../infra/llm/chat.js';
import { recordAiUsage } from '../../../domain/ai/usage.js';
import { ApiError } from '../../../shared/errors.js';
import { parseJsonObject } from '../../../shared/json.js';

// One JSON stage: call the model, parse, normalise, retry once.
//
// Every call is written to the existing AiUsage table so the admin usage
// dashboard includes resume work. The resume text and job description are never
// logged; only the stage name, model, tokens, cost and error summary.

export async function runStage({
  model,
  feature,
  stage,
  prompt,
  temperature = 0.2,
  normalize,
  system,
}) {
  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const startedAt = Date.now();
    let completion = null;

    try {
      completion = await generateContent({
        model: model.modelId,
        system,
        prompt,
        json: true,
        temperature,
      });
    } catch (error) {
      await recordAiUsage({
        user: 'client',
        feature,
        model: model.modelId,
        status: 'error',
        durationMs: Date.now() - startedAt,
        error: `${stage}: ${error.message}`,
      });

      // A configuration problem (missing key, no model) fails the same way on
      // every attempt; surface it instead of paying for a retry.
      if (error instanceof ApiError && error.status < 500) throw error;
      lastError = error;
      continue;
    }

    const usage = completion.usage ?? {};

    try {
      const data = normalize(parseJsonObject(completion.content));

      await recordAiUsage({
        user: 'client',
        feature,
        model: completion.model || model.modelId,
        status: 'success',
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        cost: usage.cost ?? null,
        durationMs: Date.now() - startedAt,
      });

      return data;
    } catch (error) {
      await recordAiUsage({
        user: 'client',
        feature,
        model: completion.model || model.modelId,
        status: 'error',
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        cost: usage.cost ?? null,
        durationMs: Date.now() - startedAt,
        error: `${stage}: ${error.message}`,
      });
      lastError = error;
    }
  }

  if (lastError instanceof ApiError && lastError.status < 500) throw lastError;

  throw new ApiError(
    502,
    `The AI could not produce a valid ${stage} result. Please try again.`
  );
}
