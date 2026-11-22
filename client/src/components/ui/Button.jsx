const VARIANTS = {
  primary:
    'bg-brand text-on-brand shadow-button hover:bg-brand-hover active:bg-brand-active',
  secondary:
    'border border-border bg-surface text-text hover:bg-surface-hover hover:border-text-tertiary',
  outline:
    'border border-border bg-transparent text-text hover:bg-surface-secondary',
  ghost:
    'text-text-secondary hover:bg-surface-secondary hover:text-text',
  inverse:
    'border border-ink-soft bg-transparent text-ink-text hover:bg-ink-secondary',
  light:
    'bg-ink-text text-ink hover:bg-surface active:bg-surface-secondary',
  destructive:
    'bg-error text-white shadow-button hover:brightness-95 active:brightness-90',
  'destructive-outline':
    'border border-error/40 bg-surface text-error hover:bg-error/5 active:bg-error/10',
};

const SIZES = {
  xs: 'min-h-[36px] px-3 text-[13px] gap-1.5',
  sm: 'min-h-[40px] px-3.5 text-[13.5px] gap-1.5',
  md: 'min-h-[44px] px-5 text-[14.5px]',
  lg: 'min-h-[48px] px-6 text-[15px]',
};

function Spinner({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

/**
 * Shared button with consistent variants and sizes.
 * `loading` shows a spinner, sets aria-busy and disables the control.
 * Render as another element with `as`, e.g. `<Button as={Link} to="/register">`.
 */
export function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  type,
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}) {
  const isDisabled = Boolean(disabled || loading);
  const classes = [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap select-none rounded-button border border-transparent font-medium transition-[background,color,border-color,box-shadow,transform] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none motion-reduce:active:scale-100',
    SIZES[size] ?? SIZES.md,
    VARIANTS[variant] ?? VARIANTS.primary,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      type={type ?? (Tag === 'button' ? 'button' : undefined)}
      aria-busy={loading || undefined}
      disabled={Tag === 'button' ? isDisabled : undefined}
      aria-disabled={Tag !== 'button' && isDisabled ? true : undefined}
      className={classes}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </Tag>
  );
}
