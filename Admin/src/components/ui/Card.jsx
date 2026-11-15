export function Card({ as: Tag = 'div', className = '', hover = false, ...props }) {
  return (
    <Tag
      className={[
        'rounded-panel bg-surface shadow-card',
        hover ? 'transition duration-300 hover:shadow-card-hover' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}
