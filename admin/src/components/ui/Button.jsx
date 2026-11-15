const VARIANTS = {
  primary:
    'bg-brand text-on-brand shadow-button hover:bg-brand-hover active:bg-brand-active',
  secondary:
    'border border-border bg-surface text-text hover:bg-surface-hover hover:border-border',
  ghost: 'text-text-secondary hover:bg-surface-secondary hover:text-text',
  soft: 'bg-brand-soft text-brand hover:bg-brand-soft/75',
  danger: 'border border-error/25 bg-error/8 text-error hover:bg-error/15',
};

const SIZES = {
  sm: 'min-h-[36px] px-3.5 text-[13px] gap-1.5',
  md: 'min-h-[42px] px-4 text-[14px] gap-2',
  lg: 'min-h-[46px] px-5 text-[14.5px] gap-2',
};

/** Rectangular action button. Render as a link with `as={Link}`. */
export function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  type,
  className = '',
  children,
  ...props
}) {
  const classes = [
    'inline-flex shrink-0 items-center justify-center rounded-button font-semibold whitespace-nowrap transition duration-150 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft disabled:pointer-events-none disabled:opacity-50',
    SIZES[size] ?? SIZES.md,
    VARIANTS[variant] ?? VARIANTS.primary,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      type={type ?? (Tag === 'button' ? 'button' : undefined)}
      className={classes}
      {...props}
    >
      {children}
    </Tag>
  );
}
