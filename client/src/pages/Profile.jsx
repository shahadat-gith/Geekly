import { Link } from 'react-router-dom';
import { FaArrowRight, FaBookOpen, FaFileLines, FaGlobe } from 'react-icons/fa6';

import { useAuth } from '../context/authContext.js';
import { useResumeList } from '../hooks/useResume.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
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
        description="Your account details and every resume review saved to it"
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14">
        <div className="min-w-0">
          {/* Account record */}
          <section className="flex min-w-0 items-center gap-5 border-y border-border py-6">
            <Avatar
              src={user?.avatar?.url}
              name={user?.fullname}
              className="h-16 w-16 shrink-0 text-[15px]"
            />

            <div className="min-w-0">
              <h2 className="m-0 truncate font-heading text-[24px] font-medium leading-tight tracking-[-0.02em] text-text">
                {user?.fullname}
              </h2>

              <p className="m-0 mt-1.5 truncate font-mono text-[12px] text-text-secondary">
                {user?.email}
              </p>
            </div>
          </section>

          {/* Resume review ledger */}
          <section className="mt-10">
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="m-0 font-heading text-[18px] font-medium tracking-[-0.015em] text-text">
                  Resume reviews
                </h2>

                <p className="m-0 mt-1 text-[12.5px] text-text-secondary">
                  {analyses.length > 0
                    ? `${analyses.length} saved · ${ready} ready`
                    : 'No reviews saved'}
                </p>
              </div>

              <Button as={Link} to="/resume-analysis" size="sm" className="w-full shrink-0 sm:w-auto">
                New analysis
              </Button>
            </div>

            {error ? (
              <div className="py-6">
                <Alert tone="error">{error.message}</Alert>
              </div>
            ) : isPending ? (
              <div className="flex flex-col" aria-label="Loading resume analyses" role="status">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="border-b border-border-secondary py-4">
                    <Skeleton className="h-10 rounded-sm" />
                  </div>
                ))}
              </div>
            ) : analyses.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  Icon={FaFileLines}
                  title="No saved analyses yet"
                  message="Completed and in-progress reports appear here once you analyse a resume"
                  action={
                    <Button as={Link} to="/resume-analysis" size="sm">
                      Analyse your first resume
                    </Button>
                  }
                />
              </div>
            ) : (
              <ul className="m-0 flex list-none flex-col p-0">
                {analyses.map((analysis, index) => (
                  <li key={analysis.id} className="border-b border-border-secondary">
                    <Link
                      to={`/resume-analysis/${analysis.id}`}
                      className="group grid min-w-0 grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 py-4 transition-colors hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="font-mono text-[10px] tabular-nums text-text-tertiary">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className="min-w-0">
                        <p className="m-0 truncate text-[14px] font-medium text-text transition-colors group-hover:text-brand-strong">
                          {analysis.company?.name || 'Resume analysis'}
                        </p>

                        <p className="m-0 mt-1 truncate font-mono text-[11px] text-text-tertiary">
                          {[formatDate(analysis.createdAt), analysis.document?.fileName]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <StatusChip status={analysis.status} />

                        <FaArrowRight
                          aria-hidden="true"
                          className="hidden text-[11px] text-text-tertiary transition-colors group-hover:text-brand-strong sm:block"
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Shortcuts */}
        <aside className="min-w-0 lg:sticky lg:top-24">
          <div className="border-t border-border pt-4">
            <p className="folio m-0">Shortcuts</p>

            <ul className="m-0 mt-3 flex list-none flex-col p-0">
              <li>
                <Link
                  to="/resume-analysis"
                  className="group flex items-center justify-between gap-3 border-b border-border-secondary py-3 text-[13px] text-text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center gap-2.5">
                    <FaFileLines aria-hidden="true" className="text-[13px] text-text-tertiary" />
                    Resume analysis
                  </span>
                  <FaArrowRight
                    aria-hidden="true"
                    className="text-[10px] text-text-tertiary transition-colors group-hover:text-brand-strong"
                  />
                </Link>
              </li>

              <li>
                <Link
                  to="/deployments"
                  className="group flex items-center justify-between gap-3 border-b border-border-secondary py-3 text-[13px] text-text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center gap-2.5">
                    <FaGlobe aria-hidden="true" className="text-[13px] text-text-tertiary" />
                    My sites
                  </span>
                  <FaArrowRight
                    aria-hidden="true"
                    className="text-[10px] text-text-tertiary transition-colors group-hover:text-brand-strong"
                  />
                </Link>
              </li>

              <li>
                <Link
                  to="/#topics"
                  className="group flex items-center justify-between gap-3 border-b border-border-secondary py-3 text-[13px] text-text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center gap-2.5">
                    <FaBookOpen aria-hidden="true" className="text-[13px] text-text-tertiary" />
                    Browse topics
                  </span>
                  <FaArrowRight
                    aria-hidden="true"
                    className="text-[10px] text-text-tertiary transition-colors group-hover:text-brand-strong"
                  />
                </Link>
              </li>
            </ul>

          </div>
        </aside>
      </div>
    </div>
  );
}
