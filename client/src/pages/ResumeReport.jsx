import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaTrashCan } from 'react-icons/fa6';
import { useDeleteResume, useResume, useRetryResume } from '../hooks/useResume.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { ProcessingPanel } from '../components/resume/ProcessingPanel.jsx';
import { ReportSections } from '../components/resume/ReportSections.jsx';
import { StatusChip } from '../components/resume/ResumeStatus.jsx';
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

/** At-a-glance counts pulled straight from the report. */
function ReportStats({ report }) {
  const stats = [
    { label: 'Strong points', value: report.strengths?.length ?? 0 },
    { label: 'Weak points', value: report.gaps?.length ?? 0 },
    { label: 'Missing skills', value: report.missingSkills?.length ?? 0 },
    { label: 'Fixes', value: report.edits?.length ?? 0, accent: true },
  ];

  return (
    <dl className="m-0 grid grid-cols-2 border-y border-border sm:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={[
            'px-4 py-5 sm:px-6',
            index < 2 ? 'border-b border-border-secondary sm:border-b-0' : '',
            index % 2 === 1 ? 'border-l border-border-secondary' : '',
            'sm:border-l sm:border-border-secondary sm:first:border-l-0',
          ].join(' ')}
        >
          <dt className="m-0 text-[12px] text-text-secondary">
            {stat.label}
          </dt>
          <dd
            className={`m-0 mt-2 font-heading text-[28px] font-medium leading-none tabular-nums ${stat.accent ? 'text-brand-strong' : 'text-text'}`}
          >
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function ResumeReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: analysis, isPending, error } = useResume(id);
  const retry = useRetryResume(id);
  const remove = useDeleteResume();

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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

  async function onDelete() {
    setDeleteError('');

    try {
      await remove.mutateAsync(id);
      navigate('/profile');
    } catch (err) {
      setDeleteError(err.message);
      setConfirmingDelete(false);
    }
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
        action={<StatusChip status={analysis.status} />}
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
          <ReportStats report={report} />
          <ReportSections analysis={report} />
        </div>
      )}

      {/* Footer actions */}
      {(completed || analysis.status === 'FAILED') && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <Button as={Link} to="/profile" variant="secondary" size="sm">
            All analyses
          </Button>

          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="inline-flex min-h-9 items-center gap-2 rounded-button px-3 text-[13px] font-medium text-text-tertiary transition-colors hover:bg-error/5 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <FaTrashCan aria-hidden="true" className="text-[12px]" />
            Delete analysis
          </button>
        </div>
      )}

      {deleteError && (
        <div className="mt-4">
          <Alert>{deleteError}</Alert>
        </div>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this analysis?"
        message="The report and the documents used to create it will be removed. This cannot be undone."
        confirmLabel="Delete analysis"
        loading={remove.isPending}
        onConfirm={onDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
