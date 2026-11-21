import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
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
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
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

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rollbackTarget, setRollbackTarget] = useState(null);

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
  const rollback = useMutation({
    mutationFn: rollbackDeploymentApi,
    onSuccess: () => {
      refresh();
      setRollbackTarget(null);
    },
  });
  const remove = useMutation({
    mutationFn: () => deleteProjectApi(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      navigate('/deployments', { replace: true });
    },
  });

  if (project.isPending) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8" aria-label="Loading site">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-4 h-8 w-64" />
        <Skeleton className="mt-8 h-[92px] rounded-card" />
        <div className="mt-8 space-y-2.5">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-[76px] rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  if (project.isError) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <Alert tone="error">This site could not be found.</Alert>
      </div>
    );
  }

  const site = project.data;
  const list = deployments.data || [];
  const liveId = site.currentDeploymentId ? String(site.currentDeploymentId) : null;
  const liveDeployment = list.find((d) => String(d.id) === liveId);
  const actionError = retry.error || rollback.error;

  const successCount = list.filter((d) => d.status === 'success').length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeader
        eyebrow="Static hosting"
        title={site.name}
        description={siteHost(site.slug)}
        action={
          liveId && (
            <Button
              as="a"
              href={siteUrl(site.slug)}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
            >
              Open site
              <FaArrowUpRightFromSquare aria-hidden="true" className="text-[11px]" />
            </Button>
          )
        }
      />

      {/* Live status */}
      <section className="mt-8 grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
        <div className="flex items-center gap-4 rounded-card border border-border bg-surface p-5 shadow-card">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${liveId ? 'bg-brand-soft' : 'bg-surface-tertiary'}`}
          >
            <FaGlobe
              aria-hidden="true"
              className={`text-[18px] ${liveId ? 'text-brand-strong' : 'text-text-tertiary'}`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="m-0 text-[14.5px] font-semibold text-text">
                {liveId ? 'Your site is live' : 'Not published yet'}
              </p>

              <Badge tone={liveId ? 'success' : 'neutral'} dot={liveId}>
                {liveId ? 'Live' : 'Offline'}
              </Badge>
            </div>

            <p className="m-0 mt-1 text-[12.5px] text-text-secondary">
              {liveId && liveDeployment
                ? `Serving the version from ${formatDate(liveDeployment.createdAt)}.`
                : 'Upload a version to publish this site.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-card border border-border bg-surface px-5 py-4 shadow-card sm:flex-col sm:items-start sm:justify-center">
          <p className="m-0 font-mono text-[10px] uppercase tracking-[0.1em] text-text-tertiary">
            Versions kept
          </p>
          <p className="m-0 text-[22px] font-semibold leading-none tabular-nums text-text">
            {list.length}
            <span className="ml-2 text-[12px] font-normal text-text-tertiary">
              {successCount} published
            </span>
          </p>
        </div>
      </section>

      {/* Versions */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
          <div>
            <h2 className="m-0 text-[16px] font-semibold tracking-[-0.015em] text-text">
              Versions
            </h2>
            <p className="m-0 mt-1 text-[12.5px] text-text-secondary">
              Make any earlier successful version live again without re-uploading.
            </p>
          </div>

          <Button as={Link} to="/deployments/new" variant="secondary" size="xs">
            New site
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {(retry.isError || rollback.isError) && (
            <Alert tone="error">
              {actionError?.response?.data?.message || 'That action failed. Try again.'}
            </Alert>
          )}

          {deployments.isPending ? (
            [1, 2].map((item) => (
              <Skeleton key={item} className="h-[72px] rounded-card" />
            ))
          ) : list.length === 0 ? (
            <div className="rounded-card border border-dashed border-border bg-surface px-6 py-8 text-center text-[13px] text-text-secondary">
              No versions yet.
            </div>
          ) : (
            list.map((d) => {
              const isLive = d.status === 'success' && String(d.id) === liveId;
              const status = deploymentStatus(d.status);

              return (
                <div
                  key={d.id}
                  className={`flex flex-col gap-3 rounded-card border bg-surface px-4 py-3.5 shadow-card transition-colors sm:flex-row sm:items-center sm:justify-between ${isLive ? 'border-brand-light' : 'border-border'}`}
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isLive ? 'bg-brand-soft' : 'bg-surface-tertiary'}`}
                    >
                      <FaClockRotateLeft
                        aria-hidden="true"
                        className={`text-[13px] ${isLive ? 'text-brand-strong' : 'text-text-secondary'}`}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={status.tone} dot={status.dot}>
                          {status.label}
                        </Badge>

                        {isLive && (
                          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-strong">
                            current
                          </span>
                        )}
                      </div>

                      <p className="m-0 mt-1.5 font-mono text-[11.5px] text-text-tertiary">
                        {d.fileCount} file(s) · {formatDate(d.createdAt)}
                      </p>

                      {d.errorMessage && (
                        <p className="m-0 mt-1 text-[12px] text-error">{d.errorMessage}</p>
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
                        onClick={() => setRollbackTarget(d)}
                        disabled={rollback.isPending}
                      >
                        Make live
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Danger zone */}
      <section className="mt-12 rounded-card border border-error/25 bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
          <div className="min-w-0">
            <h2 className="m-0 text-[14.5px] font-semibold text-error">Delete site</h2>
            <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-text-secondary">
              Removes {siteHost(site.slug)} and every version. This cannot be undone.
            </p>
          </div>

          <Button
            variant="destructive-outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            disabled={remove.isPending}
            className="w-full shrink-0 xs:w-auto"
          >
            <FaTrashCan aria-hidden="true" className="text-[12px]" />
            {remove.isPending ? 'Deleting…' : 'Delete site'}
          </Button>
        </div>

        {remove.isError && (
          <div className="mt-4">
            <Alert tone="error">
              {remove.error?.response?.data?.message || 'Could not delete this site.'}
            </Alert>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this site?"
        message={`${siteHost(site.slug)} and all of its versions will be removed. This cannot be undone.`}
        confirmLabel="Delete site"
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
        onCancel={() => setDeleteOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(rollbackTarget)}
        title="Make this version live?"
        message="Visitors will be served this version immediately. The current live version stays available so you can switch back."
        confirmLabel="Make live"
        cancelLabel="Cancel"
        loading={rollback.isPending}
        onConfirm={() => rollback.mutate(rollbackTarget.id)}
        onCancel={() => setRollbackTarget(null)}
      />
    </div>
  );
}
