import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa6';
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
      <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <div className="h-3 w-40 animate-pulse rounded bg-surface-tertiary" />
        <div className="mt-8 h-12 w-3/4 animate-pulse rounded bg-surface-tertiary" />
        <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-surface-tertiary" />
        <div className="mt-12 h-72 animate-pulse rounded-card bg-surface-tertiary/70" />
      </div>
    );
  }

  if (isError) {
    return <NotFound message={error.status === 404 ? 'Article not found' : 'This article could not load'} />;
  }
  if (data.type !== 'article') return <NotFound />;

  const { article, topic, subtopic } = data;

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-text-tertiary"
      >
        <Link to="/" className="transition hover:text-text">
          Home
        </Link>
        <FaChevronRight aria-hidden="true" className="text-[11px]" />
        <Link to={`/${topic.slug}`} className="transition hover:text-text">
          {topic.name}
        </Link>
        {subtopic && (
          <>
            <FaChevronRight aria-hidden="true" className="text-[11px]" />
            <span className="text-text">{subtopic.name}</span>
          </>
        )}
      </nav>

      <header className="mt-7 border-b border-border pb-9">
        <h1 className="max-w-[46rem] text-balance font-heading text-[40px] font-normal leading-[1.01] tracking-[-0.025em] sm:text-[54px]">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.7] text-text-secondary">
            {article.subtitle}
          </p>
        )}
        <p className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-text-tertiary">
          {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
          {article.readingTime ? <span aria-hidden="true">·</span> : null}
          {article.readingTime ? <span>{article.readingTime}</span> : null}
        </p>
      </header>

      <div className="mt-9">
        <ArticleBody html={article.content?.html || ''} media={article.content?.media || []} />
      </div>

      {article.tags?.length > 0 && (
        <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-border pt-6">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-button border border-border-secondary px-2.5 py-1 text-[11.5px] text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
