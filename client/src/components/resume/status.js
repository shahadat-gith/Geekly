// Shared status/score helpers. Kept out of the component file so the component
// module only exports components (React Fast Refresh requirement).

export function statusIsWorking(status) {
  return status === 'QUEUED' || status === 'PROCESSING';
}

/** Background for a score bar; the number is always shown next to it. */
export function scoreTone(score) {
  if (score === null || score === undefined) return 'bg-border';
  if (score >= 75) return 'bg-success';
  if (score >= 55) return 'bg-brand';
  if (score >= 40) return 'bg-warning';
  return 'bg-error';
}
