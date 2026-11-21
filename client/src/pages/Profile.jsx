import { Link } from 'react-router-dom';
import { FaArrowRight, FaBookOpen, FaFileLines, FaGlobe } from 'react-icons/fa6';

import { useAuth } from '../context/authContext.js';
import { useResumeList } from '../hooks/useResume.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { Button } from '../components/ui/Button.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { StatusChip } from '../components/resume/ResumeStatus.jsx';
import { formatDate } from '../utils/format.js';

export default function Profile() {
  const { user } = useAuth();
  const { data: analyses = [], isPending, error } = useResumeList();

  const ready = analyses.filter((analysis) => analysis.status === 'COMPLETED').length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Manage your account details and revisit your resume analysis reports."
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="flex flex-col gap-4">
          {/* Profile information */}
          <section className="flex items-center gap-4 rounded-card border border-border bg-surface p-5 shadow-card sm:p-6">
            <Avatar
              src={user?.avatar?.url}
              name={user?.fullname}
              className="h-14 w-14 shrink-0 text-lg sm:h-16 sm:w-16"
            />

            <div className="min-w-0">
              <h2 className="m-0 truncate text-[16px] font-semibold tracking-[-0.02em] text-text sm:text-[18px]">
                {user?.fullname}
              </h2>

              <p className="m-0 mt-1 truncate font-mono text-[12px] text-text-secondary sm:text-[12.5px]">
                {user?.email}
              </p>
            </div>
          </section>

          {/* Resume analysis history */}
          <section className="rounded-card border border-border bg-surface shadow-card">
            <div className="flex flex-col justify-between gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:px-6">
              <div>
                <h2 className="m-0 text-[15px] font-semibold tracking-[-0.015em] text-text">
                  Resume analysis
                </h2>

                <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-text-secondary">
                  {analyses.length > 0
                    ? `${analyses.length} report${analyses.length === 1 ? '' : 's'} · ${ready} ready`
                    : 'No reports yet'}
                </p>
              </div>

              <Button as={Link} to="/resume-analysis" size="sm" className="w-full shrink-0 sm:w-auto">
                New analysis
              </Button>
            </div>

            <div className="p-4 sm:p-5">
              {error ? (
                <Alert tone="error">{error.message}</Alert>
              ) : isPending ? (
                <div className="flex flex-col gap-2.5" aria-label="Loading resume analyses" role="status">
                  {[1, 2, 3].map((item) => (
                    <Skeleton key={item} className="h-[62px] rounded-card" />
                  ))}
                </div>
              ) : analyses.length === 0 ? (
                <div className="flex flex-col items-center rounded-card border border-dashed border-border px-6 py-10 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft">
                    <FaFileLines aria-hidden="true" className="text-[17px] text-brand-strong" />
                  </div>

                  <h3 className="m-0 mt-3.5 text-[14px] font-semibold text-text">
                    No saved analyses yet
                  </h3>

                  <p className="m-0 mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-text-secondary">
                    Completed and in-progress reports appear here once you analyse a resume.
                  </p>

                  <Button as={Link} to="/resume-analysis" size="sm" className="mt-4">
                    Analyse your first resume
                  </Button>
                </div>
              ) : (
                <ul className="m-0 flex list-none flex-col divide-y divide-border-secondary p-0">
                  {analyses.map((analysis) => (
                    <li key={analysis.id}>
                      <Link
                        to={`/resume-analysis/${analysis.id}`}
                        className="group -mx-2 flex min-w-0 items-center justify-between gap-3 rounded-field px-2 py-3 transition-colors hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-tertiary transition-colors group-hover:bg-brand-soft">
                            <FaFileLines
                              aria-hidden="true"
                              className="text-[13px] text-text-secondary group-hover:text-brand-strong"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="m-0 truncate text-[13.5px] font-medium text-text">
                              {analysis.company?.name || 'Resume analysis'}
                            </p>

                            <p className="m-0 mt-0.5 truncate font-mono text-[11px] text-text-tertiary">
                              {[formatDate(analysis.createdAt), analysis.document?.fileName]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2.5">
                          <StatusChip status={analysis.status} />

                          <FaArrowRight
                            aria-hidden="true"
                            className="hidden text-[11px] text-text-tertiary transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand-strong sm:block"
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

        {/* Sidebar */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="rounded-card border border-border bg-surface p-5 shadow-card">
            <h2 className="eyebrow m-0">Workspace</h2>

            <ul className="m-0 mt-3 flex list-none flex-col p-0">
              <li>
                <Link
                  to="/resume-analysis"
                  className="group flex items-center justify-between gap-3 rounded-field px-2 py-2.5 transition-colors hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center gap-2.5 text-[13px] font-medium text-text-secondary group-hover:text-text">
                    <FaFileLines aria-hidden="true" className="text-[12px] text-text-tertiary" />
                    Resume analysis
                  </span>
                  <FaArrowRight aria-hidden="true" className="text-[10px] text-text-tertiary" />
                </Link>
              </li>

              <li>
                <Link
                  to="/deployments"
                  className="group flex items-center justify-between gap-3 rounded-field px-2 py-2.5 transition-colors hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center gap-2.5 text-[13px] font-medium text-text-secondary group-hover:text-text">
                    <FaGlobe aria-hidden="true" className="text-[12px] text-text-tertiary" />
                    My sites
                  </span>
                  <FaArrowRight aria-hidden="true" className="text-[10px] text-text-tertiary" />
                </Link>
              </li>

              <li>
                <Link
                  to="/#topics"
                  className="group flex items-center justify-between gap-3 rounded-field px-2 py-2.5 transition-colors hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center gap-2.5 text-[13px] font-medium text-text-secondary group-hover:text-text">
                    <FaBookOpen aria-hidden="true" className="text-[12px] text-text-tertiary" />
                    Browse topics
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
