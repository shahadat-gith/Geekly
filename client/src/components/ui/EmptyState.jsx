/**
 * Left-aligned empty state on a ruled note, not a floating card.
 */
export function EmptyState({
  Icon,
  title,
  message,
  action,
  className = '',
}) {
  return (
    <div className={`border-t border-border py-10 ${className}`}>
      <div className="max-w-md">
        {Icon && (
          <Icon aria-hidden="true" className="text-[18px] text-text-tertiary" />
        )}

        <h3 className="m-0 mt-4 text-[16px] font-medium tracking-[-0.01em] text-text">
          {title}
        </h3>

        {message && (
          <p className="mb-0 mt-2 text-[13.5px] leading-[1.75] text-text-secondary">
            {message}
          </p>
        )}

        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
