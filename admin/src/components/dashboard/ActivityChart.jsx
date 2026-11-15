import { Link } from 'react-router-dom';
import { Card } from '../ui/Card.jsx';

function ChartLegend() {
  return (
    <div className="flex items-center gap-4 text-[11px] text-text-secondary">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-[3px] bg-brand" />
        Published
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-[3px] bg-surface-tertiary" />
        Created
      </span>
    </div>
  );
}

export function ActivityChart({ activity = [] }) {
  const max = Math.max(...activity.flatMap((month) => [month.created, month.published]), 1);
  const total = activity.reduce((sum, month) => sum + month.published, 0);
  const ticks = [max, Math.round(max * 0.66), Math.round(max * 0.33), 0];

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-[14.5px] font-semibold text-text">Publishing activity</h2>
          <p className="m-0 mt-1 text-[11.5px] text-text-tertiary">
            Articles created and published over the last 6 months
          </p>
        </div>
        <ChartLegend />
      </div>

      <div className="mt-6 flex min-h-[220px] gap-3">
        <div className="flex h-[196px] w-6 flex-col justify-between pb-0 text-right text-[10px] font-medium text-text-tertiary">
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

            {total === 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <p className="m-0 rounded-full bg-surface/90 px-3 py-1.5 text-[11px] font-medium text-text-tertiary">
                  No publishing activity yet
                </p>
              </div>
            )}

            <div className="absolute inset-0 flex items-end gap-2 sm:gap-3">
              {activity.map((month) => (
                <div
                  key={month.key}
                  className="group flex h-full flex-1 items-end justify-center gap-1"
                >
                  <div
                    title={`${month.published} published in ${month.label}`}
                    style={{ height: `${(month.published / max) * 100}%` }}
                    className="w-[35%] max-w-5 rounded-t-[5px] bg-brand/90 transition duration-300 group-hover:bg-brand"
                  />
                  <div
                    title={`${month.created} created in ${month.label}`}
                    style={{ height: `${(month.created / max) * 100}%` }}
                    className="w-[35%] max-w-5 rounded-t-[5px] bg-surface-tertiary transition duration-300 group-hover:bg-border"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 flex gap-2 sm:gap-3">
            {activity.map((month) => (
              <span
                key={month.key}
                className="flex-1 text-center text-[10.5px] font-medium text-text-tertiary"
              >
                {month.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border-secondary pt-3.5">
        <p className="m-0 text-[11.5px] text-text-tertiary">
          <span className="font-semibold text-text">{total}</span> article
          {total === 1 ? '' : 's'} published in this period
        </p>
        <Link
          to="/articles?status=published"
          className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand transition hover:text-brand-hover"
        >
          View articles
          <i aria-hidden="true" className="bx bx-right-arrow-alt text-[15px]" />
        </Link>
      </div>
    </Card>
  );
}
