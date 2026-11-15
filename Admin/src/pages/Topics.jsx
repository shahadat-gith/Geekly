import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { topicsApi } from '../api/index.js';
import { useToast } from '../context/toastContext.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { IconButton } from '../components/ui/IconButton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Alert } from '../components/ui/Alert.jsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx';
import { TopicModal } from '../components/topics/TopicModal.jsx';

function TopicRow({
  node,
  level,
  collapsed,
  onToggle,
  onAddChild,
  onEdit,
  onDelete,
}) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isOpen = !collapsed.has(node.id);

  return (
    <>
      <div
        className="group flex items-start gap-2 border-b border-border-secondary/70 px-3 py-3.5 transition last:border-b-0 hover:bg-surface-secondary/45 sm:px-4"
        style={{ paddingLeft: `${12 + level * 22}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${node.name}`}
            aria-expanded={isOpen}
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-button text-text-tertiary transition hover:bg-surface-tertiary hover:text-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
          >
            <i
              aria-hidden="true"
              className={`bx bx-chevron-down text-[17px] transition-transform ${
                isOpen ? '' : '-rotate-90'
              }`}
            />
          </button>
        ) : (
          <span className="h-6 w-6 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="m-0 max-w-full truncate text-[13px] font-semibold text-text">{node.name}</p>
            {hasChildren && (
              <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[9.5px] font-semibold text-text-secondary">
                {node.children.length} sub-topic{node.children.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <p className="m-0 mt-0.5 truncate text-[11px] text-text-tertiary">
            {node.description || `/${node.slug}`}
          </p>
        </div>

        <div className="mt-1 hidden shrink-0 items-center gap-1.5 sm:flex">
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-secondary px-2.5 py-1 text-[10.5px] font-medium text-text-secondary"
            title={`${node.articleCount} direct article${node.articleCount === 1 ? '' : 's'}`}
          >
            <i aria-hidden="true" className="bx bx-file-blank text-[13px] text-text-tertiary" />
            {node.articleCount}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
          <IconButton
            label={`Add sub-topic under ${node.name}`}
            size="sm"
            variant="plain"
            onClick={() => onAddChild(node)}
          >
            <i aria-hidden="true" className="bx bx-plus" />
          </IconButton>
          <IconButton
            label={`Edit ${node.name}`}
            size="sm"
            variant="plain"
            onClick={() => onEdit(node)}
          >
            <i aria-hidden="true" className="bx bx-edit-alt" />
          </IconButton>
          <IconButton
            label={`Delete ${node.name}`}
            size="sm"
            variant="danger"
            onClick={() => onDelete(node)}
          >
            <i aria-hidden="true" className="bx bx-trash" />
          </IconButton>
        </div>
      </div>

      {hasChildren && isOpen &&
        node.children.map((child) => (
          <TopicRow
            key={child.id}
            node={child}
            level={level + 1}
            collapsed={collapsed}
            onToggle={onToggle}
            onAddChild={onAddChild}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </>
  );
}

function SearchResultRow({ topic, onEdit, onDelete }) {
  return (
    <div className="group flex items-center gap-3 border-b border-border-secondary/70 px-4 py-3.5 last:border-b-0 hover:bg-surface-secondary/45">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="m-0 truncate text-[13px] font-semibold text-text">{topic.name}</p>
        </div>
        <p className="m-0 mt-0.5 truncate text-[11px] text-text-tertiary">{topic.path}</p>
      </div>
      <span className="hidden shrink-0 text-[11px] text-text-tertiary sm:block">
        {topic.articleCount} article{topic.articleCount === 1 ? '' : 's'}
      </span>
      <div className="flex shrink-0 items-center gap-0.5">
        <IconButton label={`Edit ${topic.name}`} size="sm" variant="plain" onClick={() => onEdit(topic)}>
          <i aria-hidden="true" className="bx bx-edit-alt" />
        </IconButton>
        <IconButton
          label={`Delete ${topic.name}`}
          size="sm"
          variant="danger"
          onClick={() => onDelete(topic)}
        >
          <i aria-hidden="true" className="bx bx-trash" />
        </IconButton>
      </div>
    </div>
  );
}

export default function Topics() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState(() => new Set());
  const [modal, setModal] = useState({ open: false, topic: null, parentId: '' });
  const [deleting, setDeleting] = useState(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'topics'],
    queryFn: () => topicsApi.listTopicsApi(),
  });

  const topics = useMemo(() => data?.topics ?? [], [data]);
  const tree = useMemo(() => data?.tree ?? [], [data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return topics.filter((topic) =>
      [topic.name, topic.slug, topic.description, topic.path]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [topics, search]);

  const deleteMutation = useMutation({
    mutationFn: (id) => topicsApi.deleteTopicApi(id),
    onSuccess: (_, id) => {
      const removed = topics.find((topic) => topic.id === id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast({
        title: 'Topic deleted',
        description: removed ? `“${removed.name}” was removed.` : 'The topic was removed.',
      });
      setDeleting(null);
    },
  });

  const topLevelCount = topics.filter((topic) => !topic.parent).length;
  const subTopicCount = topics.length - topLevelCount;

  function toggle(id) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openAdd(parent = null) {
    if (parent) {
      setCollapsed((current) => {
        const next = new Set(current);
        next.delete(parent.id);
        return next;
      });
    }
    setModal({ open: true, topic: null, parentId: parent?.id ?? '' });
  }

  function openEdit(topic) {
    setModal({ open: true, topic, parentId: '' });
  }

  function closeModal() {
    setModal({ open: false, topic: null, parentId: '' });
  }

  function openDelete(topic) {
    deleteMutation.reset();
    setDeleting(topic);
  }

  function closeDelete() {
    if (deleteMutation.isPending) return;
    deleteMutation.reset();
    setDeleting(null);
  }

  function expandAll() {
    setCollapsed(new Set());
  }

  function collapseAll() {
    const ids = [];
    const walk = (nodes) => {
      for (const node of nodes) {
        if (node.children?.length) {
          ids.push(node.id);
          walk(node.children);
        }
      }
    };
    walk(tree);
    setCollapsed(new Set(ids));
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Topics"
        description="Organise the library into subjects and the sub-topics beneath them."
        actions={
          <Button size="sm" onClick={() => openAdd(null)}>
            <i aria-hidden="true" className="bx bx-plus text-[16px]" />
            New topic
          </Button>
        }
      />

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-text-tertiary">
        <span>
          <span className="font-semibold text-text-secondary">{topLevelCount}</span> top-level subject
          {topLevelCount === 1 ? '' : 's'}
        </span>
        <span className="h-3 w-px bg-border" />
        <span>
          <span className="font-semibold text-text-secondary">{subTopicCount}</span> sub-topic
          {subTopicCount === 1 ? '' : 's'}
        </span>
      </div>

      {isError && (
        <Alert tone="error" title="Topics could not load" className="mt-5">
          <p className="m-0">{error.message}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => refetch()}>
            <i aria-hidden="true" className="bx bx-refresh text-[16px]" />
            Try again
          </Button>
        </Alert>
      )}

      <Card className="mt-5 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border-secondary p-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="relative w-full sm:max-w-xs">
            <i
              aria-hidden="true"
              className="bx bx-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-text-tertiary"
            />
            <label htmlFor="topic-search" className="sr-only">
              Search topics
            </label>
            <input
              id="topic-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search topics…"
              className="h-10 w-full rounded-field border border-border bg-surface pl-9 pr-9 text-[12.5px] text-text placeholder:text-text-tertiary outline-none transition-shadow focus:border-border-focus focus:ring-4 focus:ring-brand-soft"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear topic search"
                className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-button text-text-tertiary transition hover:bg-surface-secondary hover:text-text"
              >
                <i aria-hidden="true" className="bx bx-x text-[17px]" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <span className="text-[11px] text-text-tertiary">
              {search ? `${filtered.length} result${filtered.length === 1 ? '' : 's'}` : `${topics.length} topics`}
            </span>
            <div className="flex items-center gap-0.5">
              <IconButton label="Refresh topics" size="sm" variant="plain" onClick={() => refetch()} disabled={isFetching}>
                <i
                  aria-hidden="true"
                  className={`bx bx-refresh text-[17px] ${isFetching ? 'animate-admin-spin' : ''}`}
                />
              </IconButton>
              <IconButton label="Expand all topics" size="sm" variant="plain" onClick={expandAll}>
                <i aria-hidden="true" className="bx bx-expand-alt text-[17px]" />
              </IconButton>
              <IconButton label="Collapse all topics" size="sm" variant="plain" onClick={collapseAll}>
                <i aria-hidden="true" className="bx bx-collapse-alt text-[17px]" />
              </IconButton>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse items-center gap-3 border-b border-border-secondary/70 px-4 py-4 last:border-0"
              >
                <div className="flex-1">
                  <div className="h-3 w-36 rounded bg-surface-tertiary" />
                  <div className="mt-2 h-2.5 w-52 rounded bg-surface-tertiary/60" />
                </div>
                <div className="h-5 w-14 rounded-full bg-surface-tertiary/60" />
              </div>
            ))}
          </div>
        ) : topics.length === 0 ? (
          <EmptyState
            icon="bx-layer-plus"
            title="Start the topic tree"
            description="Create a top-level subject like System Design, then add sub-topics beneath it."
            action={
              <Button size="sm" onClick={() => openAdd(null)}>
                <i aria-hidden="true" className="bx bx-plus text-[16px]" />
                Create first topic
              </Button>
            }
          />
        ) : search ? (
          filtered.length === 0 ? (
            <EmptyState
              compact
              icon="bx-search-alt"
              title="No matching topics"
              description="Try a different name, slug or description."
              action={
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-[11.5px] font-semibold text-brand hover:text-brand-hover"
                >
                  Clear search
                </button>
              }
            />
          ) : (
            filtered.map((topic) => (
              <SearchResultRow
                key={topic.id}
                topic={topic}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            ))
          )
        ) : (
          tree.map((node) => (
            <TopicRow
              key={node.id}
              node={node}
              level={0}
              collapsed={collapsed}
              onToggle={toggle}
              onAddChild={openAdd}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))
        )}
      </Card>

      <p className="m-0 mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-text-tertiary">
        <i aria-hidden="true" className="bx bx-info-circle mt-px text-[13px]" />
        Topics with sub-topics or attached articles cannot be deleted. Remove or move those first.
      </p>

      {modal.open && (
        <TopicModal
          open
          onClose={closeModal}
          topic={modal.topic}
          parentId={modal.parentId}
          topics={topics}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={closeDelete}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title={deleting ? `Delete “${deleting.name}”?` : 'Delete topic?'}
        description="This permanently removes the topic. Topics with sub-topics or articles attached cannot be deleted."
        confirmLabel="Delete topic"
        busy={deleteMutation.isPending}
        error={deleteMutation.error?.message || ''}
      />
    </div>
  );
}
