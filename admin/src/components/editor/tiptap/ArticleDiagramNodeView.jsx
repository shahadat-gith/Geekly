import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp,image/gif,image/avif';

function diagramImagePrompt(diagram) {
  const data = JSON.stringify(
    {
      id: diagram.id,
      title: diagram.title,
      caption: diagram.caption || '',
      nodes: diagram.nodes || [],
      edges: diagram.edges || [],
    },
    null,
    2,
  );

  return `Generate a technical diagram image for a software engineering article.\n\nUse the JSON below as the source of truth. Draw every node as a clearly labelled box, connect the edges with arrows, and use the exact node labels and descriptions. Choose the clearest layout and visual grouping yourself. Do not invent extra components, connections or text.\n\nStyle:\n- Light theme.\n- Clean, modern technical illustration.\n- Flat and readable: no gradients, 3D effects, drop shadows, photographs or decorative scenery.\n- Use a real product logo only when a product is named in a node label; otherwise use a simple icon that matches the node type.\n- Do not render the caption inside the image; it is shown below the diagram on the site.\n- Wide 16:9 composition, no watermark.\n\nDiagram data (JSON):\n${data}`;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for non-secure contexts where the Clipboard API is unavailable.
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(area);
  if (!copied) throw new Error('Copy failed');
}

