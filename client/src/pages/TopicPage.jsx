import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { FaArrowRight, FaChevronDown, FaChevronRight, FaFileLines } from 'react-icons/fa6';
import { topicsApi } from '../api/index.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { formatDate } from '../utils/format.js';

export function useContent(path) {
  return useQuery({
    queryKey: ['content', path],
    queryFn: () => topicsApi.getContentApi(path),
    retry: false,
  });
}

export function useContentPath() {
  return useLocation().pathname.replace(/^\/+|\/+$/g, '');
}

function Breadcrumb({ items }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-text-tertiary"
    >
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
          {index > 0 && <FaChevronRight aria-hidden="true" className="text-[11px]" />}
          {item.to ? (
            <Link to={item.to} className="transition hover:text-text">
              {item.label}
            </Link>
          ) : (
            <span className="text-text">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <div className="h-3 w-36 animate-pulse rounded bg-surface-tertiary" />
      <div className="mt-8 h-12 w-2/3 animate-pulse rounded bg-surface-tertiary" />
      <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-surface-tertiary" />
      <div className="mt-12 h-64 animate-pulse rounded-card bg-surface-tertiary/70" />
    </div>
  );
}

export function NotFound({ message = 'Page not found' }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-heading text-[42px] font-normal leading-[1.02] tracking-[-0.02em] sm:text-[52px]">
        {message}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-[14.5px] leading-[1.7] text-text-secondary">
        The page you were looking for is not here, or it has not been published yet.
      </p>
      <Button as={Link} to="/" className="mt-8">
        <FaArrowRight aria-hidden="true" className="text-[16px]" />
        Explore topics
      </Button>
    </div>
  );
}

function ArticleList({ basePath, articles }) {
  if (articles.length === 0) {
    return (
      <p className="m-0 px-5 py-5 text-[13px] text-text-secondary">
        No articles published here yet.
      </p>
    );
  }

  return (
    <ul className="m-0 list-none p-0">
      {articles.map((article) => (
        <li key={article.id} className="border-t border-border-secondary first:border-t-0">
          <Link
            to={`/${basePath}/${article.slug}`}
            className="group flex items-start gap-4 px-5 py-4 transition hover:bg-surface-secondary/70"
          >
            <span className="mt-1.5 text-text-tertiary">
              <FaFileLines aria-hidden="true" className="text-[15px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold leading-snug tracking-[-0.01em] text-text transition group-hover:text-brand">
                {article.title}
              </span>
              {article.subtitle && (
                <span className="mt-1 block text-[13px] leading-relaxed text-text-secondary">
                  {article.subtitle}
                </span>
              )}
              {article.publishedAt && (
                <span className="mt-1.5 block text-[11.5px] text-text-tertiary">
                  {formatDate(article.publishedAt, { month: 'short' })}
                </span>
              )}
            </span>
            <FaArrowRight
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-[15px] text-text-tertiary transition group-hover:text-brand"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function TopicPage() {
  const path = useContentPath();
  const { data, isLoading, isError, error } = useContent(path);
  const [openSubtopic, setOpenSubtopic] = useState(null);
  useReveal();

  if (isLoading) return <Loading />;
  if (isError) {
    return <NotFound message={error.status === 404 ? 'Topic not found' : 'This page could not load'} />;
  }
  if (data.type !== 'topic') return <NotFound />;

  const { topic, subtopics = [], articles = [] } = data;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: topic.name }]} />

      <header className="mt-5 border-b border-border pb-8">
        <h1 className="max-w-3xl font-heading text-[44px] font-normal leading-[0.98] tracking-[-0.025em] sm:text-[58px]">
          {topic.name}
        </h1>
        {topic.description && (
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.75] text-text-secondary">
            {topic.description}
          </p>
        )}
      </header>

      {subtopics.length > 0 && (
        <section className="mt-12">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="m-0 font-heading text-[28px] font-normal tracking-[-0.015em]">
              What you will cover
            </h2>
            <span className="text-[12px] text-text-tertiary">
              {subtopics.length} section{subtopics.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="mt-6 border-t border-border">
            {subtopics.map((subtopic, index) => {
              const open = openSubtopic === subtopic.id;
              const basePath = `${topic.slug}/${subtopic.slug}`;
              const count = subtopic.articles.length;

              return (
                <div key={subtopic.id} className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => setOpenSubtopic(open ? null : subtopic.id)}
                    aria-expanded={open}
                    aria-controls={`subtopic-${subtopic.id}`}
                    className="flex w-full items-start gap-4 py-5 text-left transition hover:bg-surface/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
                  >
                    <span className="mt-1 shrink-0 text-[12px] tabular-nums text-text-tertiary">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-semibold leading-snug tracking-[-0.01em] text-text">
                        {subtopic.name}
                      </span>
                      {subtopic.description && (
                        <span className="mt-1 block max-w-xl text-[13px] leading-[1.65] text-text-secondary">
                          {subtopic.description}
                        </span>
                      )}
                    </span>

                    <span className="mt-1 hidden shrink-0 text-[12px] text-text-tertiary sm:block">
                      {count} article{count === 1 ? '' : 's'}
                    </span>

                    <FaChevronDown
                      aria-hidden="true"
                      className={`mt-0.5 shrink-0 text-[15px] text-text-tertiary transition-transform ${
                        open ? '' : '-rotate-90'
                      }`}
                    />
                  </button>

                  {open && (
                    <div
                      id={`subtopic-${subtopic.id}`}
                      className="border-t border-border-secondary bg-surface-secondary/60"
                    >
                      <ArticleList basePath={basePath} articles={subtopic.articles} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="mt-12">
          <h2 className="m-0 font-heading text-[28px] font-normal tracking-[-0.015em]">
            Articles in {topic.name}
          </h2>
          <Card className="mt-5 overflow-hidden border border-border">
            <ArticleList basePath={topic.slug} articles={articles} />
          </Card>
        </section>
      )}

      {subtopics.length === 0 && articles.length === 0 && (
        <p className="mt-10 rounded-card border border-dashed border-border px-5 py-10 text-center text-[13.5px] text-text-secondary">
          Nothing has been published in this topic yet.
        </p>
      )}
    </div>
  );
}
