const numberFormatter = new Intl.NumberFormat('en-US');

export function formatNumber(value) {
  const number = Number(value) || 0;
  if (Math.abs(number) >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(number % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (Math.abs(number) >= 10_000) {
    return `${(number / 1000).toFixed(number % 1000 === 0 ? 0 : 1)}k`;
  }
  return numberFormatter.format(number);
}

export function formatFullNumber(value) {
  return numberFormatter.format(Number(value) || 0);
}

export function formatDate(value, options = {}) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function relativeTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const diff = date.getTime() - Date.now();
  const minutes = Math.round(diff / 60000);

  if (Math.abs(minutes) < 1) return 'just now';
  if (Math.abs(minutes) < 60) return minutes > 0 ? `in ${minutes}m` : `${Math.abs(minutes)}m ago`;

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return hours > 0 ? `in ${hours}h` : `${Math.abs(hours)}h ago`;

  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return days > 0 ? `in ${days}d` : `${Math.abs(days)}d ago`;

  return formatDate(value);
}

export function initialsFrom(email = '') {
  const name = String(email).split('@')[0].replace(/[._-]+/g, ' ').trim();
  const parts = name.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]).join('');
  return (initials || 'AD').toUpperCase();
}

export function readingTime(html = '') {
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.ceil(words / 200)) };
}

export function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}
