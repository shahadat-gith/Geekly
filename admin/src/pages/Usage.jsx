import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { aiApi } from '../api/index.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { IconButton } from '../components/ui/IconButton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { StatCard } from '../components/dashboard/StatCard.jsx';
import { AiModelModal } from '../components/ai/AiModelModal.jsx';
import { UsageChart } from '../components/usage/UsageChart.jsx';
import { FeatureBreakdown, ModelBreakdown } from '../components/usage/UsageBreakdown.jsx';
import { formatDateTime, formatNumber, relativeTime } from '../utils/format.js';
import { featureLabel, formatCost, formatDuration } from '../utils/aiUsage.js';

const EMPTY_TOTALS = {
  requests: 0,
  errors: 0,
  successRate: 100,
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
  cost: 0,
  avgDurationMs: 0,
};

function UsageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-52 rounded-lg bg-surface-tertiary" />
      <div className="mt-2 h-4 w-96 max-w-full rounded bg-surface-tertiary/70" />
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-panel bg-border-secondary sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-[132px] bg-surface p-5">
            <div className="h-3 w-20 rounded bg-surface-tertiary" />
            <div className="mt-5 h-7 w-24 rounded bg-surface-tertiary" />
            <div className="mt-4 h-3 w-28 rounded bg-surface-tertiary/70" />
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <div className="h-[320px] rounded-panel bg-surface p-6 shadow-card lg:col-span-8" />
        <div className="h-[320px] rounded-panel bg-surface p-6 shadow-card lg:col-span-4" />
      </div>
    </div>
  );
}

function RequestStatus({ status }) {
  return status === 'error' ? (
    <Badge tone="danger" dot>
      Error
    </Badge>
  ) : (
    <Badge tone="success" dot>
      Success
    </Badge>
  );
}

