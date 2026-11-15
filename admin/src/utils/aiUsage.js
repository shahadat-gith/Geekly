const FEATURE_LABELS = {
  'article-generation': 'Article generation',
  'image-generation': 'Image generation',
};

export function featureLabel(feature) {
  if (!feature) return 'Other';
  if (FEATURE_LABELS[feature]) return FEATURE_LABELS[feature];

  const words = String(feature).replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function formatCost(value) {
  if (value === null || value === undefined || value === '') return '—';
  const cost = Number(value);
  if (!Number.isFinite(cost) || cost < 0) return '—';
  if (cost === 0) return '$0.00';
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}

export function formatPerMillion(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'price n/a';
  if (amount === 0) return 'free';
  if (amount < 0.01) return `$${amount.toFixed(4)}/M`;
  if (amount < 1) return `$${amount.toFixed(3)}/M`;
  return `$${amount.toFixed(2)}/M`;
}

export function formatImagePrice(value, from = false) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'price n/a';
  if (amount === 0) return 'free';
  return `${from ? 'from ' : ''}$${amount.toFixed(4)}/image`;
}

export function formatDuration(value) {
  const ms = Number(value) || 0;
  if (ms <= 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}
