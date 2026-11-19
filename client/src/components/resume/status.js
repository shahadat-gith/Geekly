// Shared status helpers. Kept out of the component file so the component
// module only exports components (React Fast Refresh requirement).

export function statusIsWorking(status) {
  return status === 'QUEUED' || status === 'PROCESSING';
}