import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { aiApi, mediaApi } from '../../api/index.js';
import { Input, Textarea } from '../ui/Field.jsx';
import { formatCost, formatDuration } from '../../utils/aiUsage.js';
import { modelPriceLabel } from '../../utils/aiModels.js';

function VisualCard({ item, index, model, articleId, onPatch, onRemove }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState('');
  const busy = uploading || generating;

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const uploaded = await mediaApi.uploadArticleImageApi(file);
      onPatch({ imageUrl: uploaded.url, imageKey: uploaded.key });
      setCandidate(null);
    } catch (uploadError) {
      setError(uploadError.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerate() {
    const prompt = String(item.imagePrompt || '').trim();
    if (!prompt) {
      setError('Write an image prompt first. AI drafts fill this in for you.');
      return;
    }

    setGenerating(true);
    setError('');
    try {
      const result = await aiApi.generateImageApi({
        prompt,
        aspectRatio: '16:9',
        mediaId: item.id,
        articleId: articleId || undefined,
      });
      setCandidate(result.image);
    } catch (generateError) {
      setError(generateError.message || 'The image could not be generated.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <article className="rounded-panel border border-border bg-surface-secondary/40 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-text-secondary">Image {index + 1}</span>
          <code className="rounded bg-surface px-1.5 py-0.5 text-[10.5px] text-text-tertiary">{item.id}</code>
          {item.imageUrl && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[10px] font-semibold text-success">
              <i aria-hidden="true" className="bx bx-check text-[12px]" />
              In use
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label={`Remove visual ${index + 1}`}
          title="Remove this visual and its figure from the article"
          onClick={onRemove}
          className="inline-flex h-8 w-8 items-center justify-center rounded-button text-text-tertiary transition hover:bg-error/8 hover:text-error focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-error/15"
        >
          <i aria-hidden="true" className="bx bx-trash text-[16px]" />
        </button>
      </div>

      {error && (
        <p role="alert" className="m-0 mt-3 rounded-field border border-error/25 bg-error/8 px-3 py-2 text-[11.5px] text-error">
          {error}
        </p>
      )}

      <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-3">
          <Textarea
            label="Image prompt"
            value={item.imagePrompt}
            onChange={(event) => onPatch({ imagePrompt: event.target.value })}
            rows={5}
            maxLength={1000}
            placeholder="For technical diagrams, describe components, recognizable component icons, connections and data flow. Avoid decorative scenes."
            hint="AI drafts should specify recognizable technical icons as well as labels. Edit the prompt, then generate the image here."
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={handleGenerate}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-button bg-brand px-3 text-[11.5px] font-semibold text-on-brand transition hover:bg-brand-hover disabled:opacity-50"
            >
              <i aria-hidden="true" className={`bx ${busy ? 'bx-loader-alt animate-admin-spin' : 'bx-magic-wand'} text-[15px]`} />
              {generating ? 'Generating…' : 'Generate image'}
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={handleFile}
              className="sr-only"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-button border border-border bg-surface px-3 text-[11.5px] font-semibold text-text-secondary transition hover:border-brand/40 hover:text-brand disabled:opacity-50"
            >
              <i aria-hidden="true" className={`bx ${uploading ? 'bx-loader-alt animate-admin-spin' : 'bx-upload'} text-[15px]`} />
              {uploading ? 'Uploading…' : item.imageUrl ? 'Upload a replacement' : 'Upload image'}
            </button>

            {item.imageUrl && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  onPatch({ imageUrl: '', imageKey: '' });
                  setCandidate(null);
                }}
                className="inline-flex min-h-[36px] items-center gap-1 rounded-button px-2.5 text-[11px] font-semibold text-error transition hover:bg-error/8 disabled:opacity-50"
              >
                <i aria-hidden="true" className="bx bx-trash text-[14px]" />
                Remove image
              </button>
            )}
          </div>
          <p className="m-0 text-[10.5px] text-text-tertiary">
            {model ? (
              <>
                Generates with {model.name} ({modelPriceLabel(model)}). Change the default in{' '}
                <Link to="/settings?section=ai-models" className="font-semibold text-brand hover:underline">
                  Settings
                </Link>
                . Uploads accept JPEG, PNG, WebP, GIF or AVIF · max 10 MB.
              </>
            ) : (
              <>
                Add an image model in{' '}
                <Link to="/settings?section=ai-models" className="font-semibold text-brand hover:underline">
                  Settings
                </Link>{' '}
                to generate images. Uploads accept JPEG, PNG, WebP, GIF or AVIF · max 10 MB.
              </>
            )}
          </p>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="rounded-field border border-border bg-surface p-2.5">
            {candidate ? (
              <>
                <img
                  src={candidate.url}
                  alt="Generated candidate"
                  className="article-media-image article-media-image-compact"
                />
                <p className="m-0 mt-2 text-[10.5px] text-text-tertiary">
                  {formatCost(candidate.cost ?? 0)} · {formatDuration(candidate.durationMs ?? 0)} ·{' '}
                  {model?.name || candidate.model}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onPatch({ imageUrl: candidate.url, imageKey: candidate.key });
                      setCandidate(null);
                    }}
                    className="inline-flex min-h-[34px] items-center gap-1.5 rounded-button bg-brand px-3 text-[11.5px] font-semibold text-on-brand transition hover:bg-brand-hover"
                  >
                    <i aria-hidden="true" className="bx bx-check text-[15px]" />
                    Use this image
                  </button>
                  <button
                    type="button"
                    onClick={() => setCandidate(null)}
                    className="inline-flex min-h-[34px] items-center gap-1 rounded-button border border-border bg-surface px-3 text-[11.5px] font-semibold text-text-secondary transition hover:text-text"
                  >
                    Discard
                  </button>
                  <span className="text-[10.5px] text-text-tertiary">Not used until you approve it.</span>
                </div>
              </>
            ) : item.imageUrl ? (
              <>
                <img
                  src={item.imageUrl}
                  alt={item.alt || ''}
                  className="article-media-image article-media-image-compact"
                />
                <p className="m-0 mt-2 text-[10.5px] text-text-tertiary">
                  This image appears in the article.
                </p>
              </>
            ) : (
              <div className="media-placeholder">
                <i aria-hidden="true" className="bx bx-image-alt text-[20px]" />
                <p className="m-0 text-[12.5px] font-semibold">Placeholder in the article</p>
                <p className="media-prompt m-0 text-[11px] leading-relaxed">
                  {item.imagePrompt
                    ? 'Generate an image from the prompt, approve it, or upload one of your own.'
                    : 'Add a prompt to generate an image.'}
                </p>
              </div>
            )}
          </div>

          <Input
            label="Alt text"
            value={item.alt}
            onChange={(event) => onPatch({ alt: event.target.value })}
            placeholder="What the image shows"
            maxLength={500}
          />
          <Input
            label="Caption"
            value={item.caption}
            onChange={(event) => onPatch({ caption: event.target.value })}
            placeholder="One line under the image"
            maxLength={500}
          />
        </div>
      </div>
    </article>
  );
}

