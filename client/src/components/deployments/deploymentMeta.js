export const TERMINAL_STATUSES = new Set(['success', 'failed', 'cancelled']);

export const siteHost = (slug) => `${slug}.geekly.in`;
export const siteUrl = (slug) => `https://${siteHost(slug)}`;

// Maps server deployment states onto the Badge tones used across the app.
export const DEPLOYMENT_STATUS = {
  staging: { label: 'Uploading', tone: 'neutral' },
  queued: { label: 'Queued', tone: 'neutral' },
  processing: { label: 'Processing', tone: 'info', dot: true },
  publishing: { label: 'Publishing', tone: 'info', dot: true },
  success: { label: 'Live', tone: 'success' },
  failed: { label: 'Failed', tone: 'error' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export function deploymentStatus(status) {
  return DEPLOYMENT_STATUS[status] ?? DEPLOYMENT_STATUS.queued;
}
