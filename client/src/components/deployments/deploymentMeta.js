export const TERMINAL_STATUSES = new Set(['success', 'failed', 'cancelled']);

export const siteHost = (slug) => `${slug}.geekly.in`;
export const siteUrl = (slug) => `https://${siteHost(slug)}`;

// Maps server deployment states onto the StatusChip labels used across the app.
export const DEPLOYMENT_STATUS = {
  staging: { label: 'Uploading', tone: 'bg-surface-tertiary text-text-secondary' },
  queued: { label: 'Queued', tone: 'bg-surface-tertiary text-text-secondary' },
  processing: { label: 'Processing', tone: 'bg-brand-soft text-[#527C42]' },
  publishing: { label: 'Publishing', tone: 'bg-brand-soft text-[#527C42]' },
  success: { label: 'Live', tone: 'bg-success/10 text-[#527C42]' },
  failed: { label: 'Failed', tone: 'bg-error/10 text-[#B94F47]' },
  cancelled: { label: 'Cancelled', tone: 'bg-surface-tertiary text-text-secondary' },
};

export function deploymentStatus(status) {
  return DEPLOYMENT_STATUS[status] ?? DEPLOYMENT_STATUS.queued;
}
