
const STATUS = {
  QUEUED: {
    label: 'Queued',
    tone: 'bg-surface-tertiary text-text-secondary',
  },
  PROCESSING: {
    label: 'In progress',
    tone: 'bg-brand-soft text-[#527C42]',
  },
  COMPLETED: {
    label: 'Ready',
    tone: 'bg-success/10 text-[#527C42]',
  },
  FAILED: {
    label: 'Failed',
    tone: 'bg-error/10 text-[#B94F47]',
  },
};

export function StatusChip({ status, label, className = '' }) {
  const config = STATUS[status] ?? STATUS.QUEUED;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold leading-none ${config.tone} ${className}`}
    >
      {label ?? config.label}
    </span>
  );
}
