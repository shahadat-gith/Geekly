import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { articlesApi, diagramsApi, mediaApi, topicsApi } from '../api/index.js';
import { useToast } from '../context/toastContext.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Select, Textarea } from '../components/ui/Field.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { StatusBadge } from '../components/ui/Badge.jsx';
import { RichTextEditor } from '../components/editor/RichTextEditor.jsx';
import { AiGenerateModal } from '../components/editor/AiGenerateModal.jsx';
import { ArticleDocumentPreview } from '../components/editor/tiptap/ArticleDocumentPreview.jsx';
import {
  articleDocHasContent,
  articleDocText,
  isArticleDoc,
} from '../components/editor/tiptap/articleDocument.js';
import { formatDateTime, readingTime } from '../utils/format.js';

const EMPTY_DIAGRAMS = [];

const STATUS_HINTS = {
  draft: 'Saved privately. Publish when the article is ready.',
  published: 'Visible in the public library right away.',
  archived: 'Hidden from readers but kept in the admin library.',
};

function emptyArticleDoc() {
  return { type: 'doc', content: [{ type: 'paragraph' }] };
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
  const [videos, setVideos] = useState('');
  const [contentDoc, setContentDoc] = useState(emptyArticleDoc);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
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

  const diagramsQuery = useQuery({
    queryKey: ['admin', 'article-diagrams', id],
    queryFn: () => diagramsApi.listArticleDiagramsApi(id),
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
        setVideos('');
        setContentDoc(emptyArticleDoc());
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
      setTopicId(article.topic?.id || article.topicId || '');
      setVideos((article.referenceVideos || []).join('\n'));
      setContentDoc(isArticleDoc(article.content) ? article.content : emptyArticleDoc());
      setErrors({});
      setFormError('');
    }
  }, [id, articleQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isNew ? articlesApi.createArticleApi(payload) : articlesApi.updateArticleApi(id, payload),
    onSuccess: (article) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'article-diagrams', article.id] });
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
        navigate(`/editor/${article.id}`, { replace: true });
      } else {
        setStatus(article.status);
      }
    },
    onError: (err) => setFormError(err.message),
  });

  const sortedTopics = flattenTopicTree(topicsQuery.data?.tree ?? []);
  const selectedTopic = sortedTopics.find((topic) => topic.id === topicId) || null;
  const articleDiagrams = diagramsQuery.data?.diagrams ?? EMPTY_DIAGRAMS;
  const loadedArticle = id && articleQuery.data?.id === id ? articleQuery.data : null;
  const { words, minutes } = readingTime(articleDocText(contentDoc));

  function validate() {
    const next = {};
    if (!title.trim()) next.title = 'Add a title before saving.';
    if (!topicId) next.topic = 'Select a topic before saving.';
    if (status === 'published' && !articleDocHasContent(contentDoc)) {
      next.content = 'Write some content before publishing.';
    }

    setErrors(next);

    if (Object.keys(next).length > 0) {
      setFormError(
        next.content ||
          next.topic ||
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
      referenceVideos: videos,
      contentJson: contentDoc,
    });
  }

  const uploadImage = useCallback(async (file) => {
    const uploaded = await mediaApi.uploadArticleImageApi(file);
    if (!uploaded?.url) throw new Error('The image upload returned no image. Try again.');
    return uploaded;
  }, []);

  const generateDiagramImage = useCallback(
    async (diagramId) => {
      if (!id) throw new Error('Save the article before generating a diagram image.');
      const result = await diagramsApi.generateArticleDiagramImageApi(id, diagramId);
      queryClient.invalidateQueries({ queryKey: ['admin', 'article-diagrams', id] });
      return {
        ...result.asset,
        alt: result.visual?.alt || '',
        caption: result.visual?.caption || '',
      };
    },
    [id, queryClient],
  );

  const uploadDiagramImage = useCallback(
    async (diagramId, file) => {
      if (!id) throw new Error('Save the article before uploading a diagram image.');
      const result = await diagramsApi.uploadArticleDiagramImageApi(id, diagramId, file);
      queryClient.invalidateQueries({ queryKey: ['admin', 'article-diagrams', id] });
      return {
        ...result.asset,
        alt: result.visual?.alt || '',
        caption: result.visual?.caption || '',
      };
    },
    [id, queryClient],
  );

  function onAiGenerated(result) {
    const article = result?.article;
    if (!article) return;

    queryClient.setQueryData(['admin', 'article', article.id], article);
    queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'article-diagrams', article.id] });

    const notes = [];
    if (result.reference) notes.push('background reference read');
    if (result.warnings?.length) notes.push(`${result.warnings.length} reference skipped`);
    if (result.diagrams?.length) {
      notes.push(`${result.diagrams.length} diagram${result.diagrams.length === 1 ? '' : 's'} saved`);
    }
    if (result.usage?.totalTokens) notes.push(`${result.usage.totalTokens} tokens used`);

    toast({
      title: 'AI draft created',
      description: notes.length
        ? `${notes.join(' · ')}. Review the diagrams before publishing.`
        : 'Saved as a draft. Review the diagrams before publishing.',
    });

    navigate(`/editor/${article.id}`);
  }

  function onStatusChange(nextStatus) {
    setStatus(nextStatus);
    if (nextStatus === 'published' && !articleDocHasContent(contentDoc)) {
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
                ? 'Write the content, add visuals, then save or publish.'
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
              <RichTextEditor
                key={id || 'new'}
                value={loadedArticle ? loadedArticle.content : contentDoc}
                diagrams={articleDiagrams}
                onUploadImage={uploadImage}
                onGenerateDiagramImage={generateDiagramImage}
                onUploadDiagramImage={uploadDiagramImage}
                onChange={({ doc }) => setContentDoc(doc)}
              />
            </div>
            {errors.content && <p className="m-0 mt-2 text-[11.5px] text-error">{errors.content}</p>}
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
                    id="article-topic"
                    label="Topic"
                    value={topicId}
                    onChange={(event) => {
                      setTopicId(event.target.value);
                      setErrors((current) => ({ ...current, topic: undefined }));
                    }}
                    error={errors.topic}
                  >
                    <option value="">Select a topic…</option>
                    {sortedTopics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.path || topic.name}
                      </option>
                    ))}
                  </Select>
                  {topicsQuery.isSuccess && sortedTopics.length === 0 && (
                    <Alert tone="warning" title="No topics yet" className="mt-3">
                      Create a topic before saving an article.
                    </Alert>
                  )}
                </div>

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
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 border-b border-border-secondary pb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-button bg-brand-soft text-[15px] text-brand">
                  <i aria-hidden="true" className="bx bx-detail" />
                </span>
                <h2 className="m-0 text-[13.5px] font-semibold">Additional details</h2>
              </div>

              <div className="mt-4 flex flex-col gap-4">
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
                  <dt className="m-0 text-[11.5px] text-text-tertiary">Topic</dt>
                  <dd className="m-0 max-w-[190px] truncate text-right text-[11.5px] font-medium text-text-secondary">
                    {selectedTopic?.path || selectedTopic?.name || 'Not selected'}
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
            <Button variant="secondary" size="sm" onClick={() => setPreviewOpen(false)}>
              Close preview
            </Button>
          </>
        }
      >
        <div className="rounded-panel bg-surface-secondary/60 p-3 sm:p-6">
          <article className="mx-auto max-w-3xl rounded-panel bg-surface p-5 shadow-card sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={status} />
            </div>
            <h1 className="m-0 mt-4 font-heading text-[27px] font-semibold leading-tight tracking-[-0.03em] sm:text-[34px]">
              {title || 'Untitled article'}
            </h1>
            {subtitle && (
              <p className="m-0 mt-2 text-[14px] leading-relaxed text-text-secondary">{subtitle}</p>
            )}
            <div className="my-5 h-px bg-border-secondary" />
            <ArticleDocumentPreview
              doc={contentDoc}
              diagrams={articleDiagrams}
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
