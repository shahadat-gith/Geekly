import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa6';
import { useContent, useContentPath, NotFound } from './TopicPage.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { formatDate } from '../utils/format.js';
import { ArticleBody } from '../components/article/ArticleBody.jsx';

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
        <ArticleBody doc={article.content || null} />
      </div>

    </article>
  );
}
