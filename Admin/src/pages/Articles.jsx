import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { articlesApi, topicsApi } from '../api/index.js';
import { useToast } from '../context/toastContext.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { IconButton } from '../components/ui/IconButton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { StatusBadge } from '../components/ui/Badge.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { formatNumber, relativeTime } from '../utils/format.js';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Drafts' },
  { key: 'archived', label: 'Archived' },
];

export default function Articles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [deleting, setDeleting] = useState(null);

  const status = STATUS_TABS.some((tab) => tab.key === searchParams.get('status'))
    ? searchParams.get('status')
    : 'all';
  const topic = searchParams.get('topic') || '';
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === '1') next.delete(key);
    else next.set(key, String(value));
    if (key !== 'page') next.delete('page');
    setSearchParams(next, { replace: true });
  }

  const articleQuery = useQuery({
    queryKey: ['admin', 'articles', { status, topic, page, search: debouncedSearch }],
    queryFn: () =>
      articlesApi.listArticlesApi({ status, topic, page, search: debouncedSearch, limit: 10 }),
    placeholderData: (previous) => previous,
  });

  const topicsQuery = useQuery({
    queryKey: ['admin', 'topics'],
    queryFn: () => topicsApi.listTopicsApi(),
  });

  const topics = useMemo(() => topicsQuery.data?.topics ?? [], [topicsQuery.data]);
  const articles = articleQuery.data?.articles ?? [];
  const counts = articleQuery.data?.counts ?? { all: 0, draft: 0, published: 0, archived: 0 };
  const pagination = articleQuery.data?.pagination;

  const topicPaths = useMemo(() => {
    const map = new Map(topics.map((item) => [item.id, item.path]));
    return map;
  }, [topics]);

  const deleteMutation = useMutation({
    mutationFn: (id) => articlesApi.deleteArticleApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast({ title: 'Article deleted', description: 'The article was removed from the library.' });
      setDeleting(null);
    },
  });

  function resetFilters() {
    setSearch('');
    setSearchParams({}, { replace: true });
  }

  function openDelete(article) {
    deleteMutation.reset();
    setDeleting(article);
  }

  function closeDelete() {
    if (deleteMutation.isPending) return;
    deleteMutation.reset();
    setDeleting(null);
  }

  const filtersActive = Boolean(search || topic || status !== 'all');
  const start = pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const end = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <div className="animate-rise">
      <PageHeader
        title="Articles"
        description="Write, review and publish articles. Every article must belong to a topic."
        actions={
          <Button as={Link} to="/articles/new" size="sm">
            <i aria-hidden="true" className="bx bx-edit-alt text-[16px]" />
            Write article
          </Button>
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-1 overflow-x-auto rounded-panel bg-surface p-1.5 shadow-card">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.key;
          const count = counts[tab.key] ?? 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setParam('status', tab.key)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-button px-3.5 py-2.5 text-[12.5px] font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft ${
                active
                  ? 'bg-brand-soft text-brand'
                  : 'text-text-secondary hover:bg-surface-secondary hover:text-text'
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                  active ? 'bg-brand/10 text-brand' : 'bg-surface-tertiary text-text-tertiary'
                }`}
              >
                {formatNumber(count)}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border-secondary p-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="relative w-full sm:max-w-xs">
            <i
              aria-hidden="true"
              className="bx bx-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-text-tertiary"
            />
            <label htmlFor="article-search" className="sr-only">
              Search articles
            </label>
            <input
              id="article-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, tag or slug…"
              className="h-10 w-full rounded-field border border-border bg-surface pl-9 pr-9 text-[12.5px] text-text placeholder:text-text-tertiary outline-none transition-shadow focus:border-border-focus focus:ring-4 focus:ring-brand-soft"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear article search"
                className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-button text-text-tertiary transition hover:bg-surface-secondary hover:text-text"
              >
                <i aria-hidden="true" className="bx bx-x text-[17px]" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:w-52 sm:flex-none">
              <i
                aria-hidden="true"
                className="bx bx-layer pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-text-tertiary"
              />
              <label htmlFor="article-topic" className="sr-only">
                Filter by topic
              </label>
              <select
                id="article-topic"
                value={topic}
                onChange={(event) => setParam('topic', event.target.value)}
                className="h-10 w-full appearance-none rounded-field border border-border bg-surface pl-8 pr-8 text-[12px] font-medium text-text-secondary outline-none transition-shadow focus:border-border-focus focus:ring-4 focus:ring-brand-soft"
              >
                <option value="">All topics</option>
                {topics.map((item) => (
                  <option key={item.id} value={item.id}>
                    {'— '.repeat(item.depth)}
                    {item.name}
                  </option>
                ))}
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
                className="inline-flex h-10 items-center gap-1.5 rounded-field px-2.5 text-[11.5px] font-semibold text-text-secondary transition hover:bg-surface-secondary hover:text-text"
              >
                <i aria-hidden="true" className="bx bx-reset text-[16px]" />
                Reset
              </button>
            )}

            <IconButton
              label="Refresh articles"
              size="md"
              variant="plain"
              onClick={() => articleQuery.refetch()}
              disabled={articleQuery.isFetching}
            >
              <i
                aria-hidden="true"
                className={`bx bx-refresh text-[18px] ${
                  articleQuery.isFetching ? 'animate-admin-spin' : ''
                }`}
              />
            </IconButton>
          </div>
        </div>

        {articleQuery.isError ? (
          <div className="p-5">
            <Alert tone="error" title="Articles could not load">
              <p className="m-0">{articleQuery.error.message}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => articleQuery.refetch()}
              >
                Try again
              </Button>
            </Alert>
          </div>
        ) : articleQuery.isLoading ? (
          <div className="divide-y divide-border-secondary/70">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex animate-pulse items-center gap-4 px-4 py-4">
                <div className="flex-1">
                  <div className="h-3 w-48 rounded bg-surface-tertiary" />
                  <div className="mt-2 h-2.5 w-64 max-w-full rounded bg-surface-tertiary/60" />
                </div>
                <div className="hidden h-5 w-24 rounded-full bg-surface-tertiary/60 sm:block" />
                <div className="h-5 w-16 rounded-full bg-surface-tertiary/60" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <EmptyState
            icon={filtersActive ? 'bx-search-alt' : 'bx-file-blank'}
            title={filtersActive ? 'No articles match these filters' : 'No articles yet'}
            description={
              filtersActive
                ? 'Try a different search term, status or topic.'
                : 'Write the first article and assign it to one of your topics.'
            }
            action={
              filtersActive ? (
                <Button variant="secondary" size="sm" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button as={Link} to="/articles/new" size="sm">
                  <i aria-hidden="true" className="bx bx-edit-alt text-[16px]" />
                  Write first article
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border-secondary bg-surface-secondary/50">
                  <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                    Article
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                    Topic
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                    Status
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                    Views
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                    Updated
                  </th>
                  <th className="px-3 py-2.5 pr-4 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr
                    key={article.id}
                    className="group border-b border-border-secondary/70 transition last:border-0 hover:bg-surface-secondary/40"
                  >
                    <td className="max-w-[340px] px-4 py-3.5">
                      <Link
                        to={`/articles/${article.id}/edit`}
                        className="block truncate text-[13px] font-semibold text-text transition group-hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
                      >
                        {article.title}
                      </Link>
                      <p className="m-0 mt-0.5 truncate text-[11px] text-text-tertiary">
                        {article.subtitle || `/${article.slug}`}
                      </p>
                    </td>
                    <td className="max-w-[200px] px-3 py-3.5">
                      {article.topics.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {article.topics.map((item) => (
                            <span
                              key={item.id}
                              className="max-w-full truncate rounded-full bg-surface-secondary px-2.5 py-1 text-[10.5px] font-medium text-text-secondary"
                              title={topicPaths.get(item.id) || item.name}
                            >
                              {item.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11.5px] text-text-tertiary">No topic</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={article.status} />
                    </td>
                    <td className="px-3 py-3.5 text-[11.5px] text-text-secondary">
                      {formatNumber(article.stats.views)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-[11px] text-text-tertiary">
                      {relativeTime(article.updatedAt)}
                    </td>
                    <td className="px-3 py-3.5 pr-4">
                      <div className="flex items-center justify-end gap-0.5">
                        <IconButton
                          as={Link}
                          to={`/articles/${article.id}/edit`}
                          label={`Edit ${article.title}`}
                          size="sm"
                          variant="plain"
                        >
                          <i aria-hidden="true" className="bx bx-edit-alt" />
                        </IconButton>
                        <IconButton
                          label={`Delete ${article.title}`}
                          size="sm"
                          variant="danger"
                          onClick={() => openDelete(article)}
                        >
                          <i aria-hidden="true" className="bx bx-trash" />
                        </IconButton>
                      </div>
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
              <span className="font-semibold text-text-secondary">{pagination.total}</span> article
              {pagination.total === 1 ? '' : 's'}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setParam('page', pagination.page - 1)}
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
                onClick={() => setParam('page', pagination.page + 1)}
              >
                Next
                <i aria-hidden="true" className="bx bx-chevron-right text-[17px]" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={closeDelete}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title={deleting ? `Delete “${deleting.title}”?` : 'Delete article?'}
        description="This permanently removes the article and its rich-text content. This action cannot be undone."
        confirmLabel="Delete article"
        busy={deleteMutation.isPending}
        error={deleteMutation.error?.message || ''}
      />
    </div>
  );
}
