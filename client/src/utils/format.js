const DATE_OPTIONS = { day: 'numeric', month: 'long', year: 'numeric' };

export function formatDate(value, options = {}) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { ...DATE_OPTIONS, ...options });
}
