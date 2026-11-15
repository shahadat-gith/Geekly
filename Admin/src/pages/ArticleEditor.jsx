import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { articlesApi, topicsApi } from '../api/index.js';
import { useToast } from '../context/toastContext.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input, Select, Textarea } from '../components/ui/Field.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { StatusBadge } from '../components/ui/Badge.jsx';
import { RichTextEditor } from '../components/editor/RichTextEditor.jsx';
import { AiGenerateModal } from '../components/editor/AiGenerateModal.jsx';
import { ArticleMediaManager } from '../components/editor/ArticleMediaManager.jsx';
import { ArticleContentPreview } from '../components/editor/ArticleContentPreview.jsx';
import { formatDateTime, readingTime } from '../utils/format.js';

const STATUS_HINTS = {
  draft: 'Saved privately. Publish when the article is ready.',
  published: 'Visible in the public library right away.',
  archived: 'Hidden from readers but kept in the admin library.',
};

function plainWordCount(html) {
  return readingTime(html).words;
}

function flattenTopicTree(nodes, result = []) {
  for (const node of nodes) {
    result.push(node);
    flattenTopicTree(node.children || [], result);
  }
  return result;
}

function EditorSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-28 rounded bg-surface-tertiary/70" />
      <div className="mt-3 h-8 w-56 rounded bg-surface-tertiary" />
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="h-[620px] rounded-panel bg-surface p-7 shadow-card">
          <div className="h-8 w-3/4 rounded bg-surface-tertiary" />
          <div className="mt-3 h-4 w-1/2 rounded bg-surface-tertiary/60" />
          <div className="mt-8 h-14 rounded-field bg-surface-tertiary/50" />
          <div className="mt-4 h-[380px] rounded-field bg-surface-tertiary/40" />
        </div>
        <div className="space-y-5">
          <div className="h-[260px] rounded-panel bg-surface p-5 shadow-card" />
          <div className="h-[220px] rounded-panel bg-surface p-5 shadow-card" />
        </div>
      </div>
    </div>
  );
}

