const TONES = {
  neutral: 'bg-surface-tertiary text-text-secondary',
  brand: 'bg-brand-soft text-brand-strong',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
};

/** Small status pill. Use `dot` for a live-status indicator. */
export function Badge({
  tone = 'neutral',
  dot = false,
  className = '',
  children,
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold leading-none ${TONES[tone] ?? TONES.neutral} ${className}`}
    >
      {dot && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-current"
        />
      )}
      {children}
    </span>
  );
}
