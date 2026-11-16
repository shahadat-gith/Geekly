import { useRef, useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { IMAGE_ALIGNMENTS } from './articleImage.js';

const ALIGN_ICONS = {
  left: 'bx-align-left',
  center: 'bx-align-middle',
  right: 'bx-align-right',
};

const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp,image/gif,image/avif';

export function ArticleImageNodeView({ node, editor, selected, getPos, imageActions }) {
  const align = IMAGE_ALIGNMENTS.includes(node.attrs.align) ? node.attrs.align : 'center';
  const editable = editor.isEditable;
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const canUpload = editable && Boolean(imageActions?.upload);
  const hasAsset = Boolean(node.attrs.assetUrl);

  function updateAttrs(changes) {
    const pos = typeof getPos === 'function' ? getPos() : null;
    if (pos === null) return;
    editor
      .chain()
      .focus()
      .setNodeSelection(pos)
      .updateAttributes('articleImage', changes)
      .run();
  }

  async function uploadImage(file) {
    if (!canUpload || !file) return;

    setUploading(true);
    setError('');
    try {
      const image = await imageActions.upload(file);
      if (!image?.url) throw new Error('The upload returned no image. Try again.');
      updateAttrs({
        assetKey: image.key || null,
        assetUrl: image.url,
        alt: node.attrs.alt || '',
      });
    } catch (uploadError) {
      setError(uploadError.message || 'The image could not be uploaded.');
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    uploadImage(file);
  }

  function removeImage() {
    const pos = typeof getPos === 'function' ? getPos() : null;
    if (pos === null) return;
    editor.chain().focus().setNodeSelection(pos).deleteSelection().run();
  }

  return (
    <NodeViewWrapper
      as="figure"
      className={`article-image-block article-image-align-${align}${selected ? ' is-selected' : ''}`}
      data-article-image=""
      data-align={align}
      contentEditable={false}
    >
      <div className="article-image-frame">
        {hasAsset ? (
          <img
            src={node.attrs.assetUrl}
            alt={node.attrs.alt || ''}
            loading="lazy"
            className="article-media-image"
          />
        ) : (
          <div className="media-placeholder">
            <i aria-hidden="true" className="bx bx-image-alt text-[20px]" />
            <p className="m-0 text-[12.5px] font-semibold">Image needed</p>
            <p className="media-prompt m-0 text-[11px] leading-relaxed">
              Upload an image to fill this position.
            </p>
            {canUpload && (
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="mt-2 inline-flex min-h-[32px] items-center gap-1.5 rounded-button bg-brand px-3 text-[11.5px] font-semibold text-on-brand transition hover:bg-brand-hover disabled:opacity-50"
              >
                <i
                  aria-hidden="true"
                  className={`bx ${uploading ? 'bx-loader-alt animate-admin-spin' : 'bx-upload'} text-[15px]`}
                />
                {uploading ? 'Uploading…' : 'Upload image'}
              </button>
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
          <div className="article-image-controls" role="group" aria-label="Image actions">
            {IMAGE_ALIGNMENTS.map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`Align image ${value}`}
                aria-pressed={align === value}
                onClick={() => updateAttrs({ align: value })}
                className="article-image-control"
              >
                <i aria-hidden="true" className={`bx ${ALIGN_ICONS[value]} text-[14px]`} />
              </button>
            ))}
            <span className="article-image-control-divider" aria-hidden="true" />
            {canUpload && (
              <button
                type="button"
                aria-label={hasAsset ? 'Replace image' : 'Upload image'}
                title={hasAsset ? 'Replace image' : 'Upload image'}
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="article-image-control"
              >
                <i
                  aria-hidden="true"
                  className={`bx ${uploading ? 'bx-loader-alt animate-admin-spin' : 'bx-upload'} text-[14px]`}
                />
              </button>
            )}
            <button
              type="button"
              aria-label="Remove image from article"
              title="Remove image from article"
              onClick={removeImage}
              className="article-image-control"
            >
              <i aria-hidden="true" className="bx bx-trash text-[14px]" />
            </button>
          </div>
        )}
      </div>

      {editable && selected && (
        <details className="mt-0.5 rounded-field border border-border bg-surface px-3 py-2">
          <summary className="cursor-pointer text-[11px] font-semibold text-text-secondary">
            Image details
          </summary>
          <div className="mt-2 grid gap-2.5">
            <label className="grid gap-1 text-[10.5px] font-medium text-text-tertiary">
              Alt text
              <input
                value={node.attrs.alt || ''}
                maxLength={500}
                placeholder="What the image shows"
                onChange={(event) => updateAttrs({ alt: event.target.value })}
                className="h-8 w-full rounded border border-border bg-surface px-2 text-[11.5px] text-text outline-none transition-shadow focus:border-border-focus focus:ring-2 focus:ring-brand-soft"
              />
            </label>
            <label className="grid gap-1 text-[10.5px] font-medium text-text-tertiary">
              Caption
              <input
                value={node.attrs.caption || ''}
                maxLength={500}
                placeholder="One line under the image"
                onChange={(event) => updateAttrs({ caption: event.target.value })}
                className="h-8 w-full rounded border border-border bg-surface px-2 text-[11.5px] text-text outline-none transition-shadow focus:border-border-focus focus:ring-2 focus:ring-brand-soft"
              />
            </label>
          </div>
        </details>
      )}

      {node.attrs.caption && <figcaption>{node.attrs.caption}</figcaption>}
    </NodeViewWrapper>
  );
}
