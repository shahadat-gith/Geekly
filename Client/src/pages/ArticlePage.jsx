import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useContent, useContentPath, NotFound } from './TopicPage.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { formatDate } from '../utils/format.js';

const FIGURE_PATTERN =
  /<figure\b[^>]*data-article-media\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*>[\s\S]*?<\/figure>/gi;

// Article HTML keeps an empty <figure data-article-media="viz-1"> where each
// image belongs; the media list holds the approved image for that id.
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

function ArticleBody({ html, media = [] }) {
  const segments = useMemo(() => splitHtml(html), [html]);
  const mediaById = new Map(media.map((item) => [item.id, item]));

  return (
    <div className="article-prose">
      {segments.map((segment, index) => {
        if (segment.type === 'media') {
          const item = mediaById.get(segment.id);
          if (!item?.imageUrl) return null;

          return (
            <figure key={`media-${segment.id}-${index}`} className="article-media">
              <img
                src={item.imageUrl}
                alt={item.alt || ''}
                loading="lazy"
                className="article-media-image"
              />
              {item.caption && <figcaption>{item.caption}</figcaption>}
            </figure>
          );
        }

        return (
          <div
            key={`html-${index}`}
            className="article-prose-chunk"
            dangerouslySetInnerHTML={{ __html: segment.html }}
          />
        );
      })}
    </div>
  );
}

export default function ArticlePage() {
  const path = useContentPath();
  const { data, isLoading, isError, error } = useContent(path);
  useReveal();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-5">
        <div className="h-4 w-48 animate-pulse rounded bg-surface-secondary" />
        <div className="mt-6 h-9 w-2/3 animate-pulse rounded bg-surface-secondary" />
        <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-surface-secondary" />
        <div className="mt-10 h-72 animate-pulse rounded-card bg-surface-secondary" />
      </div>
    );
  }

  if (isError) {
    return <NotFound message={error.status === 404 ? 'Article not found' : 'This article could not load'} />;
  }
  if (data.type !== 'article') return <NotFound />;

  const { article, topic, subtopic } = data;

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-5 sm:py-16">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-text-tertiary">
        <Link to="/" className="font-medium text-text-secondary transition hover:text-brand">
          Home
        </Link>
        <i aria-hidden="true" className="bx bx-chevron-right text-[15px]" />
        <Link to={`/${topic.slug}`} className="font-medium text-text-secondary transition hover:text-brand">
          {topic.name}
        </Link>
        {subtopic && (
          <>
            <i aria-hidden="true" className="bx bx-chevron-right text-[15px]" />
            <span className="font-medium text-text">{subtopic.name}</span>
          </>
        )}
      </nav>

      <header className="mt-6">
        <h1 className="m-0 text-[30px] font-bold leading-tight sm:text-[38px]">{article.title}</h1>
        {article.subtitle && (
          <p className="mt-3 text-[16.5px] leading-relaxed text-text-secondary">{article.subtitle}</p>
        )}
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-text-tertiary">
          {article.publishedAt && <span>Published {formatDate(article.publishedAt)}</span>}
          {article.readingTime ? <span>· {article.readingTime}</span> : null}
        </p>
      </header>

      <div className="mt-8 border-t border-border-secondary pt-8">
        <ArticleBody html={article.content?.html || ''} media={article.content?.media || []} />
      </div>

      {article.tags?.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-border-secondary pt-6">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-surface-secondary px-3 py-1 text-[11.5px] font-medium text-text-secondary"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

    </article>
  );
}
