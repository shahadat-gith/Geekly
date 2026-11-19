
import { Link } from 'react-router-dom';
import { FaArrowRight, FaFileLines } from 'react-icons/fa6';

import { useAuth } from '../context/authContext.js';
import { useResumeList } from '../hooks/useResume.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { StatusChip } from '../components/resume/ResumeStatus.jsx';
import { formatDate } from '../utils/format.js';

export default function Profile() {
  const { user } = useAuth();
  const { data: analyses = [], isPending, error } = useResumeList();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header>
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#527C42]">
          Account
        </p>

        <h1 className="m-0 mt-2 font-heading text-[28px] font-semibold tracking-[-0.035em] text-text sm:text-[36px]">
          Your profile
        </h1>

        <p className="m-0 mt-2 max-w-xl text-[13.5px] leading-relaxed text-text-secondary">
          Manage your account details and revisit your resume analysis reports.
        </p>
      </header>

      {/* Profile information */}
      <Card className="mt-7 flex items-center gap-4 p-5 sm:gap-5 sm:p-6">
        <Avatar
          src={user?.avatar?.url}
          name={user?.fullname}
          className="h-14 w-14 shrink-0 text-lg sm:h-16 sm:w-16"
        />

        <div className="min-w-0">
          <h2 className="m-0 truncate text-[16px] font-semibold tracking-[-0.02em] text-text sm:text-[18px]">
            {user?.fullname}
          </h2>

          <p className="m-0 mt-1 truncate text-[13px] text-text-secondary sm:text-[13.5px]">
            {user?.email}
          </p>
        </div>
      </Card>

      {/* Resume analysis history */}
      <section className="mt-10 sm:mt-12">
        <div className="flex flex-col justify-between gap-4 xs:flex-row xs:items-center">
          <div>
            <h2 className="m-0 font-heading text-[20px] font-semibold tracking-[-0.025em] text-text sm:text-[23px]">
              Resume analysis history
            </h2>

            <p className="m-0 mt-1.5 text-[13px] leading-relaxed text-text-secondary">
              Open a saved report to review its verdict and the fixes it found.
            </p>
          </div>

          <Button
            as={Link}
            to="/resume-analysis"
            size="sm"
            className="w-full xs:w-auto"
          >
            Analyse a resume
          </Button>
        </div>

        <div className="mt-5">
          {error ? (
            <Alert tone="error">{error.message}</Alert>
          ) : isPending ? (
            <div className="flex flex-col gap-3" aria-label="Loading resume analyses">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-4 shadow-card sm:gap-4 sm:px-5"
                >
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-skeleton" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3.5 w-36 max-w-full animate-pulse rounded bg-skeleton" />
                    <div className="h-3 w-48 max-w-full animate-pulse rounded bg-skeleton" />
                  </div>

                  <div className="h-6 w-16 shrink-0 animate-pulse rounded-full bg-skeleton" />
                </div>
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <Card className="flex flex-col items-center px-6 py-10 text-center sm:py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft">
                <FaFileLines
                  aria-hidden="true"
                  className="text-[19px] text-[#527C42]"
                />
              </div>

              <h3 className="m-0 mt-4 text-[15px] font-semibold text-text">
                No saved analyses yet
              </h3>

              <p className="mb-0 mt-1.5 max-w-sm text-[13px] leading-relaxed text-text-secondary">
                Your completed and in-progress reports will appear here once you analyse a resume.
              </p>

              <Button
                as={Link}
                to="/resume-analysis"
                size="sm"
                className="mt-5"
              >
                Analyse your first resume
              </Button>
            </Card>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {analyses.map((analysis) => (
                <li key={analysis.id}>
                  <Link
                    to={`/resume-analysis/${analysis.id}`}
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
                    <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-tertiary transition-colors group-hover:bg-brand-soft">
                        <FaFileLines
                          aria-hidden="true"
                          className="text-[15px] text-text-secondary group-hover:text-[#527C42]"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="m-0 truncate text-[13.5px] font-semibold text-text sm:text-[14.5px]">
                          {analysis.company?.name || 'Resume analysis'}
                        </p>

                        <p className="m-0 mt-1 truncate text-[11.5px] text-text-tertiary sm:text-[12.5px]">
                          {[formatDate(analysis.createdAt), analysis.document?.fileName]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
                      <StatusChip status={analysis.status} />

                      <FaArrowRight
                        aria-hidden="true"
                        className="shrink-0 text-[11px] text-text-tertiary transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#527C42]"
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
