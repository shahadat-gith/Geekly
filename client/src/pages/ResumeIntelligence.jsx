
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChartLine, FaBullseye, FaListCheck } from 'react-icons/fa6';

import { useResumeList } from '../hooks/useResume.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { StatusChip } from '../components/resume/ResumeStatus.jsx';
import { formatDate } from '../utils/format.js';

const POINTS = [
  {
    icon: FaChartLine,
    title: 'Scores you can act on',
    body: 'Overall fit, job match, technical depth, projects, presentation and how readable the document is to a parser.',
  },
  {
    icon: FaBullseye,
    title: 'Gap by gap',
    body: 'Every requirement is marked Strong, Partial or Not Demonstrated, with the line from your resume that supports it.',
  },
  {
    icon: FaListCheck,
    title: 'A plan, not just a verdict',
    body: 'When the report is done, build a phased preparation plan: what to learn, how to practise, and the questions to expect.',
  },
];

export default function ResumeIntelligence() {
  const { data: analyses = [], isPending, error } = useResumeList();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-panel border border-border bg-surface px-6 py-8 shadow-card sm:px-9 sm:py-10 lg:px-11 lg:py-12">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-soft/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-1/3 h-48 w-48 rounded-full bg-accent-soft/60 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.6fr)] lg:items-center">
          <div>


            <h1 className="m-0 mt-5 max-w-2xl font-heading text-[30px] font-semibold leading-[1.13] tracking-[-0.04em] text-text sm:text-[40px] lg:text-[44px]">
              See your resume the way this role will.
            </h1>

            <p className="mb-0 mt-4 max-w-xl text-[13.5px] leading-[1.8] text-text-secondary sm:text-[14.5px]">
              Upload your resume and the job description. Get a detailed breakdown of what matches,
              what is missing, and where to spend your preparation time.
            </p>

            <div className="mt-7">
              <Button as={Link} to="/resume-intelligence/new">
                Analyse a resume
                <FaArrowRight aria-hidden="true" className="ml-2 text-[11px]" />
              </Button>
            </div>
          </div>

          <div className="hidden justify-center lg:flex">
            <div className="w-full max-w-[260px] rounded-2xl border border-border bg-surface/90 p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-text-secondary">
                  Analysis overview
                </span>
                <FaChartLine className="text-[#73A85E]" />
              </div>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-[38px] font-semibold leading-none tracking-[-0.05em] text-text">
                  82
                </span>
                <span className="mb-1 text-[11px] text-text-tertiary">/ 100</span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-tertiary">
                <div className="h-full w-[82%] rounded-full bg-brand-active" />
              </div>

              <div className="mt-5 space-y-3">
                {[
                  ['Job match', 'Strong'],
                  ['Technical skills', 'Partial'],
                  ['Experience', 'Strong'],
                ].map(([label, status]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-text-secondary">{label}</span>
                    <span className="text-[10px] font-medium text-[#527C42]">{status}</span>
                  </div>
                ))}
              </div>

              <p className="mb-0 mt-5 border-t border-border pt-3 text-[10px] text-text-tertiary">
                Illustrative report preview
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature points */}
      <section className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
        {POINTS.map((point) => {
          const Icon = point.icon;

          return (
            <Card key={point.title} className="p-5 sm:p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft">
                <Icon aria-hidden="true" className="text-[14px] text-[#527C42]" />
              </div>

              <h2 className="m-0 mt-4 text-[14px] font-semibold tracking-[-0.01em] text-text">
                {point.title}
              </h2>

              <p className="mb-0 mt-2 text-[12.5px] leading-[1.75] text-text-secondary">
                {point.body}
              </p>
            </Card>
          );
        })}
      </section>

      {/* Analysis history */}
      <section className="mt-12 sm:mt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="m-0 font-heading text-[21px] font-semibold tracking-[-0.025em] text-text sm:text-[23px]">
              Your analyses
            </h2>
            <p className="m-0 mt-1 text-[12.5px] text-text-secondary">
              Your saved resume analysis reports.
            </p>
          </div>

          {analyses.length > 0 && (
            <span className="rounded-full bg-surface-tertiary px-3 py-1 text-[11px] font-medium text-text-secondary">
              {analyses.length} saved
            </span>
          )}
        </div>

        <div className="mt-5">
          {error ? (
            <Alert tone="error">{error.message}</Alert>
          ) : isPending ? (
            <div className="flex flex-col gap-3" aria-label="Loading analyses">
              {[0, 1, 2].map((key) => (
                <div
                  key={key}
                  className="h-[76px] animate-pulse rounded-card border border-border bg-surface-tertiary"
                />
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <Card className="flex flex-col items-start p-6 sm:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft">
                <FaChartLine aria-hidden="true" className="text-[17px] text-[#527C42]" />
              </div>

              <h3 className="m-0 mt-4 text-[15px] font-semibold text-text">
                No analyses yet
              </h3>

              <p className="mb-0 mt-2 max-w-lg text-[13px] leading-[1.75] text-text-secondary">
                Start with the resume you send most often and the posting you are targeting.
                The report takes a minute or two and stays in this list.
              </p>

              <Button
                as={Link}
                to="/resume-intelligence/new"
                size="sm"
                className="mt-5"
              >
                Analyse a resume
              </Button>
            </Card>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {analyses.map((analysis) => (
                <li key={analysis.id}>
                  <Link
                    to={`/resume-intelligence/${analysis.id}`}
                    className="
                      group flex min-w-0 items-center justify-between gap-3
                      rounded-card border border-border bg-surface px-4 py-4
                      shadow-card transition-all duration-200
                      hover:border-brand/50 hover:shadow-card-hover
                      focus-visible:outline-none focus-visible:ring-2
                      focus-visible:ring-brand-active focus-visible:ring-offset-2
                      sm:gap-4 sm:px-5
                    "
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-tertiary transition-colors group-hover:bg-brand-soft">
                        <FaChartLine
                          aria-hidden="true"
                          className="text-[14px] text-text-secondary group-hover:text-[#527C42]"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="m-0 truncate text-[13.5px] font-semibold text-text sm:text-[14.5px]">
                          {analysis.company?.name || 'Resume analysis'}
                        </p>

                        <p className="m-0 mt-1 truncate text-[11px] text-text-tertiary sm:text-[12px]">
                          {[
                            formatDate(analysis.createdAt),
                            analysis.document?.fileName,
                            analysis.document?.pages
                              ? `${analysis.document.pages} pages`
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
                      {analysis.scores?.overall !== null &&
                        analysis.scores?.overall !== undefined ? (
                        <span className="text-[17px] font-semibold leading-none tracking-[-0.02em] text-text sm:text-[19px]">
                          {analysis.scores.overall}
                          <span className="ml-0.5 text-[11px] font-normal text-text-tertiary">
                            /100
                          </span>
                        </span>
                      ) : (
                        <StatusChip status={analysis.status} />
                      )}

                      <FaArrowRight
                        aria-hidden="true"
                        className="text-[11px] text-text-tertiary transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#527C42]"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