export function ArticleDiagramNodeView({
  node,
  editor,
  selected,
  getPos,
  store,
  diagramActions,
}) {
  const diagrams = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const meta = diagrams.find((diagram) => diagram.id === node.attrs.diagramId);
  const editable = editor.isEditable;
  const fileRef = useRef(null);
  const copyTimer = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const hasAsset = Boolean(node.attrs.assetUrl);
  const busy = generating || uploading;
  const canGenerate = editable && Boolean(node.attrs.diagramId && diagramActions?.generate);
  const canUpload = editable && Boolean(node.attrs.diagramId && diagramActions?.upload);

  function updateAttrs(changes) {
    const pos = typeof getPos === 'function' ? getPos() : null;
    if (pos === null) return;
    editor
      .chain()
      .focus()
      .setNodeSelection(pos)
      .updateAttributes('articleDiagram', changes)
      .run();
  }

  function applyAsset(asset) {
    if (!asset?.url) throw new Error('The diagram action returned no visual. Try again.');
    updateAttrs({
      assetKey: asset.key || null,
      assetUrl: asset.url,
      alt: asset.alt || meta?.title || '',
      caption: asset.caption || meta?.caption || '',
    });
  }

  async function generateImage() {
    if (!canGenerate) return;
    setGenerating(true);
    setError('');
    try {
      applyAsset(await diagramActions.generate(node.attrs.diagramId));
    } catch (generateError) {
      setError(generateError.message || 'The diagram image could not be generated.');
    } finally {
      setGenerating(false);
    }
  }

  async function uploadImage(file) {
    if (!canUpload || !file) return;
    setUploading(true);
    setError('');
    try {
      applyAsset(await diagramActions.upload(node.attrs.diagramId, file));
    } catch (uploadError) {
      setError(uploadError.message || 'The image could not be uploaded.');
    } finally {
      setUploading(false);
    }
  }

  async function copyImagePrompt() {
    if (!meta) return;
    setError('');
    try {
      await copyText(diagramImagePrompt(meta));
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('The diagram prompt could not be copied. Try again.');
    }
  }

  function onFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    uploadImage(file);
  }

  function removeDiagram() {
    const pos = typeof getPos === 'function' ? getPos() : null;
    if (pos === null) return;
    editor.chain().focus().setNodeSelection(pos).deleteSelection().run();
  }

  return (
    <NodeViewWrapper
      as="figure"
      className={`article-image-block article-diagram-block article-image-align-center${selected ? ' is-selected' : ''}`}
      data-article-diagram={node.attrs.diagramId}
      contentEditable={false}
    >
      <div className="article-image-frame">
        {hasAsset ? (
          <img
            src={node.attrs.assetUrl}
            alt={node.attrs.alt || meta?.title || ''}
            loading="lazy"
            className="article-media-image"
          />
        ) : (
          <div className="media-placeholder">
            <i aria-hidden="true" className="bx bx-network-chart text-[20px]" />
            <p className="m-0 text-[12.5px] font-semibold">
              {meta?.title || 'Technical diagram'}
            </p>
            <p className="media-prompt m-0 text-[11px] leading-relaxed">
              {meta
                ? 'Generate a light-theme image from the saved diagram data, or upload your own image.'
                : editable
                  ? 'The saved diagram data for this placeholder could not be loaded.'
                  : 'This diagram has no visual yet.'}
            </p>
            {editable && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={busy || !canGenerate}
                  onClick={generateImage}
                  className="inline-flex min-h-[32px] items-center gap-1.5 rounded-button bg-brand px-3 text-[11.5px] font-semibold text-on-brand transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i
                    aria-hidden="true"
                    className={`bx ${generating ? 'bx-loader-alt animate-admin-spin' : 'bx-image'} text-[15px]`}
                  />
                  {generating ? 'Generating…' : 'Generate image'}
                </button>
                <button
                  type="button"
                  disabled={busy || !canUpload}
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex min-h-[32px] items-center gap-1.5 rounded-button border border-border bg-surface px-3 text-[11.5px] font-semibold text-text-secondary transition hover:border-brand/40 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i
                    aria-hidden="true"
                    className={`bx ${uploading ? 'bx-loader-alt animate-admin-spin' : 'bx-upload'} text-[15px]`}
                  />
                  {uploading ? 'Uploading…' : 'Upload Image'}
                </button>
                {meta && (
                  <button
                    type="button"
                    onClick={copyImagePrompt}
                    title="Copy an image-generation prompt with the diagram JSON"
                    className="inline-flex min-h-[32px] items-center gap-1.5 rounded-button border border-border bg-surface px-3 text-[11.5px] font-semibold text-text-secondary transition hover:border-brand/40 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <i
                      aria-hidden="true"
                      className={`bx ${copied ? 'bx-check' : 'bx-copy'} text-[15px]`}
                    />
                    {copied ? 'Copied' : 'Copy prompt'}
                  </button>
                )}
                <span role="status" className="sr-only">
                  {copied ? 'Diagram image prompt copied to the clipboard.' : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="m-0 mt-2 rounded-field border border-error/25 bg-error/8 px-2.5 py-1.5 text-[10.5px] leading-relaxed text-error"
          >
            {error}
          </p>
        )}

        {canUpload && (
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_IMAGES}
            onChange={onFileChange}
            className="sr-only"
          />
        )}

        {editable && selected && (
          <div className="article-image-controls" role="group" aria-label="Diagram actions">
            <button
              type="button"
              aria-label={hasAsset ? 'Regenerate diagram image' : 'Generate diagram image'}
              title={hasAsset ? 'Regenerate diagram image' : 'Generate diagram image'}
              disabled={busy || !canGenerate}
              onClick={generateImage}
              className="article-image-control"
            >
              <i
                aria-hidden="true"
                className={`bx ${generating ? 'bx-loader-alt animate-admin-spin' : 'bx-image'} text-[14px]`}
              />
            </button>
            <button
              type="button"
              aria-label={hasAsset ? 'Replace with an uploaded image' : 'Upload image'}
              title={hasAsset ? 'Replace with an uploaded image' : 'Upload image'}
              disabled={busy || !canUpload}
              onClick={() => fileRef.current?.click()}
              className="article-image-control"
            >
              <i
                aria-hidden="true"
                className={`bx ${uploading ? 'bx-loader-alt animate-admin-spin' : 'bx-upload'} text-[14px]`}
              />
            </button>
            <span className="article-image-control-divider" aria-hidden="true" />
            <button
              type="button"
              aria-label="Remove diagram from article"
              title="Remove diagram from article"
              disabled={busy}
              onClick={removeDiagram}
              className="article-image-control"
            >
              <i aria-hidden="true" className="bx bx-trash text-[14px]" />
            </button>
          </div>
        )}
      </div>

      {hasAsset && (node.attrs.caption || node.attrs.alt) && (
        <figcaption>{node.attrs.caption || node.attrs.alt}</figcaption>
      )}

      {editable && selected && meta && (
        <details className="mt-0.5 rounded-field border border-border bg-surface px-3 py-2">
          <summary className="cursor-pointer text-[11px] font-semibold text-text-secondary">
            Diagram details
          </summary>
          <p className="m-0 mt-2 text-[11px] leading-relaxed text-text-tertiary">
            {meta.nodes?.length || 0} nodes · {meta.edges?.length || 0} connections
          </p>
          <label className="mt-2 grid gap-1 text-[10.5px] font-medium text-text-tertiary">
            Caption
            <textarea
              value={node.attrs.caption || ''}
              maxLength={300}
              rows={2}
              placeholder="One sentence shown below the diagram"
              onChange={(event) => updateAttrs({ caption: event.target.value })}
              className="w-full resize-y rounded border border-border bg-surface px-2 py-1.5 text-[11.5px] text-text outline-none transition-shadow focus:border-border-focus focus:ring-2 focus:ring-brand-soft"
            />
          </label>
          <label className="mt-2 grid gap-1 text-[10.5px] font-medium text-text-tertiary">
            Alt text
            <input
              value={node.attrs.alt || ''}
              maxLength={500}
              placeholder="What the diagram shows"
              onChange={(event) => updateAttrs({ alt: event.target.value })}
              className="h-8 w-full rounded border border-border bg-surface px-2 text-[11.5px] text-text outline-none transition-shadow focus:border-border-focus focus:ring-2 focus:ring-brand-soft"
            />
          </label>
        </details>
      )}
    </NodeViewWrapper>
  );
}
