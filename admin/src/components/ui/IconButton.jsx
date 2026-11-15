const VARIANTS = {
  default: 'text-text-secondary hover:bg-surface-secondary hover:text-text',
  plain: 'text-text-tertiary hover:bg-surface-secondary hover:text-text',
  brand: 'bg-brand-soft text-brand hover:bg-brand-soft/75',
  danger: 'text-text-tertiary hover:bg-error/10 hover:text-error',
};

const SIZES = {
  sm: 'h-8 w-8 text-[17px]',
  md: 'h-9 w-9 text-[19px]',
  lg: 'h-10 w-10 text-[21px]',
};

export function IconButton({
  as: Tag = 'button',
  label,
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      aria-label={label}
      title={label}
      className={[
        'inline-flex shrink-0 items-center justify-center rounded-button transition active:scale-[0.96] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft disabled:pointer-events-none disabled:opacity-45',
        SIZES[size] ?? SIZES.md,
        VARIANTS[variant] ?? VARIANTS.default,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Tag>
  );
}
