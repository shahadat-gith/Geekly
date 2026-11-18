
export function Card({
  as: Tag = 'div',
  interactive = false,
  className = '',
  ...props
}) {
  const classes = [
    'rounded-card border border-border/70 bg-surface shadow-card',
    interactive && [
      'card-hover cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft',
    ].join(' '),
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Tag className={classes} {...props} />;
}
