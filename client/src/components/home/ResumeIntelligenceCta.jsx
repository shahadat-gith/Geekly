
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaFileLines,
  FaMagnifyingGlassChart,
  FaBullseye,
  FaListCheck,
  FaCheck,
} from 'react-icons/fa6';
import { Button } from '../ui/Button.jsx';

const FEATURES = [
  {
    Icon: FaBullseye,
    title: 'Role alignment',
    description: 'See how your experience matches the job requirements.',
  },
  {
    Icon: FaMagnifyingGlassChart,
    title: 'Skill gap analysis',
    description: 'Identify missing skills and areas that need stronger evidence.',
  },
  {
    Icon: FaListCheck,
    title: 'Paste-ready fixes',
    description: 'Get finished lines for the section they belong to, ready to copy in.',
  },
];

function AnalysisPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      <div className="absolute -inset-5 rounded-[2rem] bg-brand-soft/70 blur-2xl" />

      <div className="relative overflow-hidden rounded-panel border border-border bg-surface shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-[#527C42]">
              <FaFileLines className="text-[15px]" />
            </div>

            <div>
              <p className="text-[13px] font-semibold text-text">
                Resume analysis
              </p>
              <p className="text-[11px] text-text-tertiary">
                Your career insights
              </p>
            </div>
          </div>

          <span className="rounded-full border border-success/20 bg-success/5 px-2.5 py-1 text-[10px] font-semibold text-success">
            AI powered
          </span>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
              Analysis overview
            </p>
            <p className="mt-2 text-[15px] font-semibold text-text">
              Understand your strengths and gaps.
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
              Get a structured breakdown of your experience against a target role.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-secondary p-4">
            <div className="flex items-center gap-2">
              <FaBullseye className="text-[13px] text-[#527C42]" />
              <p className="text-[12px] font-semibold text-text">
                Role alignment
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {[
                ['Relevant experience', 'Strong evidence'],
                ['Technical skills', 'Needs review'],
                ['Project impact', 'Could improve'],
              ].map(([title, status], index) => (
                <div
                  key={title}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-[11.5px] text-text-secondary">
                    {title}
                  </span>

                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-medium ${index === 0
                      ? 'bg-success/10 text-success'
                      : 'bg-accent-soft text-[#A36B32]'
                      }`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-2">
              <FaListCheck className="text-[13px] text-[#A36B32]" />
              <p className="text-[12px] font-semibold text-text">
                Fixes to apply
              </p>
            </div>

            <div className="mt-3 space-y-2.5">
              {[
                'Rewrite the first bullet with impact',
                'Add the missing stack to a project',
                'Move skills above the projects',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <FaCheck className="mt-0.5 shrink-0 text-[10px] text-success" />
                  <span className="text-[11.5px] leading-relaxed text-text-secondary">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-[10px] text-text-tertiary">
            Illustrative preview · Your results depend on your submitted documents
          </p>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 shadow-card sm:flex">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-[#A36B32]">
          <FaMagnifyingGlassChart className="text-[12px]" />
        </span>
        <span className="text-[11px] font-semibold text-text">
          Find your next improvement
        </span>
      </div>
    </div>
  );
}

export function ResumeIntelligenceCta() {
  return (
    <section className="relative isolate overflow-hidden border-y border-border bg-surface-secondary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[500px] w-[500px] rounded-full bg-brand-soft/70 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -left-40 -z-10 h-[400px] w-[400px] rounded-full bg-accent-soft/70 blur-3xl"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 sm:py-24 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
        <div className="max-w-xl">


          <h2 className="mt-6 text-balance font-heading text-[34px] font-semibold leading-[1.12] tracking-[-0.04em] sm:text-[42px] lg:text-[46px]">
            Your resume tells a story.
            <span className="text-[#527C42]">
              {' '}Make sure it fits the role.
            </span>
          </h2>

          <p className="mt-5 max-w-lg text-[14.5px] leading-[1.8] text-text-secondary sm:text-[15.5px]">
            Compare your resume with a job description, see which
            requirements it really evidences, and get the exact lines to paste
            in to close the gaps.
          </p>

          <div className="mt-8 space-y-4">
            {FEATURES.map(({ Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-[#527C42]">
                  <Icon className="text-[14px]" />
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-text">
                    {title}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button as={Link} to="/resume-analysis">
              Analyze your resume
              <FaArrowRight
                aria-hidden="true"
                className="text-[13px] transition-transform group-hover:translate-x-1"
              />
            </Button>

            <span className="text-[11.5px] text-text-tertiary">
              Resume + job description
            </span>
          </div>
        </div>

        <AnalysisPreview />
      </div>
    </section>
  );
}
