import { Link } from 'react-router-dom';
import { Button } from '../ui/Button.jsx';

const FEATURES = [
  {
    title: 'See how you match',
    description: 'Compare your experience with the job requirements.',
  },
  {
    title: 'Find what is missing',
    description: 'Spot the requirements your resume does not prove yet.',
  },
  {
    title: 'Copy ready-made lines',
    description: 'Paste finished sentences into the section they belong to.',
  },
];

// A small preview of the report the tool produces, so the section shows
// what a role comparison looks like instead of describing it.
const REQUIREMENTS = [
  { label: 'REST API design', state: 'Matched' },
  { label: 'PostgreSQL indexing', state: 'Matched' },
  { label: 'Kubernetes operations', state: 'Partly matched' },
  { label: 'CI/CD pipelines', state: 'Partly matched' },
  { label: 'Incident response', state: 'Not found' },
];

const STATE_DOT = {
  Matched: 'bg-brand',
  'Partly matched': 'bg-accent',
  'Not found': 'bg-text-tertiary/50',
};

function RoleMatch() {
  return (
    <figure className="m-0 self-start rounded-panel border border-border bg-bg p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
        <p className="m-0 text-[14px] font-medium text-text">
          Backend engineer
        </p>
        <p className="m-0 font-mono text-[11px] tabular-nums text-text-secondary">
          12 requirements
        </p>
      </div>

      <ul className="m-0 mt-2 list-none p-0">
        {REQUIREMENTS.map(({ label, state }) => (
          <li
            key={label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border-secondary py-3 last:border-b-0"
          >
            <span className="text-[13.5px] text-text">{label}</span>

            <span className="inline-flex items-center gap-2 text-[12px] text-text-secondary">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${STATE_DOT[state]}`}
              />
              {state}
            </span>
          </li>
        ))}
      </ul>

      <p className="m-0 mt-4 font-mono text-[11px] tabular-nums text-text-secondary">
        3 fixes to review
      </p>
    </figure>
  );
}

export function ResumeIntelligenceCta() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,464px)] lg:gap-16 lg:px-8 lg:py-24">
        <div>
          <h2 className="m-0 max-w-[24ch] text-balance font-heading text-[32px] font-medium leading-[1.12] tracking-[-0.025em] text-text sm:text-[38px]">
            Check your resume against a job posting
          </h2>

          <p className="mt-4 max-w-[52ch] text-[14.5px] leading-[1.7] text-text-secondary sm:text-[15px]">
            Upload your resume, paste the job description, and see which
            requirements you meet, which are weak, and what to change.
          </p>

          <ol className="m-0 mt-8 list-none p-0">
            {FEATURES.map(({ title, description }, index) => (
              <li
                key={title}
                className="grid grid-cols-[24px_minmax(0,1fr)] gap-4 border-t border-border-secondary py-4 last:border-b last:border-border-secondary"
              >
                <span className="pt-0.5 font-mono text-[11px] tabular-nums text-text-secondary">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span>
                  <span className="block text-[14px] font-medium text-text">
                    {title}
                  </span>
                  <span className="mt-1 block max-w-[46ch] text-[13px] leading-[1.6] text-text-secondary">
                    {description}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-8">
            <Button as={Link} to="/resume-analysis">
              Analyze a resume
            </Button>
          </div>
        </div>

        <RoleMatch />
      </div>
    </section>
  );
}
