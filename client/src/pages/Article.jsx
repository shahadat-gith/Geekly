import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaXmark } from 'react-icons/fa6';

import Sidebar from '../components/article/Sidebar.jsx';
import Content from '../components/article/Content.jsx';
import Videos from '../components/article/Videos.jsx';
import PageSkeleton, {
  ArticleSkeleton,
} from '../components/article/PageSkeleton.jsx';

import { NotFound } from '../components/ui/NotFound.jsx';
import { useArticle, useArticlePath, useTopic } from '../hooks/useArticle.js';
import { useReveal } from '../hooks/useReveal.js';

export default function Article() {
  const { topicSlug, articleSlug, validPath } = useArticlePath();
  const [navOpen, setNavOpen] = useState(false);

  const {
    data: page,
    isLoading,
    isError,
    error,
  } = useTopic(validPath ? topicSlug : '');

  const {
    topic = null,
    subtopics = [],
    articles = [],
    defaultArticle = null,
  } = page ?? {};

  const listing = [
    ...articles,
    ...subtopics.flatMap((subtopic) => subtopic.articles),
  ];

  const selected = articleSlug
    ? listing.find((item) => item.slug === articleSlug) ?? null
    : null;

  const isDefault = !selected || selected.id === defaultArticle?.id;

  const {
    data: fetchedArticle,
    isLoading: articleLoading,
    isError: articleFailed,
  } = useArticle(selected && !isDefault ? selected.id : null);

  const article = isDefault ? defaultArticle : fetchedArticle ?? null;

  useReveal();

  // Lock background scrolling while the mobile drawer is open.
  useEffect(() => {
    if (!navOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setNavOpen(false);
      }
    }

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [navOpen]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError) {
    return (
      <NotFound
        message={
          error?.status === 404
            ? 'Page not found'
            : 'This page could not load'
        }
      />
    );
  }

  if (
    !topic ||
    !validPath ||
    (articleSlug && !selected) ||
    articleFailed
  ) {
    return <NotFound />;
  }

  const activePath = article
    ? `/${topic.slug}/${article.slug}`
    : null;

  const videos = article?.referenceVideos || [];
  const hasVideos = videos.length > 0;

  const closeNav = () => setNavOpen(false);

  return (
    <div
      className={[
        'mx-auto grid w-full min-w-0 grid-cols-1 gap-8',
        'max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10',
        'lg:grid-cols-[248px_minmax(0,1fr)]',
        hasVideos ? 'xl:grid-cols-[256px_minmax(0,1fr)_240px]' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Desktop topic navigation */}
      <aside className="hidden min-w-0 lg:block">
        <div className="sticky top-20 max-h-[calc(100svh-6rem)] overflow-y-auto overscroll-contain">
          <Sidebar
            topic={topic}
            subtopics={subtopics}
            articles={articles}
            activePath={activePath}
          />
        </div>
      </aside>

      {/* Main article content */}
      <main className="min-w-0">
        {/* Mobile contents bar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 lg:hidden">
          <Link
            to={`/${topic.slug}`}
            className="min-w-0 truncate font-mono text-[11px] uppercase tracking-[0.1em] text-text-tertiary transition-colors hover:text-text"
          >
            {topic.name}
          </Link>

          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={navOpen}
            className="inline-flex min-h-9 items-center gap-2 rounded-button border border-border bg-surface px-3 text-[12.5px] font-medium text-text transition-colors hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <FaBars aria-hidden="true" className="text-[11px] text-text-secondary" />
            Contents
          </button>
        </div>

        {article ? (
          <Content article={article} topic={topic} />
        ) : articleLoading ? (
          <ArticleSkeleton />
        ) : (
          <Content article={null} topic={topic} />
        )}

        {/* Videos below article on smaller screens */}
        {hasVideos && (
          <div className="mt-10 border-t border-border pt-8 xl:hidden">
            <Videos videos={videos} />
          </div>
        )}
      </main>

      {/* Desktop reference videos */}
      {hasVideos && (
        <aside className="hidden min-w-0 xl:block">
          <div className="sticky top-20 max-h-[calc(100svh-6rem)] overflow-y-auto overscroll-contain">
            <Videos videos={videos} />
          </div>
        </aside>
      )}

      {/* Mobile navigation drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <button
            type="button"
            aria-label="Close contents menu"
            onClick={closeNav}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/40"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${topic.name} contents`}
            className="absolute inset-y-0 left-0 flex w-[88%] max-w-[340px] flex-col overflow-hidden border-r border-border bg-surface shadow-dropdown animate-slide-in-left"
          >
            {/* Drawer header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3.5">
              <div className="min-w-0">
                <p className="m-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-tertiary">
                  Contents
                </p>
                <p className="m-0 mt-1 truncate text-sm font-semibold text-text">
                  {topic.name}
                </p>
              </div>

              <button
                autoFocus
                type="button"
                onClick={closeNav}
                aria-label="Close contents"
                className="flex size-9 shrink-0 items-center justify-center rounded-button border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FaXmark aria-hidden="true" className="text-[14px]" />
              </button>
            </div>

            {/* Drawer navigation */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
              <Sidebar
                variant="drawer"
                topic={topic}
                subtopics={subtopics}
                articles={articles}
                activePath={activePath}
                onNavigate={closeNav}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