export default function Usage() {
  const [page, setPage] = useState(1);
  const [feature, setFeature] = useState('');
  const [status, setStatus] = useState('');
  const [modelModalOpen, setModelModalOpen] = useState(false);

  const usageQuery = useQuery({
    queryKey: ['admin', 'ai', 'usage', { page, feature, status }],
    queryFn: () =>
      aiApi.getAiUsageApi({
        page,
        feature: feature || undefined,
        status: status || undefined,
        limit: 15,
      }),
    placeholderData: (previous) => previous,
  });

  const data = usageQuery.data;
  const totals = data?.totals ?? EMPTY_TOTALS;
  const records = data?.records ?? [];
  const pagination = data?.pagination;
  const daily = data?.daily ?? [];
  const byFeature = data?.byFeature ?? [];
  const byModel = data?.byModel ?? [];
  const features = data?.features ?? [];

  const filtersActive = Boolean(feature || status);
  const start = pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const end = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function resetFilters() {
    setFeature('');
    setStatus('');
    setPage(1);
  }

  if (usageQuery.isLoading) return <UsageSkeleton />;

  return (
    <div className="animate-rise">
      <PageHeader
        title="AI usage"
        description="Every article and image generation, with tokens, cost and failures."
        actions={
          <>
            <Button type="button" size="sm" onClick={() => setModelModalOpen(true)}>
              <i aria-hidden="true" className="bx bx-plus text-[16px]" />
              Add a new model
            </Button>
            <IconButton
              label="Refresh AI usage"
              variant="default"
              onClick={() => usageQuery.refetch()}
              disabled={usageQuery.isFetching}
              className="border border-border bg-surface"
            >
              <i
                aria-hidden="true"
                className={`bx bx-refresh text-[19px] ${usageQuery.isFetching ? 'animate-admin-spin' : ''}`}
              />
            </IconButton>
            <Button as={Link} to="/images" variant="secondary" size="sm">
              <i aria-hidden="true" className="bx bx-image-alt text-[16px]" />
              Image studio
            </Button>
          </>
        }
      />

      {usageQuery.isError && (
        <Alert tone="error" title="AI usage could not load" className="mt-5">
          <p className="m-0">{usageQuery.error.message}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => usageQuery.refetch()}>
            Try again
          </Button>
        </Alert>
      )}

      <Card className="mt-5 overflow-hidden">
        <div className="grid grid-cols-2 gap-px bg-border-secondary sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Requests"
            value={totals.requests}
            icon="bx-pulse"
            note={`${byFeature.length} feature${byFeature.length === 1 ? '' : 's'} used`}
          />
          <StatCard
            label="Success rate"
            value={`${totals.successRate}%`}
            icon="bx-check-shield"
            note={`${formatNumber(totals.errors)} failed`}
          />
          <StatCard
            label="Tokens"
            value={totals.totalTokens}
            icon="bx-code-alt"
            note={`${formatNumber(totals.promptTokens)} in · ${formatNumber(totals.completionTokens)} out`}
          />
          <StatCard
            label="Total cost"
            value={formatCost(totals.cost)}
            icon="bx-dollar-circle"
            note="Billed by OpenRouter"
          />
          <StatCard
            label="Avg response"
            value={formatDuration(totals.avgDurationMs)}
            icon="bx-timer"
            note="Per request"
            className="col-span-2 sm:col-span-2 lg:col-span-1"
          />
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <UsageChart daily={daily} />
        </div>
        <div className="lg:col-span-4">
          <FeatureBreakdown features={byFeature} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ModelBreakdown models={byModel} />
        </div>

        <Card className="overflow-hidden lg:col-span-8">
          <div className="flex flex-col gap-3 border-b border-border-secondary p-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div>
              <h2 className="m-0 text-[13.5px] font-semibold text-text">All requests</h2>
              <p className="m-0 mt-0.5 text-[11px] text-text-tertiary">
                {formatNumber(totals.requests)} recorded in total
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 flex-1 sm:w-44 sm:flex-none">
                <label htmlFor="usage-feature" className="sr-only">
                  Filter by feature
                </label>
                <select
                  id="usage-feature"
                  value={feature}
                  onChange={(event) => changeFilter(setFeature, event.target.value)}
                  className="h-9 w-full appearance-none rounded-field border border-border bg-surface pl-3 pr-8 text-[11.5px] font-medium text-text-secondary outline-none transition-shadow focus:border-border-focus focus:ring-4 focus:ring-brand-soft"
                >
                  <option value="">All features</option>
                  {features.map((item) => (
                    <option key={item} value={item}>
                      {featureLabel(item)}
                    </option>
                  ))}
                </select>
                <i
                  aria-hidden="true"
                  className="bx bx-chevron-down pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-text-tertiary"
                />
              </div>

              <div className="relative min-w-0 flex-1 sm:w-36 sm:flex-none">
                <label htmlFor="usage-status" className="sr-only">
                  Filter by status
                </label>
                <select
                  id="usage-status"
                  value={status}
                  onChange={(event) => changeFilter(setStatus, event.target.value)}
                  className="h-9 w-full appearance-none rounded-field border border-border bg-surface pl-3 pr-8 text-[11.5px] font-medium text-text-secondary outline-none transition-shadow focus:border-border-focus focus:ring-4 focus:ring-brand-soft"
                >
                  <option value="">All statuses</option>
                  <option value="success">Success</option>
                  <option value="error">Errors</option>
                </select>
                <i
                  aria-hidden="true"
                  className="bx bx-chevron-down pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-text-tertiary"
                />
              </div>

              {filtersActive && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-9 items-center gap-1.5 rounded-field px-2.5 text-[11px] font-semibold text-text-secondary transition hover:bg-surface-secondary hover:text-text"
                >
                  <i aria-hidden="true" className="bx bx-reset text-[15px]" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {records.length === 0 ? (
            <EmptyState
              icon={filtersActive ? 'bx-search-alt' : 'bx-pulse'}
              title={filtersActive ? 'No requests match these filters' : 'No AI usage recorded yet'}
              description={
                filtersActive
                  ? 'Try a different feature or status.'
                  : 'Generate an article or an image and its tokens, cost and duration will appear here.'
              }
              action={
                filtersActive ? (
                  <Button variant="secondary" size="sm" onClick={resetFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button as={Link} to="/articles/new" size="sm">
                    <i aria-hidden="true" className="bx bx-magic-wand text-[16px]" />
                    Write an article
                  </Button>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-secondary bg-surface-secondary/50">
                    <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                      When
                    </th>
                    <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                      Feature
                    </th>
                    <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                      Model
                    </th>
                    <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                      Status
                    </th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                      Tokens
                    </th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                      Cost
                    </th>
                    <th className="px-3 py-2.5 pr-4 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-border-secondary/70 transition last:border-0 hover:bg-surface-secondary/40"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-[11.5px] text-text-tertiary">
                        <span title={formatDateTime(entry.createdAt)}>
                          {relativeTime(entry.createdAt)}
                        </span>
                      </td>
                      <td className="max-w-[190px] px-3 py-3">
                        <p className="m-0 truncate text-[12px] font-semibold text-text">
                          {featureLabel(entry.feature)}
                        </p>
                        {entry.status === 'error' && entry.error && (
                          <p
                            className="m-0 mt-0.5 truncate text-[10px] text-error"
                            title={entry.error}
                          >
                            {entry.error}
                          </p>
                        )}
                      </td>
                      <td className="max-w-[180px] px-3 py-3">
                        <p
                          className="m-0 truncate font-mono text-[10.5px] text-text-secondary"
                          title={entry.model}
                        >
                          {entry.model}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <RequestStatus status={entry.status} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right text-[11.5px] text-text-secondary">
                        {entry.totalTokens > 0 ? formatNumber(entry.totalTokens) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right text-[11.5px] text-text-secondary">
                        {formatCost(entry.cost)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 pr-4 text-right text-[11px] text-text-tertiary">
                        {formatDuration(entry.durationMs)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.total > 0 && (
            <div className="flex flex-col gap-3 border-t border-border-secondary px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="m-0 text-[11px] text-text-tertiary">
                Showing <span className="font-semibold text-text-secondary">{start}</span>–
                <span className="font-semibold text-text-secondary">{end}</span> of{' '}
                <span className="font-semibold text-text-secondary">{pagination.total}</span> request
                {pagination.total === 1 ? '' : 's'}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage(pagination.page - 1)}
                >
                  <i aria-hidden="true" className="bx bx-chevron-left text-[17px]" />
                  Previous
                </Button>
                <span className="text-[11px] font-medium text-text-tertiary">
                  {pagination.page} / {pagination.pages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPage(pagination.page + 1)}
                >
                  Next
                  <i aria-hidden="true" className="bx bx-chevron-right text-[17px]" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <AiModelModal
        open={modelModalOpen}
        onClose={() => setModelModalOpen(false)}
        onSaved={() => usageQuery.refetch()}
      />
    </div>
  );
}
