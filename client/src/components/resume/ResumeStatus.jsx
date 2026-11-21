import { Badge } from '../ui/Badge.jsx';

const STATUS = {
  QUEUED: { label: 'Queued', tone: 'neutral' },
  PROCESSING: { label: 'In progress', tone: 'info', dot: true },
  COMPLETED: { label: 'Ready', tone: 'success' },
  FAILED: { label: 'Failed', tone: 'error' },
};

export function StatusChip({ status, label, className = '' }) {
  const config = STATUS[status] ?? STATUS.QUEUED;

  return (
    <Badge tone={config.tone} dot={config.dot} className={className}>
      {label ?? config.label}
    </Badge>
  );
}
