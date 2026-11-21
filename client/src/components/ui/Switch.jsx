
/**
 * Accessible on/off switch.
 * `label` provides the control's accessible name.
 * Pair it with the visible label text that sits beside the switch.
 */
export function Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = '',
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-55',
        'motion-reduce:transition-none',
        checked ? 'bg-brand-active' : 'bg-surface-tertiary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'pointer-events-none absolute left-1 h-4 w-4 rounded-full',
          'bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
          'motion-reduce:transition-none',
        ].join(' ')}
      />
    </button>
  );
}
