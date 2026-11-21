import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaMagnifyingGlassChart,
  FaBullseye,
  FaListCheck,
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

export function ResumeIntelligenceCta() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="eyebrow m-0">Resume intelligence</p>

        <h2 className="mt-4 text-balance font-heading text-[32px] font-semibold leading-[1.12] tracking-[-0.035em] sm:text-[40px]">
          Your resume tells a story.
          <span className="text-brand-strong">
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
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-brand-strong">
                <Icon className="text-[14px]" />
              </div>

              <div>
                <p className="m-0 text-[13px] font-semibold text-text">
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
            <FaArrowRight aria-hidden="true" className="text-[13px]" />
          </Button>

          <span className="font-mono text-[11px] text-text-tertiary">
            resume + job description
          </span>
        </div>
      </div>
    </section>
  );
}
