import { useMemo } from 'react';

const FIGURE_PATTERN =
  /<figure\b[^>]*data-article-media\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*>[\s\S]*?<\/figure>/gi;

function splitHtml(html) {
  const source = String(html ?? '');
  const segments = [];
  let lastIndex = 0;
  const pattern = new RegExp(FIGURE_PATTERN.source, 'gi');
  let match;

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > lastIndex) segments.push({ type: 'html', html: source.slice(lastIndex, match.index) });
    segments.push({ type: 'media', id: match[1] || match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < source.length) segments.push({ type: 'html', html: source.slice(lastIndex) });
  return segments;
}

export function MediaVisual({ media, theme = 'light', compact = false }) {
  const item = media || {};

  if (item.imageUrl) {
    return (
      <img
        src={item.imageUrl}
        alt={item.alt || ''}
        loading="lazy"
        className={`article-media-image ${compact ? 'article-media-image-compact' : ''}`}
      />
    );
  }

  return (
    <div className={`media-placeholder ${theme === 'dark' ? 'media-placeholder-dark' : ''}`}>
      <i aria-hidden="true" className="bx bx-image-alt text-[20px]" />
      <p className="m-0 text-[12.5px] font-semibold">Image needed</p>
      {item.imagePrompt ? (
        <p className="media-prompt m-0 text-[11px] leading-relaxed">{item.imagePrompt}</p>
      ) : (
        <p className="m-0 text-[11.5px]">Add a prompt in the visuals panel to generate one.</p>
      )}
    </div>
  );
}

/** Renders article HTML and replaces visual figure placeholders with their media. */
export function ArticleContentPreview({ html = '', media = [], theme = 'light', emptyText = '' }) {
  const segments = useMemo(() => splitHtml(html), [html]);

  if (!String(html ?? '').trim()) {
    return emptyText ? <p className="m-0 text-[13px] italic text-text-tertiary">{emptyText}</p> : null;
  }

  const mediaById = new Map(media.map((item) => [item.id, item]));
  return (
    <div className="article-prose">
      {segments.map((segment, index) => {
        if (segment.type === 'media') {
          const item = mediaById.get(segment.id);
          return (
            <figure key={`media-${segment.id}-${index}`} className="article-media">
              <MediaVisual media={item || { id: segment.id }} theme={theme} />
              {item?.caption && <figcaption>{item.caption}</figcaption>}
            </figure>
          );
        }

        return (
          <div
            key={`html-${index}`}
            className="article-media-chunk"
            dangerouslySetInnerHTML={{ __html: segment.html }}
          />
        );
      })}
    </div>
  );
}
