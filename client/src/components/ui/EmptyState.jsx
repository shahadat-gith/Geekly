import { Card } from './Card.jsx';

/** Centered icon, title, message and optional action for empty states. */
export function EmptyState({
  Icon,
  title,
  message,
  action,
  className = '',
}) {
  return (
    <Card
      className={`flex flex-col items-center px-5 py-10 text-center sm:px-8 sm:py-12 ${className}`}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft">
          <Icon aria-hidden="true" className="text-[19px] text-brand-strong" />
        </div>
      )}

      <h3 className="m-0 mt-4 text-[15px] font-semibold text-text">
        {title}
      </h3>

      {message && (
        <p className="mb-0 mt-1.5 max-w-sm text-[13px] leading-[1.7] text-text-secondary">
          {message}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}
