export function PageHeader({ title, description, actions, className = '' }) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        <h1 className="m-0 font-heading text-[26px] font-semibold leading-[1.15] tracking-[-0.03em] text-text sm:text-[31px]">
          {title}
        </h1>
        {description && (
          <p className="m-0 mt-1.5 max-w-2xl text-[13px] leading-relaxed text-text-secondary sm:text-[13.5px]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
