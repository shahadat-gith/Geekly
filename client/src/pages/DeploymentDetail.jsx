import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaArrowUpRightFromSquare,
  FaClockRotateLeft,
  FaGlobe,
  FaTrashCan,
} from 'react-icons/fa6';
import {
  deleteProjectApi,
  getProjectApi,
  listDeploymentsApi,
  retryDeploymentApi,
  rollbackDeploymentApi,
} from '../api/deployments.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { StatusChip } from '../components/resume/ResumeStatus.jsx';
import { formatDate } from '../utils/format.js';
import {
  TERMINAL_STATUSES,
  deploymentStatus,
  siteHost,
  siteUrl,
} from '../components/deployments/deploymentMeta.js';

export default function DeploymentDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const project = useQuery({
    queryKey: ['deployments', 'project', projectId],
    queryFn: () => getProjectApi(projectId),
  });

  // Poll only while a deployment is non-terminal; react-query stops the
  // interval when the function returns false, and on unmount.
  const deployments = useQuery({
    queryKey: ['deployments', 'list', projectId],
    queryFn: () => listDeploymentsApi(projectId),
    refetchInterval: (query) => {
      const list = query.state.data || [];
      const active = list.some((d) => !TERMINAL_STATUSES.has(d.status));
      return active ? 3000 : false;
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['deployments'] });
  };

  const retry = useMutation({ mutationFn: retryDeploymentApi, onSuccess: refresh });
  const rollback = useMutation({ mutationFn: rollbackDeploymentApi, onSuccess: refresh });
  const remove = useMutation({
    mutationFn: () => deleteProjectApi(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      navigate('/deployments', { replace: true });
    },
  });

  if (project.isPending) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12" aria-label="Loading site">
        <div className="h-8 w-56 animate-pulse rounded bg-skeleton" />
        <div className="mt-6 h-32 animate-pulse rounded-card bg-skeleton" />
      </div>
    );
  }

  if (project.isError) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <Alert tone="error">This site could not be found.</Alert>
        <Link
          to="/deployments"
          className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-text-secondary hover:text-text"
        >
          <FaArrowLeft aria-hidden="true" className="text-[11px]" />
          My sites
        </Link>
      </div>
    );
  }

  const site = project.data;
  const list = deployments.data || [];
  const liveId = site.currentDeploymentId ? String(site.currentDeploymentId) : null;
  const liveDeployment = list.find((d) => String(d.id) === liveId);
  const actionError = retry.error || rollback.error;

  function onRollback(id) {
    if (window.confirm('Switch the live site to this version?')) rollback.mutate(id);
  }

  function onDelete() {
    if (window.confirm(`Delete ${siteHost(site.slug)} and all its versions? This cannot be undone.`)) {
      remove.mutate();
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/deployments"
        className="inline-flex items-center gap-2 text-[13px] font-medium text-text-secondary transition-colors hover:text-text"
      >
        <FaArrowLeft aria-hidden="true" className="text-[11px]" />
        My sites
      </Link>

      <header className="mt-5 flex flex-col justify-between gap-4 xs:flex-row xs:items-start">
        <div className="min-w-0">
          <h1 className="m-0 truncate font-heading text-[28px] font-semibold tracking-[-0.035em] text-text sm:text-[32px]">
            {site.name}
          </h1>
          <p className="m-0 mt-1.5 truncate text-[13.5px] text-text-tertiary">{siteHost(site.slug)}</p>
        </div>

        {liveId && (
          <Button
            as="a"
            href={siteUrl(site.slug)}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            className="w-full shrink-0 xs:w-auto"
          >
            Open site
            <FaArrowUpRightFromSquare aria-hidden="true" className="text-[11px]" />
          </Button>
        )}
      </header>

      {/* Live status */}
      <Card className="mt-7 flex items-center gap-4 p-5 sm:p-6">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            liveId ? 'bg-brand-soft' : 'bg-surface-tertiary'
          }`}
        >
          <FaGlobe aria-hidden="true" className={`text-[19px] ${liveId ? 'text-[#527C42]' : 'text-text-tertiary'}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <p className="m-0 text-[15px] font-semibold text-text">
              {liveId ? 'Your site is live' : 'Not published yet'}
            </p>
            <StatusChip status={liveId ? 'COMPLETED' : 'QUEUED'} label={liveId ? 'Live' : 'Offline'} />
          </div>
          <p className="m-0 mt-1 text-[13px] text-text-secondary">
            {liveId && liveDeployment
              ? `Serving version from ${formatDate(liveDeployment.createdAt)}.`
              : 'Upload a version to publish this site.'}
          </p>
        </div>
      </Card>

      {/* Versions */}
      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="m-0 font-heading text-[20px] font-semibold tracking-[-0.025em] text-text sm:text-[22px]">
              Versions
            </h2>
            <p className="m-0 mt-1.5 text-[13px] text-text-secondary">
              Make any earlier successful version live again without re-uploading.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {(retry.isError || rollback.isError) && (
            <Alert tone="error">
              {actionError?.response?.data?.message || 'That action failed. Try again.'}
            </Alert>
          )}

          {deployments.isPending ? (
            [1, 2].map((item) => (
              <div key={item} className="h-[68px] animate-pulse rounded-card border border-border bg-surface shadow-card" />
            ))
          ) : list.length === 0 ? (
            <Card className="px-6 py-8 text-center text-[13px] text-text-secondary">No versions yet.</Card>
          ) : (
            list.map((d) => {
              const isLive = d.status === 'success' && String(d.id) === liveId;
              const status = deploymentStatus(d.status);
              return (
                <Card
                  key={d.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-tertiary">
                      <FaClockRotateLeft aria-hidden="true" className="text-[14px] text-text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold leading-none ${status.tone}`}
                        >
                          {status.label}
                        </span>
                        {isLive && <StatusChip status="COMPLETED" label="Current" />}
                      </div>
                      <p className="m-0 mt-1.5 text-[12.5px] text-text-tertiary">
                        {d.fileCount} file(s) · {formatDate(d.createdAt)}
                      </p>
                      {d.errorMessage && (
                        <p className="m-0 mt-1 text-[12.5px] text-error">{d.errorMessage}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {d.status === 'failed' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => retry.mutate(d.id)}
                        disabled={retry.isPending}
                      >
                        Retry
                      </Button>
                    )}
                    {d.status === 'success' && !isLive && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onRollback(d.id)}
                        disabled={rollback.isPending}
                      >
                        Make live
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* Danger zone */}
      <section className="mt-12 rounded-card border border-error/25 bg-error/5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
          <div>
            <h2 className="m-0 text-[15px] font-semibold text-error">Delete site</h2>
            <p className="m-0 mt-1 text-[13px] leading-relaxed text-text-secondary">
              Removes {siteHost(site.slug)} and every version. This cannot be undone.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onDelete}
            disabled={remove.isPending}
            className="w-full border-error/40 text-error hover:bg-error/10 xs:w-auto"
          >
            <FaTrashCan aria-hidden="true" className="text-[12px]" />
            {remove.isPending ? 'Deleting…' : 'Delete site'}
          </Button>
        </div>
        {remove.isError && (
          <div className="mt-4">
            <Alert tone="error">{remove.error?.response?.data?.message || 'Could not delete this site.'}</Alert>
          </div>
        )}
      </section>
    </div>
  );
}
