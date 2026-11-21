export function Card({
  as: Tag = 'div',
  interactive = false,
  className = '',
  ...props
}) {
  const classes = [
    'rounded-card border border-border bg-surface shadow-card',
    interactive && [
      'card-hover cursor-pointer hover:border-brand-light',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    ].join(' '),
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Tag className={classes} {...props} />;
}
