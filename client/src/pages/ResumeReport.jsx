import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useResume, useRetryResume } from '../hooks/useResume.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { ProcessingPanel } from '../components/resume/ProcessingPanel.jsx';
import { ReportSections } from '../components/resume/ReportSections.jsx';
import { statusIsWorking } from '../components/resume/status.js';
import { formatDate } from '../utils/format.js';

function ReportSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8" aria-hidden="true">
      <Skeleton className="h-2.5 w-24" />
      <Skeleton className="mt-5 h-8 w-64 max-w-full" />
      <Skeleton className="mt-3 h-3.5 w-80 max-w-full" />

      <div className="mt-8 grid grid-cols-2 border-y border-border sm:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="border-b border-border-secondary px-4 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:border-border-secondary sm:last:border-r-0"
          >
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="mt-3 h-7 w-10" />
          </div>
        ))}
      </div>

      <div className="mt-8 min-w-0 border border-border bg-surface lg:grid lg:grid-cols-[216px_minmax(0,1fr)]">
        <div className="border-b border-border-secondary bg-surface-secondary/40 p-3 lg:border-b-0 lg:border-r">
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="mb-1.5 h-9 w-full" />
          ))}
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <Skeleton className="h-4 w-32" />
          <div className="mt-5 space-y-2.5">
            {['w-full', 'w-[97%]', 'w-[92%]', 'w-4/5', 'w-3/5'].map((width) => (
              <Skeleton key={width} className={`h-3.5 ${width}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResumeReport() {
  const { id } = useParams();
  const { data: analysis, isPending, error } = useResume(id);
  const retry = useRetryResume(id);


  if (isPending) return <ReportSkeleton />;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Alert tone={error.status === 404 ? 'warning' : 'error'}>
          {error.message}
        </Alert>

        <div className="mt-5">
          <Button as={Link} to="/profile" variant="secondary">
            All analyses
          </Button>
        </div>
      </div>
    );
  }


  const report = analysis.analysis;
  const completed = analysis.status === 'COMPLETED' && report;
  const working = statusIsWorking(analysis.status);

  const meta = [
    analysis.company?.name,
    formatDate(analysis.createdAt),
    analysis.document?.fileName,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[12px]">
        <Link to="/profile" className="rounded-sm text-text-secondary transition-colors hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Your profile</Link>
        <span aria-hidden="true" className="text-text-disabled">/</span>
        <span aria-current="page" className="font-medium text-text">Resume report</span>
      </nav>

      <PageHeader
        eyebrow="Resume review"
        title="Resume report"
        description={
          meta.length > 0 ? (
            <span className="font-mono text-[12.5px] text-text-tertiary">
              {meta.join(' · ')}
            </span>
          ) : undefined
        }
      />

      {/* Processing state */}
      {working && (
        <div className="mt-8">
          <ProcessingPanel
            title="Analysing your resume"
            stage={analysis.stage || 'Queued — starting shortly…'}
          />
        </div>
      )}

      {/* Failed state */}
      {analysis.status === 'FAILED' && (
        <div className="mt-8 flex flex-col gap-4">
          <Alert tone="error" title="This analysis did not finish">
            {analysis.error || 'Something went wrong while generating the report.'}
          </Alert>

          <div>
            <Button
              onClick={() => retry.mutate()}
              loading={retry.isPending}
            >
              {retry.isPending ? 'Retrying…' : 'Try again'}
            </Button>
          </div>

          {retry.error && <Alert>{retry.error.message}</Alert>}
        </div>
      )}

      {/* Report generated with the previous report format */}
      {completed && (report.version ?? 0) < 4 && (
        <div className="mt-8">
          <Alert tone="info" title="This report uses an earlier format">
            It was created before the report became a full review with strong
            points, weak points and missing skills. Upload the resume again to
            get the current report.
          </Alert>
        </div>
      )}

      {/* Completed report */}
      {completed && (
        <div className="mt-8 flex flex-col gap-8">
          <ReportSections analysis={report} />
        </div>
      )}
    </div>
  );
}
