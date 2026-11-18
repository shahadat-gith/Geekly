
import { scoreTone } from './status.js';

const SCORES = [
  ['overall', 'Overall'],
  ['jobMatch', 'Job match'],
  ['technical', 'Technical skills'],
  ['projects', 'Projects'],
  ['presentation', 'Presentation'],
  ['ats', 'ATS readability'],
];

/** The six headline scores. A missing score shows as a dash, never as zero. */
export function ScoreGrid({ scores, compact = false }) {
  return (
    <div
      className={
        compact
          ? 'flex flex-col gap-2'
          : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'
      }
    >
      {SCORES.map(([key, label]) => {
        const value = scores?.[key] ?? null;

        return (
          <div
            key={key}
            className={
              compact
                ? 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-button border border-border-secondary bg-surface px-3 py-2.5'
                : 'rounded-card border border-border bg-surface px-4 py-4 shadow-card'
            }
          >
            <p
              className={`m-0 font-semibold leading-none tracking-[-0.03em] text-text ${compact ? 'text-[12.5px]' : 'text-[26px]'
                }`}
            >
              {compact && (
                <span className="mr-2 font-medium tracking-normal text-text-secondary">
                  {label}
                </span>
              )}

              {value ?? '—'}

              {value !== null && (
                <span className="ml-0.5 text-[12px] font-normal tracking-normal text-text-tertiary">
                  /100
                </span>
              )}
            </p>

            {!compact && (
              <p className="m-0 mt-2 text-[12.5px] leading-snug text-text-secondary">
                {label}
              </p>
            )}

            <div
              className={`${compact ? 'col-span-2' : 'mt-3'
                } h-1 w-full overflow-hidden rounded-full bg-surface-tertiary`}
            >
              <div
                className={`h-full rounded-full transition-[width] duration-300 ${scoreTone(value)}`}
                style={{ width: `${value ?? 0}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
