import { Link } from 'react-router-dom';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { percent } from '../../utils/format.js';

const TONES = {
  published: { bar: 'bg-success', dot: 'bg-success' },
  draft: { bar: 'bg-warning', dot: 'bg-warning' },
  archived: { bar: 'bg-text-disabled', dot: 'bg-text-disabled' },
};

export function ContentMix({ breakdown = [], total = 0 }) {
  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <div>
        <h2 className="m-0 text-[14.5px] font-semibold text-text">Content mix</h2>
        <p className="m-0 mt-1 text-[11.5px] text-text-tertiary">
          Distribution of {total} article{total === 1 ? '' : 's'} by status
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {breakdown.map((item) => {
          const tone = TONES[item.status] ?? TONES.archived;
          const share = percent(item.count, total);
          return (
            <div key={item.status}>
              <div className="flex items-center justify-between gap-2 text-[12px]">
                <span className="inline-flex items-center gap-2 font-medium text-text">
                  <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                  {item.label}
                </span>
                <span className="text-text-secondary">
                  {item.count} <span className="text-text-tertiary">· {share}%</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-secondary">
                <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${share}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-5">
        <div className="rounded-panel bg-surface-secondary p-3.5">
          <p className="m-0 mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
            Quick actions
          </p>
          <div className="flex flex-col gap-2">
            <Button
              as={Link}
              to="/articles/new"
              variant="secondary"
              size="sm"
              className="justify-start bg-surface"
            >
              <i aria-hidden="true" className="bx bx-edit-alt text-[16px] text-brand" />
              Write an article
            </Button>
            <Button
              as={Link}
              to="/topics"
              variant="secondary"
              size="sm"
              className="justify-start bg-surface"
            >
              <i aria-hidden="true" className="bx bx-layer-plus text-[16px] text-brand" />
              Add a topic
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
