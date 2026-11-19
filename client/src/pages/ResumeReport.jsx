import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaTrashCan } from 'react-icons/fa6';
import { useDeleteResume, useResume, useRetryResume } from '../hooks/useResume.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ProcessingPanel } from '../components/resume/ProcessingPanel.jsx';
import { ReportSections } from '../components/resume/ReportSections.jsx';
import { StatusChip } from '../components/resume/ResumeStatus.jsx';
import { statusIsWorking } from '../components/resume/status.js';
import { formatDate } from '../utils/format.js';


function Skeleton() {
  return (
    <div
      className="mx-auto max-w-4xl px-6 py-10 sm:py-14"
      aria-hidden="true"
      aria-label="Loading resume analysis"
    >
      {/* Page heading: title, meta line and status chip */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0 flex-1">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-skeleton" />
          <div className="mt-3 h-3.5 w-80 max-w-full animate-pulse rounded bg-skeleton" />
        </div>
        <div className="h-6 w-20 animate-pulse rounded-full bg-skeleton" />
      </div>

      {/* Report card: tab strip plus the open summary panel */}
      <div className="mt-8 overflow-hidden rounded-card border border-border bg-surface shadow-card">
        <div className="flex gap-1 overflow-hidden border-b border-border-secondary p-2">
          {[76, 100, 92, 96, 60].map((width, index) => (
            <div
              key={index}
              className="h-8 shrink-0 animate-pulse rounded-button bg-skeleton"
              style={{ width: `${width}px` }}
            />
          ))}
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-baseline gap-3 border-b border-border-secondary pb-4">
            <div className="h-4 w-24 animate-pulse rounded bg-skeleton" />
            <div className="h-3 w-36 animate-pulse rounded bg-skeleton" />
          </div>

          <div className="mt-5 space-y-2.5">
            {['w-full', 'w-[97%]', 'w-[92%]', 'w-4/5', 'w-3/5'].map((width) => (
              <div
                key={width}
                className={`h-3.5 ${width} animate-pulse rounded bg-skeleton`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
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

  if (isPending) return <Skeleton />;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Alert tone={error.status === 404 ? 'warning' : 'error'}>
          {error.message}
        </Alert>

        <div className="mt-5">
          <Button
            as={Link}
            to="/profile"
            variant="secondary"
          >
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
    }
  }

  const report = analysis.analysis;
  const completed = analysis.status === 'COMPLETED' && report;
  const working = statusIsWorking(analysis.status);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
      {/* Page heading */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <h1 className="m-0 font-heading text-[28px] font-semibold leading-[1.15] tracking-[-0.035em] text-text sm:text-[34px]">
            Resume analysis
          </h1>

          <p className="m-0 mt-2 text-[13px] leading-5 text-text-tertiary">
            {[
              analysis.company?.name,
              formatDate(analysis.createdAt),
              analysis.document?.fileName,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        <StatusChip status={analysis.status} />
      </div>

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
              disabled={retry.isPending}
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

      {/* Completed report: one column, every section visible */}
      {completed && (
        <div className="mt-8">
          <ReportSections analysis={report} />
        </div>
      )}

      {/* Footer actions */}
      {(completed || analysis.status === 'FAILED') && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <Button
            as={Link}
            to="/profile"
            variant="secondary"
            size="sm"
          >
            All analyses
          </Button>

          {confirmingDelete ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="mr-1 text-[13px] text-text-secondary">
                Delete this report?
              </span>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setConfirmingDelete(false)}
                disabled={remove.isPending}
              >
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={onDelete}
                disabled={remove.isPending}
              >
                {remove.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="inline-flex min-h-9 items-center gap-2 rounded-button px-3 text-[13px] font-medium text-text-tertiary transition-colors hover:bg-error/5 hover:text-error focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
            >
              <FaTrashCan aria-hidden="true" className="text-[12px]" />
              Delete analysis
            </button>
          )}
        </div>
      )}

      {deleteError && (
        <div className="mt-4">
          <Alert>{deleteError}</Alert>
        </div>
      )}
    </div>
  );
}
