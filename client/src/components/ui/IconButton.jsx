
const SIZES = {
  sm: 'h-9 w-9 text-[16px]',
  md: 'h-10 w-10 text-[20px]',
};

const SHAPES = {
  square: 'rounded-button',
  round: 'rounded-full',
};

const VARIANTS = {
  default: 'text-text-secondary hover:bg-surface-secondary hover:text-text',
  plain: 'text-text-tertiary hover:bg-surface-secondary hover:text-text',
  bare: 'text-text hover:bg-surface-secondary',
};

/**
 * Icon-only control.
 * `label` provides the accessible name for the icon button.
 */
export function IconButton({
  as: Tag = 'button',
  label,
  variant = 'default',
  size = 'md',
  shape = 'square',
  className = '',
  ...props
}) {
  const classes = [
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap',
    'transition-[background,color,border-color,transform] duration-150 active:scale-[0.97]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-55',
    'motion-reduce:transition-none motion-reduce:active:scale-100',
    SIZES[size] ?? SIZES.md,
    SHAPES[shape] ?? SHAPES.square,
    VARIANTS[variant] ?? VARIANTS.default,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      aria-label={label}
      className={classes}
      {...props}
    />
  );
}
