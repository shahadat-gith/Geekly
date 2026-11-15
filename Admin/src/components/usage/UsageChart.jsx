import { Card } from '../ui/Card.jsx';
import { formatNumber } from '../../utils/format.js';

function Legend() {
  return (
    <div className="flex items-center gap-4 text-[11px] text-text-secondary">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-[3px] bg-brand" />
        Success
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-[3px] bg-error" />
        Errors
      </span>
    </div>
  );
}

export function UsageChart({ daily = [] }) {
  const max = Math.max(...daily.map((day) => day.requests), 1);
  const totalRequests = daily.reduce((sum, day) => sum + day.requests, 0);
  const totalErrors = daily.reduce((sum, day) => sum + day.errors, 0);
  const ticks = [max, Math.round(max / 2), 0];

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-[14.5px] font-semibold text-text">Requests per day</h2>
          <p className="m-0 mt-1 text-[11.5px] text-text-tertiary">
            AI calls over the last {daily.length} days
          </p>
        </div>
        <Legend />
      </div>

      <div className="mt-6 flex min-h-[220px] gap-3">
        <div className="flex h-[196px] w-6 flex-col justify-between text-right text-[10px] font-medium text-text-tertiary">
          {ticks.map((tick, index) => (
            <span key={`${tick}-${index}`} className="leading-none">
              {tick}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-[196px]">
            {[0, 1, 2].map((line) => (
              <span
                key={line}
                aria-hidden="true"
                className="absolute inset-x-0 border-t border-dashed border-border-secondary"
                style={{ top: `${line * 33.33}%` }}
              />
            ))}
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 border-t border-border" />

            {totalRequests === 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <p className="m-0 rounded-full bg-surface/90 px-3 py-1.5 text-[11px] font-medium text-text-tertiary">
                  No AI requests in this period
                </p>
              </div>
            )}

            <div className="absolute inset-0 flex items-end gap-1.5 sm:gap-2">
              {daily.map((day) => {
                const errors = Math.min(day.errors, day.requests);
                const successes = day.requests - errors;

                return (
                  <div
                    key={day.key}
                    className="group flex h-full flex-1 flex-col items-center justify-end"
                    title={`${day.label}: ${day.requests} request${day.requests === 1 ? '' : 's'}, ${day.errors} error${day.errors === 1 ? '' : 's'}`}
                  >
                    {day.requests === 0 ? (
                      <div className="h-[2px] w-full max-w-6 rounded-full bg-surface-tertiary/60" />
                    ) : (
                      <div className="flex w-full max-w-6 flex-col justify-end">
                        <div
                          style={{ height: `${(successes / max) * 100}%` }}
                          className="w-full rounded-t-[3px] bg-brand/90 transition duration-300 group-hover:bg-brand"
                        />
                        {errors > 0 && (
                          <div
                            style={{ height: `${(errors / max) * 100}%` }}
                            className="w-full bg-error/80 transition duration-300 group-hover:bg-error"
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex gap-1.5 sm:gap-2">
            {daily.map((day, index) => (
              <span
                key={day.key}
                className="flex-1 text-center text-[9.5px] font-medium text-text-tertiary"
              >
                {index % 2 === 0 ? day.label : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-secondary pt-3.5">
        <p className="m-0 text-[11.5px] text-text-tertiary">
          <span className="font-semibold text-text">{formatNumber(totalRequests)}</span> request
          {totalRequests === 1 ? '' : 's'} · {formatNumber(totalErrors)} error
          {totalErrors === 1 ? '' : 's'}
        </p>
        <p className="m-0 text-[11.5px] text-text-tertiary">Peak {formatNumber(max)} in a day</p>
      </div>
    </Card>
  );
}
