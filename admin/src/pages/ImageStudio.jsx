import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/index.js';
import { useToast } from '../context/toastContext.js';
import { Alert } from '../components/ui/Alert.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Select, Textarea } from '../components/ui/Field.jsx';
import { formatDateTime, formatNumber } from '../utils/format.js';
import { formatCost, formatDuration } from '../utils/aiUsage.js';
import { modelPriceLabel } from '../utils/aiModels.js';

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9 — wide article header' },
  { value: '4:3', label: '4:3 — classic' },
  { value: '1:1', label: '1:1 — square' },
  { value: '3:4', label: '3:4 — portrait' },
  { value: '9:16', label: '9:16 — tall' },
];

const EXAMPLE_PROMPT =
  'Isometric cutaway illustration of a web request travelling from a phone through a load balancer into three application servers. Clean flat vector style, warm cream background, coral and deep navy accents, soft shadows, no text, no labels.';

export default function ImageStudio() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const modelsQuery = useQuery({
    queryKey: ['admin', 'ai', 'models'],
    queryFn: () => aiApi.getAiModelsApi(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const imagesQuery = useQuery({
    queryKey: ['admin', 'ai', 'images', { page }],
    queryFn: () => aiApi.getGeneratedImagesApi({ page, limit: 9 }),
    placeholderData: (previous) => previous,
  });

  const models = modelsQuery.data?.models ?? [];
  const imageModels = models.filter((model) => model.type === 'image' && model.enabled);
  const defaultModel =
    imageModels.find((model) => model.isDefault) || imageModels[0] || null;

  const modelNames = new Map(models.map((model) => [model.modelId, model.name]));

  const generateMutation = useMutation({
    mutationFn: aiApi.generateImageApi,
    onSuccess: (data) => {
      setError('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'ai', 'images'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'ai', 'usage'] });
      toast({
        title: 'Image generated',
        description: `${formatCost(data.image?.cost ?? 0)} · ${formatDuration(data.image?.durationMs ?? 0)}`,
      });
    },
    onError: (generateError) => setError(generateError.message),
  });

  const images = imagesQuery.data?.images ?? [];
  const pagination = imagesQuery.data?.pagination;
  const busy = generateMutation.isPending;

  function onSubmit(event) {
    event.preventDefault();
    if (!prompt.trim() || !defaultModel) return;

    setError('');
    generateMutation.mutate({ prompt: prompt.trim(), aspectRatio });
  }

  async function copyUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Image URL copied' });
    } catch {
      toast({ title: 'Could not copy', description: 'Select the URL and copy it manually.' });
    }
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Image studio"
        description="Generate images with the default image model from Settings. Every generation keeps its prompt, model, cost and timing below."
        actions={
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-surface-secondary px-3 py-1 text-[11px] font-medium text-text-tertiary">
            <i aria-hidden="true" className="bx bx-image-alt text-[13px]" />
            {defaultModel ? defaultModel.name : 'No image model'}
          </span>
        }
      />

      {modelsQuery.isError && (
        <Alert tone="warning" title="Could not load the image model" className="mt-5">
          {modelsQuery.error.message}
        </Alert>
      )}

      {!modelsQuery.isLoading && !defaultModel && (
        <Alert tone="warning" title="No image model is set up" className="mt-5">
          Add an image model in{' '}
          <Link to="/settings?section=ai-models" className="font-semibold text-brand hover:underline">
            Settings
          </Link>{' '}
          and mark it as the default. The studio uses that model automatically.
        </Alert>
      )}

      {error && (
        <Alert tone="error" title="Image not generated" className="mt-5">
          {error}
        </Alert>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        <Card className="h-fit p-5">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Textarea
              label="Prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={7}
              maxLength={1200}
              placeholder={EXAMPLE_PROMPT}
              hint="Describe the subject, composition, style, mood and colours. Ask for no text or labels."
            />

            <div className="rounded-field border border-border-secondary bg-surface-secondary/50 px-3.5 py-3">
              <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.09em] text-text-tertiary">
                Model
              </p>
              {defaultModel ? (
                <>
                  <p className="m-0 mt-1 text-[12.5px] font-semibold text-text">
                    {defaultModel.name}
                  </p>
                  <p className="m-0 mt-0.5 truncate font-mono text-[10.5px] text-text-tertiary" title={defaultModel.modelId}>
                    {defaultModel.modelId}
                  </p>
                  <p className="m-0 mt-1.5 text-[10.5px] text-text-tertiary">
                    {modelPriceLabel(defaultModel)} · change the default in{' '}
                    <Link to="/settings?section=ai-models" className="font-semibold text-brand hover:underline">
                      Settings
                    </Link>
                  </p>
                </>
              ) : (
                <p className="m-0 mt-1 text-[12px] text-text-secondary">
                  Add an image model in{' '}
                  <Link to="/settings?section=ai-models" className="font-semibold text-brand hover:underline">
                    Settings
                  </Link>
                  .
                </p>
              )}
            </div>

            <Select
              label="Aspect ratio"
              value={aspectRatio}
              onChange={(event) => setAspectRatio(event.target.value)}
            >
              {ASPECT_RATIOS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" size="sm" disabled={busy || !defaultModel || !prompt.trim()}>
                {busy ? (
                  <>
                    <i aria-hidden="true" className="bx bx-loader-alt animate-admin-spin text-[16px]" />
                    Generating…
                  </>
                ) : (
                  <>
                    <i aria-hidden="true" className="bx bx-magic-wand text-[16px]" />
                    Generate image
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => setPrompt(EXAMPLE_PROMPT)}
              >
                Use example
              </Button>
            </div>
          </form>
        </Card>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-[14.5px] font-semibold text-text">Generated images</h2>
              <p className="m-0 mt-1 text-[11.5px] text-text-tertiary">
                Every image is stored with its model, prompt and cost.
              </p>
            </div>
            <span className="text-[11px] font-medium text-text-tertiary">
              {formatNumber(pagination?.total ?? 0)} saved
            </span>
          </div>

          {imagesQuery.isError ? (
            <Alert tone="error" title="Image history could not load" className="mt-4">
              <p className="m-0">{imagesQuery.error.message}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => imagesQuery.refetch()}
              >
                Try again
              </Button>
            </Alert>
          ) : imagesQuery.isLoading ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="h-[280px] animate-pulse p-3">
                  <div className="h-[190px] rounded-field bg-surface-tertiary/50" />
                  <div className="mt-3 h-3 w-2/3 rounded bg-surface-tertiary" />
                </Card>
              ))}
            </div>
          ) : images.length === 0 ? (
            <Card className="mt-4">
              <EmptyState
                icon="bx-image-add"
                title="No images yet"
                description="Generate an image from a prompt and it will be saved here with its details."
              />
            </Card>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {images.map((image) => (
                <Card key={image.id} className="flex flex-col p-3">
                  {image.status === 'error' ? (
                    <div className="flex min-h-[160px] flex-col items-center justify-center gap-1.5 rounded-field border border-error/20 bg-error/5 p-4 text-center">
                      <i aria-hidden="true" className="bx bx-error-circle text-[22px] text-error" />
                      <p className="m-0 text-[12px] font-semibold text-error">Generation failed</p>
                      <p className="m-0 text-[10.5px] leading-relaxed text-error/80">{image.error || 'Unknown error'}</p>
                    </div>
                  ) : (
                    <img
                      src={image.url}
                      alt={image.prompt}
                      loading="lazy"
                      className="w-full rounded-field border border-border bg-surface-secondary object-contain"
                    />
                  )}

                  <div className="mt-3 flex flex-1 flex-col">
                    <p className="m-0 line-clamp-2 text-[11.5px] leading-relaxed text-text-secondary">
                      {image.prompt}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-text-tertiary">
                      <span className="font-medium text-text-secondary" title={image.model}>
                        {modelNames.get(image.model) || image.model}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{image.aspectRatio}</span>
                      {image.bytes > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{Math.round(image.bytes / 1024)} KB</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{formatCost(image.cost)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDuration(image.durationMs)}</span>
                    </div>

                    <p className="m-0 mt-1 text-[10px] text-text-tertiary" title={formatDateTime(image.createdAt)}>
                      {formatDateTime(image.createdAt)}
                      {image.article ? ` · ${image.article.title}` : ''}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {image.status !== 'error' && (
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => copyUrl(image.url)}
                          >
                            <i aria-hidden="true" className="bx bx-copy text-[15px]" />
                            Copy URL
                          </Button>
                          <Button
                            as="a"
                            href={image.url}
                            target="_blank"
                            rel="noreferrer"
                            variant="secondary"
                            size="sm"
                          >
                            <i aria-hidden="true" className="bx bx-link-external text-[15px]" />
                            Open
                          </Button>
                        </>
                      )}
                      <Button
                        type="button"
                        variant="soft"
                        size="sm"
                        onClick={() => {
                          setPrompt(image.prompt);
                          setAspectRatio(image.aspectRatio || '16:9');
                        }}
                      >
                        Reuse prompt
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-panel bg-surface px-4 py-3 shadow-card">
              <p className="m-0 text-[11px] text-text-tertiary">
                Page {pagination.page} of {pagination.pages}
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
        </div>
      </div>
    </div>
  );
}
