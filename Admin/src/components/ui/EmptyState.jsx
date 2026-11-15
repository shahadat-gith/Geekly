export function EmptyState({ icon = 'bx-folder-open', title, description, action, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-14'
      }`}
    >
      <span
        className={`flex items-center justify-center rounded-full bg-surface-secondary text-text-tertiary ${
          compact ? 'h-10 w-10 text-[21px]' : 'h-14 w-14 text-[28px]'
        }`}
      >
        <i aria-hidden="true" className={`bx ${icon}`} />
      </span>
      <div>
        <p className={`m-0 font-semibold ${compact ? 'text-[13px]' : 'text-[14.5px]'}`}>{title}</p>
        {description && (
          <p className="m-0 mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed text-text-secondary">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