export default function ArticleEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [status, setStatus] = useState('draft');
  const [topicId, setTopicId] = useState('');
  const [tags, setTags] = useState('');
  const [videos, setVideos] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [media, setMedia] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState('light');
  const [aiOpen, setAiOpen] = useState(false);
  const loadedId = useRef(null);

  const topicsQuery = useQuery({
    queryKey: ['admin', 'topics'],
    queryFn: () => topicsApi.listTopicsApi(),
  });

  const articleQuery = useQuery({
    queryKey: ['admin', 'article', id],
    queryFn: () => articlesApi.getArticleApi(id),
    enabled: Boolean(id),
    retry: false,
  });

  useEffect(() => {
    if (!id) {
      if (loadedId.current !== 'new') {
        loadedId.current = 'new';
        setTitle('');
        setSubtitle('');
        setStatus('draft');
        setTopicId('');
        setTags('');
        setVideos('');
        setContentHtml('');
        setMedia([]);
        setErrors({});
        setFormError('');
      }
      return;
    }

    const article = articleQuery.data;
    if (article && loadedId.current !== article.id) {
      loadedId.current = article.id;
      setTitle(article.title || '');
      setSubtitle(article.subtitle || '');
      setStatus(article.status || 'draft');
      setTopicId(article.topics?.[0]?.id || '');
      setTags((article.tags || []).join(', '));
      setVideos((article.referenceVideos || []).join('\n'));
      setContentHtml(article.content?.html || '');
      setMedia(article.content?.media || []);
      setErrors({});
      setFormError('');
    }
  }, [id, articleQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isNew ? articlesApi.createArticleApi(payload) : articlesApi.updateArticleApi(id, payload),
    onSuccess: (article) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      queryClient.setQueryData(['admin', 'article', article.id], article);

      const message =
        article.status === 'published'
          ? article.publishedAt
            ? 'Article is published and ready to read.'
            : 'Article saved.'
          : article.status === 'archived'
            ? 'Article archived.'
            : 'Draft saved.';

      toast({
        title: isNew ? 'Article created' : 'Article updated',
        description: message,
      });

      if (isNew) {
        navigate(`/articles/${article.id}/edit`, { replace: true });
      } else {
        setStatus(article.status);
      }
    },
    onError: (err) => setFormError(err.message),
  });

  const topics = topicsQuery.data?.topics ?? [];
  const sortedTopics = flattenTopicTree(topicsQuery.data?.tree ?? []);
  const selectedTopic = topics.find((topic) => topic.id === topicId);
  const { words, minutes } = readingTime(contentHtml);
  const tagList = tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  function validate() {
    const next = {};
    if (!title.trim()) next.title = 'Add a title before saving.';
    if (!topicId) next.topic = 'Choose the topic this article belongs to.';
    if (status === 'published' && plainWordCount(contentHtml) === 0) {
      next.content = 'Write some content before publishing.';
    }

    setErrors(next);

    if (Object.keys(next).length > 0) {
      setFormError(
        next.topic ||
          next.content ||
          next.title ||
          'Please complete the required fields before saving.',
      );
      if (next.title) document.getElementById('article-title')?.focus();
      else if (next.topic) document.getElementById('article-topic')?.focus();
      else document.getElementById('article-content')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }

    setFormError('');
    return true;
  }

  function onSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    saveMutation.mutate({
      title: title.trim(),
      subtitle,
      status,
      topicId,
      tags,
      referenceVideos: videos,
      contentHtml,
      media,
    });
  }

  function removeFigure(id) {
    const parser = new DOMParser();
    const article = parser.parseFromString(contentHtml, 'text/html');
    article.querySelectorAll('figure[data-article-media]').forEach((figure) => {
      if (figure.getAttribute('data-article-media') === id) figure.remove();
    });
    setContentHtml(article.body.innerHTML);
    setMedia((current) => current.filter((visual) => visual.id !== id));
  }

  function onAiGenerated(result) {
    const article = result?.article;
    if (!article) return;

    queryClient.setQueryData(['admin', 'article', article.id], article);
    queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'topics'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });

    const notes = [];
    if (result.reference) notes.push('background reference read');
    if (result.warnings?.length) notes.push(`${result.warnings.length} reference skipped`);
    if (result.usage?.totalTokens) notes.push(`${result.usage.totalTokens} tokens used`);

    toast({
      title: 'AI draft created',
      description: notes.length
        ? `${notes.join(' · ')}. Review the visuals before publishing.`
        : 'Saved as a draft. Review the visuals before publishing.',
    });

    navigate(`/articles/${article.id}/edit`);
  }

  function onStatusChange(nextStatus) {
    setStatus(nextStatus);
    if (nextStatus === 'published' && !contentHtml.trim()) {
      setErrors((current) => ({ ...current, content: 'Write some content before publishing.' }));
    }
  }

  const primaryLabel =
    status === 'published'
      ? isNew
        ? 'Publish article'
        : 'Save changes'
      : status === 'archived'
        ? 'Save changes'
        : 'Save draft';

  if (id && articleQuery.isLoading) return <EditorSkeleton />;

  if (id && articleQuery.isError) {
    return (
      <div>
        <Alert tone="error" title="Article could not load">
          <p className="m-0">{articleQuery.error.message}</p>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => articleQuery.refetch()}>
              Try again
            </Button>
            <Button as={Link} to="/articles" size="sm">
              All articles
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="animate-rise">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            
            <h1 className="m-0 mt-2 font-heading text-[26px] font-semibold leading-tight tracking-[-0.03em] sm:text-[30px]">
              {isNew ? 'Write a new article' : 'Edit article'}
            </h1>
            <p className="m-0 mt-1 text-[12px] text-text-tertiary">
              {isNew
                ? 'Pick a topic, write the content, then save or publish.'
                : `Last edited ${formatDateTime(articleQuery.data?.lastEditedAt || articleQuery.data?.updatedAt)}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="soft"
              size="sm"
              onClick={() => setAiOpen(true)}
            >
              <i aria-hidden="true" className="bx bx-magic-wand text-[16px]" />
              Write with AI
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setPreviewOpen(true)}
            >
              <i aria-hidden="true" className="bx bx-show text-[16px]" />
              Preview
            </Button>
            <Button type="submit" size="sm" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <>
                  <i aria-hidden="true" className="bx bx-loader-alt animate-admin-spin text-[16px]" />
                  Saving…
                </>
              ) : (
                <>
                  <i
                    aria-hidden="true"
                    className={`bx ${
                      status === 'published' ? 'bx-send' : 'bx-save'
                    } text-[16px]`}
                  />
                  {primaryLabel}
                </>
              )}
            </Button>
          </div>
        </div>

        {formError && (
          <Alert tone="error" title="Article not saved" className="mt-5" role="alert">
            {formError}
          </Alert>
        )}

        {topics.length === 0 && !topicsQuery.isLoading && (
          <Alert tone="warning" title="No topics available" className="mt-5">
            Create a topic before saving an article.{' '}
            <Link to="/topics" className="font-semibold underline underline-offset-2">
              Go to topics
            </Link>
          </Alert>
        )}

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
          <Card className="min-w-0 p-4 sm:p-6">
            <label htmlFor="article-title" className="sr-only">
              Article title
            </label>
            <input
              id="article-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Article title"
              maxLength={200}
              aria-invalid={errors.title ? true : undefined}
              className={`w-full border-0 bg-transparent p-0 font-heading text-[28px] font-semibold leading-tight tracking-[-0.03em] text-text outline-none placeholder:text-text-disabled sm:text-[34px] ${
                errors.title ? 'text-error placeholder:text-error/50' : ''
              }`}
            />
            {errors.title && <p className="m-0 mt-1.5 text-[11.5px] text-error">{errors.title}</p>}

            <label htmlFor="article-subtitle" className="sr-only">
              Article subtitle
            </label>
            <textarea
              id="article-subtitle"
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              placeholder="Add a short subtitle (optional)"
              rows={2}
              maxLength={300}
              className="mt-2 w-full resize-none border-0 bg-transparent p-0 text-[13.5px] leading-relaxed text-text-secondary outline-none placeholder:text-text-tertiary"
            />

            <div className="my-4 flex items-center justify-between gap-3 border-t border-border-secondary pt-3">
              <span className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-text-tertiary">
                Article content
              </span>
              <span className="text-[10.5px] text-text-tertiary">{words} words</span>
            </div>

            <div id="article-content">
              <RichTextEditor value={contentHtml} onChange={setContentHtml} />
            </div>
            {errors.content && <p className="m-0 mt-2 text-[11.5px] text-error">{errors.content}</p>}

            <ArticleMediaManager
              media={media}
              onChange={setMedia}
              onRemoveFigure={removeFigure}
              articleId={id}
            />
          </Card>

          <aside className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center gap-2 border-b border-border-secondary pb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-button bg-brand-soft text-[15px] text-brand">
                  <i aria-hidden="true" className="bx bx-slider-alt" />
                </span>
                <h2 className="m-0 text-[13.5px] font-semibold">Publishing</h2>
              </div>

              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <Select
                    label="Status"
                    value={status}
                    onChange={(event) => onStatusChange(event.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </Select>
                  <p className="m-0 mt-1.5 text-[11px] leading-relaxed text-text-tertiary">
                    {STATUS_HINTS[status]}
                  </p>
                </div>

                <div>
                  <Select
                    id="article-topic"
                    label="Topic"
                    required
                    value={topicId}
                    error={errors.topic}
                    disabled={topicsQuery.isLoading}
                    onChange={(event) => {
                      setTopicId(event.target.value);
                      setErrors((current) => ({ ...current, topic: undefined }));
                    }}
                  >
                    <option value="">
                      {topicsQuery.isLoading ? 'Loading topics…' : 'Select a topic'}
                    </option>
                    {sortedTopics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {'— '.repeat(topic.depth)}
                        {topic.name}
                      </option>
                    ))}
                  </Select>
                  {selectedTopic ? (
                    <p className="m-0 mt-1.5 flex items-start gap-1 text-[10.5px] leading-relaxed text-text-tertiary">
                      <i aria-hidden="true" className="bx bx-folder mt-px text-[13px]" />
                      {selectedTopic.path}
                    </p>
                  ) : (
                    !errors.topic && (
                      <p className="m-0 mt-1.5 text-[10.5px] leading-relaxed text-text-tertiary">
                        Every article must fall under one topic.
                      </p>
                    )
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 border-b border-border-secondary pb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-button bg-brand-soft text-[15px] text-brand">
                  <i aria-hidden="true" className="bx bx-purchase-tag-alt" />
                </span>
                <h2 className="m-0 text-[13.5px] font-semibold">Organisation</h2>
              </div>

              <div className="mt-4 flex flex-col gap-4">
                <Input
                  label="Tags"
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="system-design, caching, scaling"
                  hint="Separate tags with commas."
                />
                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tagList.slice(0, 8).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-surface-secondary px-2.5 py-1 text-[10.5px] font-medium text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <Textarea
                  label="Reference videos"
                  value={videos}
                  onChange={(event) => setVideos(event.target.value)}
                  placeholder={'https://youtube.com/watch?v=…\nhttps://…'}
                  rows={3}
                  hint="Optional. One URL per line."
                />
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 border-b border-border-secondary pb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-button bg-brand-soft text-[15px] text-brand">
                  <i aria-hidden="true" className="bx bx-bar-chart-alt-2" />
                </span>
                <h2 className="m-0 text-[13.5px] font-semibold">Article summary</h2>
              </div>

              <dl className="m-0 mt-3 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <dt className="m-0 text-[11.5px] text-text-tertiary">Current status</dt>
                  <dd className="m-0">
                    <StatusBadge status={status} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="m-0 text-[11.5px] text-text-tertiary">Words</dt>
                  <dd className="m-0 text-[11.5px] font-semibold text-text-secondary">{words}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="m-0 text-[11.5px] text-text-tertiary">Reading time</dt>
                  <dd className="m-0 text-[11.5px] font-semibold text-text-secondary">
                    {minutes} min
                  </dd>
                </div>
                {!isNew && articleQuery.data?.slug && (
                  <div className="flex items-start justify-between gap-3">
                    <dt className="m-0 text-[11.5px] text-text-tertiary">Slug</dt>
                    <dd className="m-0 max-w-[190px] truncate text-[11px] font-medium text-text-secondary">
                      /{articleQuery.data.slug}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          </aside>
        </div>
      </form>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Article preview"
        description="A rough preview of the saved layout. Final styling lives in the public app."
        size="xl"
        footer={
          <>
            <div
              role="group"
              aria-label="Preview theme"
              className="mr-auto inline-flex rounded-button border border-border bg-surface-secondary p-0.5"
            >
              {[
                { value: 'light', label: 'Light', icon: 'bx-sun' },
                { value: 'dark', label: 'Dark', icon: 'bx-moon' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={previewTheme === option.value}
                  onClick={() => setPreviewTheme(option.value)}
                  className={`inline-flex items-center gap-1.5 rounded-[0.45rem] px-2.5 py-1 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft ${
                    previewTheme === option.value
                      ? 'bg-surface text-brand shadow-card'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  <i aria-hidden="true" className={`bx ${option.icon} text-[13px]`} />
                  {option.label}
                </button>
              ))}
            </div>
            <Button variant="secondary" size="sm" onClick={() => setPreviewOpen(false)}>
              Close preview
            </Button>
          </>
        }
      >
        <div className="rounded-panel bg-surface-secondary/60 p-3 sm:p-6">
          <article
            className={`mx-auto max-w-3xl rounded-panel bg-surface p-5 shadow-card transition-colors sm:p-8 ${
              previewTheme === 'dark' ? 'article-preview-dark' : ''
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
              {selectedTopic && (
                <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10.5px] font-semibold text-brand">
                  {selectedTopic.path}
                </span>
              )}
            </div>
            <h1 className="m-0 mt-4 font-heading text-[27px] font-semibold leading-tight tracking-[-0.03em] sm:text-[34px]">
              {title || 'Untitled article'}
            </h1>
            {subtitle && (
              <p className="m-0 mt-2 text-[14px] leading-relaxed text-text-secondary">{subtitle}</p>
            )}
            {tagList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tagList.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border-secondary px-2.5 py-0.5 text-[10px] font-medium text-text-tertiary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <div className="my-5 h-px bg-border-secondary" />
            <ArticleContentPreview
              html={contentHtml}
              media={media}
              theme={previewTheme}
              emptyText="No content yet. Start writing to see the preview."
            />
          </article>
        </div>
      </Modal>

      <AiGenerateModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        topics={sortedTopics}
        topicId={topicId}
        onTopicChange={setTopicId}
        onGenerated={onAiGenerated}
      />
    </>
  );
}
