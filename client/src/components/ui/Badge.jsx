const TONES = {
  neutral: 'text-text-secondary',
  brand: 'text-brand-strong',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
};

/**
 * Quiet status text. A dot carries the live-state meaning; there is no pill,
 * tinted background or shouty uppercase.
 */
export function Badge({
  tone = 'neutral',
  dot = false,
  className = '',
  children,
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 text-[11.5px] font-medium leading-none ${TONES[tone] ?? TONES.neutral} ${className}`}
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
