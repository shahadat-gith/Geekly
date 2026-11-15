import { Link } from 'react-router-dom';
import { Card } from '../ui/Card.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { percent } from '../../utils/format.js';

export function TopicCoverage({ topics = [], publishedThisMonth = 0 }) {
  const max = Math.max(...topics.map((topic) => topic.count), 1);

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-[14.5px] font-semibold text-text">Topic coverage</h2>
          <p className="m-0 mt-1 text-[11.5px] text-text-tertiary">
            Where the library has the most articles
          </p>
        </div>
        <Link
          to="/topics"
          className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-text-secondary transition hover:text-brand"
        >
          View all
          <i aria-hidden="true" className="bx bx-right-arrow-alt text-[15px]" />
        </Link>
      </div>

      <div className="mt-5 flex-1 space-y-4">
        {topics.length === 0 ? (
          <EmptyState
            compact
            icon="bx-layer"
            title="No topic data yet"
            description="Create topics and attach articles to see coverage here."
          />
        ) : (
          topics.map((topic) => (
            <div key={topic.id}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-brand-soft text-[15px] text-brand">
                  <i
                    aria-hidden="true"
                    className={`bx ${topic.depth > 0 ? 'bx-file-blank' : 'bx-layer'}`}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="m-0 truncate text-[12.5px] font-semibold text-text">{topic.name}</p>
                    <p className="m-0 shrink-0 text-[11.5px] font-medium text-text-secondary">
                      {topic.count} article{topic.count === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-secondary">
                    <div
                      className="h-full rounded-full bg-brand/80"
                      style={{ width: `${percent(topic.count, max)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-panel bg-brand-soft px-4 py-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-brand">
          <i aria-hidden="true" className="bx bx-pie-chart-alt-2 text-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[12px] font-semibold text-brand">
            {publishedThisMonth} article{publishedThisMonth === 1 ? '' : 's'} published this month
          </p>
          <Link
            to="/articles?status=published"
            className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-brand/80 transition hover:text-brand"
          >
            View published articles
            <i aria-hidden="true" className="bx bx-right-arrow-alt text-[13px]" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
