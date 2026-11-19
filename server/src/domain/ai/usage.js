import AiUsage from '../../models/AiUsage.js';

function tokenCount(value) {
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? Math.round(count) : 0;
}

function costAmount(value) {
  if (value === undefined || value === null || value === '') return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

// Usage recording is best-effort: a logging failure must never hide the
// generated article or replace the provider's error. Both the admin console and
// the resume pipelines write here.
export async function recordAiUsage({
  user = 'admin',
  feature = '',
  model = '',
  status = 'success',
  promptTokens = 0,
  completionTokens = 0,
  cost = null,
  durationMs = 0,
  error = '',
  imageUrl = '',
} = {}) {
  const prompt = tokenCount(promptTokens);
  const completion = tokenCount(completionTokens);

  try {
    await AiUsage.create({
      user,
      ...(feature ? { feature } : {}),
      model,
      status,
      promptTokens: prompt,
      completionTokens: completion,
      totalTokens: prompt + completion,
      durationMs: tokenCount(durationMs),
      cost: costAmount(cost),
      error: String(error ?? '').trim().slice(0, 500),
      imageUrl: String(imageUrl ?? '').trim().slice(0, 2048),
    });
  } catch (logError) {
    console.error('Could not record AI usage:', logError.message);
  }
}
