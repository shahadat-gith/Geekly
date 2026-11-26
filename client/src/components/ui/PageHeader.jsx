/**
 * Page header for the signed-in and utility routes.
 * A small pine tick, a mono folio label and a hairline rule establish the
 * page before the title. The home route does not use this header.
 */
export function PageHeader({
  title,
  description,
  action,
  className = '',
}) {
  return (
    <header className={className}>
      <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <h1 className="m-0 text-balance font-heading text-[30px] font-medium leading-[1.12] tracking-[-0.025em] text-text sm:text-[34px]">
            {title}
          </h1>

          {description && (
            <p className="m-0 mt-3 max-w-[62ch] text-[14px] leading-[1.75] text-text-secondary">
              {description}
            </p>
          )}
        </div>

        {action && <div className="w-full shrink-0 sm:w-auto">{action}</div>}
      </div>
    </header>
  );
}
