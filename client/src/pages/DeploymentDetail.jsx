import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowUpRightFromSquare, FaTrashCan } from 'react-icons/fa6';
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
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="mt-6 h-8 w-56" />
        <Skeleton className="mt-10 h-24 rounded-sm" />
        <div className="mt-10 space-y-0">
          {[0, 1, 2].map((item) => (
            <div key={item} className="border-b border-border-secondary py-5">
              <Skeleton className="h-9 rounded-sm" />
            </div>
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
      <nav aria-label="Breadcrumb" className="mb-6 flex min-w-0 items-center gap-2 text-[12px]">
        <Link to="/deployments" className="shrink-0 rounded-sm text-text-secondary transition-colors hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">My sites</Link>
        <span aria-hidden="true" className="shrink-0 text-text-disabled">/</span>
        <span aria-current="page" className="truncate font-medium text-text">{site.name}</span>
      </nav>

      <PageHeader
        eyebrow="Sites"
        title={site.name}
        description={
          <span className="font-mono text-[13px] text-text-tertiary">
            {siteHost(site.slug)}
          </span>
        }
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
      <section className="mt-10 border-y border-border">
        <div className="grid sm:grid-cols-[minmax(0,1fr)_168px]">
          <div className="py-5 sm:pr-8">
            <p className="m-0 flex items-center gap-2.5 text-[15px] font-medium text-text">
              {liveId && (
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
              )}
              {liveId ? 'Your site is live' : 'Not published yet'}
            </p>

            <p className="m-0 mt-2 text-[12.5px] leading-[1.7] text-text-secondary">
              {liveId && liveDeployment
                ? `Serving the version from ${formatDate(liveDeployment.createdAt)}`
                : 'Upload a version to publish this site'}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border py-4 sm:flex-col sm:items-start sm:justify-center sm:border-l sm:border-border sm:border-t-0 sm:pl-8">
            <p className="folio m-0">Versions kept</p>
            <p className="m-0 font-heading text-[28px] font-medium leading-none tabular-nums text-text">
              {list.length}
              <span className="ml-2 font-sans text-[11.5px] font-normal text-text-tertiary">
                {successCount} published
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Versions */}
      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
          <div>
            <h2 className="m-0 font-heading text-[20px] font-medium tracking-[-0.015em] text-text">
              Versions
            </h2>
            <p className="m-0 mt-1 text-[12.5px] text-text-secondary">
              Make any earlier successful version live again without re-uploading
            </p>
          </div>

          <Button as={Link} to="/deployments/new" variant="secondary" size="sm">
            New site
          </Button>
        </div>

        <div className="flex flex-col">
          {(retry.isError || rollback.isError) && (
            <div className="border-b border-border-secondary py-4">
              <Alert tone="error">
                {actionError?.response?.data?.message || 'That action failed. Try again.'}
              </Alert>
            </div>
          )}

          {deployments.isPending ? (
            [1, 2].map((item) => (
              <div key={item} className="border-b border-border-secondary py-5">
                <Skeleton className="h-8 rounded-sm" />
              </div>
            ))
          ) : list.length === 0 ? (
            <div className="border-b border-border py-8 text-[13px] text-text-secondary">
              No versions yet
            </div>
          ) : (
            list.map((d, index) => {
              const isLive = d.status === 'success' && String(d.id) === liveId;
              const status = deploymentStatus(d.status);

              return (
                <div
                  key={d.id}
                  className={[
                    'grid min-w-0 gap-3 border-b border-l-2 border-border-secondary py-4 pl-3 sm:grid-cols-[28px_minmax(0,1fr)_auto] sm:items-center sm:gap-5',
                    isLive
                      ? 'border-l-brand bg-surface'
                      : 'border-l-transparent',
                  ].join(' ')}
                >
                  <span className="hidden font-mono text-[10px] tabular-nums text-text-tertiary sm:block">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <p className="m-0 text-[14px] font-medium text-text">
                        {formatDate(d.createdAt)}
                      </p>

                      <Badge tone={status.tone} dot={status.dot}>
                        {d.status === 'success' && !isLive ? 'Published' : status.label}
                      </Badge>

                      {isLive && (
                        <span className="font-mono text-[10px] text-brand-strong">
                          Current
                        </span>
                      )}
                    </div>

                    <p className="m-0 mt-1 font-mono text-[11px] text-text-tertiary">
                      {d.fileCount} file{d.fileCount === 1 ? '' : 's'}
                    </p>

                    {d.errorMessage && (
                      <p className="m-0 mt-1 text-[12px] text-error">{d.errorMessage}</p>
                    )}
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

      {/* Delete */}
      <section className="mt-12 border-t border-border pt-6">
        <div className="flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
          <div className="min-w-0">
            <h2 className="m-0 font-heading text-[16px] font-medium text-text">
              Delete site
            </h2>
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
