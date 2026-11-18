
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaTrashCan } from 'react-icons/fa6';
import { useDeleteResume, useResume, useRetryResume } from '../hooks/useResume.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ProcessingPanel } from '../components/resume/ProcessingPanel.jsx';
import { ReportSections } from '../components/resume/ReportSections.jsx';
import { ScoreGrid } from '../components/resume/ScoreGrid.jsx';
import { StatusChip } from '../components/resume/ResumeStatus.jsx';
import { statusIsWorking } from '../components/resume/status.js';
import { formatDate } from '../utils/format.js';


function Skeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0 flex-1">
          <div className="h-8 w-56 rounded-lg bg-surface-tertiary" />
          <div className="mt-3 h-3.5 w-80 max-w-full rounded bg-surface-tertiary" />
        </div>
        <div className="h-10 w-36 rounded-button bg-surface-tertiary" />
      </div>

      {/* Score cards */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[0, 1, 2, 3, 4, 5].map((key) => (
          <div
            key={key}
            className="rounded-card border border-border bg-surface p-4 shadow-card"
          >
            <div className="mx-auto h-3 w-20 rounded bg-surface-tertiary" />
            <div className="mx-auto mt-4 h-8 w-14 rounded bg-surface-tertiary" />
            <div className="mt-3 h-1.5 rounded-full bg-surface-tertiary" />
          </div>
        ))}
      </div>

      {/* Report layout */}
      <div className="mt-8 grid gap-5 lg:h-[calc(100svh-262px)] lg:min-h-[520px] lg:grid-cols-[minmax(0,1fr)_256px] lg:grid-rows-[minmax(0,1fr)]">
        {/* Report content */}
        <div className="min-h-[480px] overflow-hidden rounded-card border border-border bg-surface p-5 shadow-card sm:p-6">
          {/* Section navigation */}
          <div className="flex gap-2 overflow-hidden border-b border-border pb-4">
            {[100, 76, 88, 72, 92].map((width, index) => (
              <div
                key={index}
                className="h-8 shrink-0 rounded-button bg-surface-tertiary"
                style={{ width: `${width}px` }}
              />
            ))}
          </div>

          {/* Section heading */}
          <div className="mt-6 h-6 w-48 rounded bg-surface-tertiary" />
          <div className="mt-3 h-3.5 w-full max-w-xl rounded bg-surface-tertiary" />
          <div className="mt-2 h-3.5 w-4/5 max-w-lg rounded bg-surface-tertiary" />

          {/* Report content blocks */}
          <div className="mt-8 space-y-5">
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                className="rounded-xl border border-border-secondary p-4 sm:p-5"
              >
                <div className="h-4 w-36 rounded bg-surface-tertiary" />
                <div className="mt-4 space-y-2.5">
                  <div className="h-3 w-full rounded bg-surface-tertiary" />
                  <div className="h-3 w-11/12 rounded bg-surface-tertiary" />
                  <div className="h-3 w-3/4 rounded bg-surface-tertiary" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scores sidebar */}
        <aside className="h-fit rounded-card border border-border bg-surface p-4 shadow-card">
          <div className="mb-5 h-5 w-20 rounded bg-surface-tertiary" />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {[0, 1, 2, 3, 4, 5].map((key) => (
              <div
                key={key}
                className="rounded-xl border border-border-secondary p-3"
              >
                <div className="h-3 w-20 rounded bg-surface-tertiary" />
                <div className="mt-3 h-6 w-12 rounded bg-surface-tertiary" />
                <div className="mt-3 h-1.5 rounded-full bg-surface-tertiary" />
              </div>
            ))}
          </div>
        </aside>
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
            to="/resume-intelligence"
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
      navigate('/resume-intelligence');
    } catch (err) {
      setDeleteError(err.message);
    }
  }

  const report = analysis.analysis;
  const completed = analysis.status === 'COMPLETED' && report;
  const working = statusIsWorking(analysis.status);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
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

        {completed ? (
          <Button
            as={Link}
            to={`/resume-intelligence/${id}/preparation`}
            variant="secondary"
            className="shrink-0"
          >
            Preparation plan
          </Button>
        ) : (
          <StatusChip status={analysis.status} />
        )}
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

      {/* Completed report */}
      {completed && (
        <div className="mt-8 grid gap-5 lg:h-[calc(100svh-262px)] lg:min-h-[520px] lg:grid-cols-[minmax(0,1fr)_256px] lg:grid-rows-[minmax(0,1fr)]">
          <ReportSections
            analysis={report}
            jobDescription={analysis.jobDescription}
            company={analysis.company}
          />

          <aside className="rounded-card border border-border bg-surface p-4 shadow-card lg:self-start">
            <h2 className="mb-4 mt-0 text-[15px] font-semibold tracking-[-0.01em] text-text">
              Scores
            </h2>

            <ScoreGrid scores={analysis.scores} compact />
          </aside>
        </div>
      )}

      {/* Footer actions */}
      {(completed || analysis.status === 'FAILED') && (
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <Button
            as={Link}
            to="/resume-intelligence"
            variant="secondary"
            size="sm"
          >
            All analyses
          </Button>

          {confirmingDelete ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="mr-1 text-[13px] text-text-secondary">
                Delete this report and its plan?
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
