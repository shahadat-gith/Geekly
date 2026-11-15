import { formatNumber } from '../../utils/format.js';

export function StatCard({ label, value, icon, note, delta, className = '' }) {
  const hasDelta = Number.isFinite(delta);

  return (
    <div className={`min-w-0 bg-surface px-4 py-5 sm:px-5 lg:px-6 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 text-[12px] font-medium text-text-secondary">{label}</p>
        <i aria-hidden="true" className={`bx ${icon} text-[16px] text-text-tertiary`} />
      </div>

      <p className="m-0 mt-3 font-heading text-[28px] font-semibold leading-none tracking-[-0.035em] text-text sm:text-[31px]">
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-text-tertiary">
        {hasDelta && (
          <span
            className={`inline-flex items-center gap-0.5 font-semibold ${
              delta >= 0 ? 'text-success' : 'text-error'
            }`}
          >
            <i
              aria-hidden="true"
              className={`bx ${delta >= 0 ? 'bx-trending-up' : 'bx-trending-down'} text-[14px]`}
            />
            {delta > 0 ? '+' : ''}
            {delta}%
          </span>
        )}
        {note && <span className="min-w-0 truncate">{note}</span>}
      </div>
    </div>
  );
}
