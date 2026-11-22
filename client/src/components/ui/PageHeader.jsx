/**
 * Consistent page header: eyebrow, title, description, and an
 * optional trailing action slot.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <header className={className}>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="min-w-0">
          {eyebrow && (
            <p className="eyebrow m-0">{eyebrow}</p>
          )}

          <h1 className="m-0 mt-2 text-balance font-heading text-[28px] font-semibold leading-[1.18] tracking-[-0.03em] text-text sm:text-[32px]">
            {title}
          </h1>

          {description && (
            <p className="m-0 mt-2 max-w-2xl text-[13.5px] leading-[1.75] text-text-secondary sm:text-[14px]">
              {description}
            </p>
          )}
        </div>

        {action && <div className="w-full shrink-0 sm:w-auto">{action}</div>}
      </div>
    </header>
  );
}