export function ArticleMediaManager({ media = [], onChange, onRemoveFigure, articleId }) {
  const modelsQuery = useQuery({
    queryKey: ['admin', 'ai', 'models'],
    queryFn: aiApi.getAiModelsApi,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  if (media.length === 0) return null;

  const imageModels = (modelsQuery.data?.models ?? []).filter(
    (model) => model.type === 'image' && model.enabled
  );
  const defaultModel =
    imageModels.find((model) => model.isDefault) || imageModels[0] || null;

  function patch(id, changes) {
    onChange?.(media.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }

  return (
    <section className="mt-5 border-t border-border-secondary pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="m-0 flex items-center gap-2 text-[13.5px] font-semibold">
            <i aria-hidden="true" className="bx bx-image-alt text-[17px] text-brand" />
            Images
            <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-[10.5px] font-semibold text-text-tertiary">{media.length}</span>
          </h2>
          <p className="m-0 mt-1 text-[11px] leading-relaxed text-text-tertiary">
            Every placeholder in the article is an image. Generate one from its prompt, approve it, or upload an image of your own.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {media.map((item, index) => (
          <VisualCard
            key={item.id}
            item={item}
            index={index}
            model={defaultModel}
            articleId={articleId}
            onPatch={(changes) => patch(item.id, changes)}
            onRemove={() => onRemoveFigure?.(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
