const TONES = {
  neutral: 'bg-surface-tertiary text-text-secondary',
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
  outline: 'border border-border text-text-secondary',
};

const STATUS = {
  published: { label: 'Published', tone: 'success' },
  draft: { label: 'Draft', tone: 'warning' },
  archived: { label: 'Archived', tone: 'neutral' },
};

export function Badge({ tone = 'neutral', dot = false, className = '', children }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold leading-none',
        TONES[tone] ?? TONES.neutral,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className = '' }) {
  const config = STATUS[status] ?? STATUS.draft;
  return (
    <Badge tone={config.tone} dot className={className}>
      {config.label}
    </Badge>
  );
}
