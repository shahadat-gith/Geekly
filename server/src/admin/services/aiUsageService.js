import AiUsage from '../../models/AiUsage.js';

const PAGE_SIZE = 15;
const DAYS_BACK = 14;
const DEFAULT_FEATURE = 'article-generation';

function tokenCount(value) {
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? Math.round(count) : 0;
}

function costAmount(value) {
  if (value === undefined || value === null || value === '') return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function errorCount() {
  return { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } };
}

// Usage recording is best-effort: a logging failure must never hide the
// generated article or replace the provider's error.
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

function buildDays(now = new Date()) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const days = [];

  for (let offset = DAYS_BACK - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);
    days.push({
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      requests: 0,
      errors: 0,
      totalTokens: 0,
      cost: null,
    });
  }

  return days;
}

function serializeRecord(entry) {
  return {
    id: String(entry._id),
    user: entry.user || 'admin',
    feature: entry.feature || DEFAULT_FEATURE,
    model: entry.model || '—',
    status: entry.status || 'success',
    totalTokens: entry.totalTokens || 0,
    cost: entry.cost ?? null,
    durationMs: entry.durationMs || 0,
    createdAt: entry.createdAt,
    error: entry.error || '',
    imageUrl: entry.imageUrl || '',
  };
}

export async function getAiUsageDashboard({ page = 1, limit = PAGE_SIZE, feature, status } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || PAGE_SIZE, 1), 50);
  const safePage = Math.max(Number(page) || 1, 1);
  const safeFeature = String(feature ?? '').trim();
  const safeStatus = status === 'success' || status === 'error' ? status : '';

  const filter = {};
  if (safeFeature) filter.feature = safeFeature;
  if (safeStatus) filter.status = safeStatus;

  const days = buildDays();
  const windowStart = new Date(`${days[0].key}T00:00:00.000Z`);

  const [totalsRow, featureRows, modelRows, dayRows, records, total] = await Promise.all([
    AiUsage.aggregate([
      {
        $group: {
          _id: null,
          requests: { $sum: 1 },
          errors: errorCount(),
          promptTokens: { $sum: '$promptTokens' },
          completionTokens: { $sum: '$completionTokens' },
          totalTokens: { $sum: '$totalTokens' },
          cost: { $sum: '$cost' },
          costCount: { $sum: { $cond: [{ $ne: ['$cost', null] }, 1, 0] } },
          avgDurationMs: { $avg: '$durationMs' },
        },
      },
    ]),
    AiUsage.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$feature', DEFAULT_FEATURE] },
          requests: { $sum: 1 },
          errors: errorCount(),
          totalTokens: { $sum: '$totalTokens' },
          cost: { $sum: '$cost' },
          costCount: { $sum: { $cond: [{ $ne: ['$cost', null] }, 1, 0] } },
          avgDurationMs: { $avg: '$durationMs' },
        },
      },
      { $sort: { requests: -1, _id: 1 } },
    ]),
    AiUsage.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$model', 'unknown'] },
          requests: { $sum: 1 },
          errors: errorCount(),
          totalTokens: { $sum: '$totalTokens' },
          cost: { $sum: '$cost' },
          costCount: { $sum: { $cond: [{ $ne: ['$cost', null] }, 1, 0] } },
        },
      },
      { $sort: { requests: -1, _id: 1 } },
      { $limit: 8 },
    ]),
    AiUsage.aggregate([
      { $match: { createdAt: { $gte: windowStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
          requests: { $sum: 1 },
          errors: errorCount(),
          totalTokens: { $sum: '$totalTokens' },
          cost: { $sum: '$cost' },
          costCount: { $sum: { $cond: [{ $ne: ['$cost', null] }, 1, 0] } },
        },
      },
    ]),
    AiUsage.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .select('user feature model status totalTokens cost durationMs createdAt error imageUrl')
      .lean(),
    AiUsage.countDocuments(filter),
  ]);

  const byKey = new Map(days.map((day) => [day.key, day]));
  for (const row of dayRows) {
    const day = byKey.get(row._id);
    if (!day) continue;
    day.requests = row.requests;
    day.errors = row.errors;
    day.totalTokens = row.totalTokens;
    day.cost = row.costCount > 0 ? row.cost : null;
  }

  const totals = totalsRow[0] || {
    requests: 0,
    errors: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    cost: null,
    costCount: 0,
    avgDurationMs: 0,
  };

  const pages = Math.max(Math.ceil(total / safeLimit), 1);

  return {
    totals: {
      requests: totals.requests,
      errors: totals.errors,
      successRate: totals.requests
        ? Math.round(((totals.requests - totals.errors) / totals.requests) * 100)
        : 100,
      promptTokens: totals.promptTokens,
      completionTokens: totals.completionTokens,
      totalTokens: totals.totalTokens,
      cost: totals.costCount > 0 ? totals.cost : null,
      avgDurationMs: Math.round(totals.avgDurationMs || 0),
    },
    daily: days,
    byFeature: featureRows.map((row) => ({
      feature: row._id,
      requests: row.requests,
      errors: row.errors,
      totalTokens: row.totalTokens,
      cost: row.costCount > 0 ? row.cost : null,
      avgDurationMs: Math.round(row.avgDurationMs || 0),
    })),
    byModel: modelRows.map((row) => ({
      model: row._id,
      requests: row.requests,
      errors: row.errors,
      totalTokens: row.totalTokens,
      cost: row.costCount > 0 ? row.cost : null,
    })),
    features: featureRows.map((row) => row._id).filter(Boolean).sort(),
    records: records.map(serializeRecord),
    pagination: {
      page: Math.min(safePage, pages),
      limit: safeLimit,
      total,
      pages,
    },
  };
}
