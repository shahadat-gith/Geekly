import { useEffect, useState } from 'react';
import { FaBars, FaXmark } from 'react-icons/fa6';
import Sidebar from '../components/article/Sidebar.jsx';
import Content from '../components/article/Content.jsx';
import Videos from '../components/article/Videos.jsx';
import PageSkeleton, { ArticleSkeleton } from '../components/article/PageSkeleton.jsx';
import { NotFound } from '../components/ui/NotFound.jsx';
import { useArticle, useArticlePath, useTopic } from '../hooks/useArticle.js';
import { useReveal } from '../hooks/useReveal.js';

export default function Article() {
  const { topicSlug, articleSlug, validPath } = useArticlePath();
  const [navOpen, setNavOpen] = useState(false);

  const { data: page, isLoading, isError, error } = useTopic(validPath ? topicSlug : '');

  const { topic = null, subtopics = [], articles = [], defaultArticle = null } = page ?? {};

  // Every article link in the sidebar carries its id, so a click fetches the
  // article directly instead of re-resolving the whole page.
  const listing = [...articles, ...subtopics.flatMap((subtopic) => subtopic.articles)];
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

  useEffect(() => {
    if (!navOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKeyDown(event) {
      if (event.key === 'Escape') setNavOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [navOpen]);

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <NotFound message={error?.status === 404 ? 'Page not found' : 'This page could not load'} />
    );
  }

  if (!topic || !validPath || (articleSlug && !selected) || articleFailed) {
    return <NotFound />;
  }

  const activePath = article ? `/${topic.slug}/${article.slug}` : null;
  const videos = article?.referenceVideos || [];
  const closeNav = () => setNavOpen(false);

  return (
    <div
      className={`mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 lg:py-12 ${videos.length > 0 ? 'xl:grid-cols-[240px_minmax(0,1fr)_280px]' : ''
        }`}
    >
      <Sidebar topic={topic} subtopics={subtopics} articles={articles} activePath={activePath} />

      <div className="min-w-0">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={navOpen}
          className="inline-flex items-center gap-2 rounded-button border border-border bg-surface px-3 py-2 text-[13px] font-semibold text-text transition hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft lg:hidden"
        >
          <FaBars aria-hidden="true" className="text-[12px]" />
          Contents
        </button>

        {article ? (
          <Content article={article} topic={topic} />
        ) : articleLoading ? (
          <ArticleSkeleton />
        ) : (
          <Content article={null} topic={topic} />
        )}

        {videos.length > 0 && (
          <div className="mt-10 max-w-3xl xl:hidden">
            <Videos videos={videos} />
          </div>
        )}
      </div>

      {videos.length > 0 && (
        <aside className="hidden xl:sticky xl:top-24 xl:block xl:h-fit">
          <Videos videos={videos} />
        </aside>
      )}

      {navOpen && (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={closeNav} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${topic.name} contents`}
            className="absolute inset-y-0 left-0 w-[86%] max-w-xs overflow-y-auto border-r border-border bg-surface p-4 shadow-dropdown"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                Contents
              </p>
              <button
                autoFocus
                type="button"
                onClick={closeNav}
                aria-label="Close contents"
                className="inline-flex h-8 w-8 items-center justify-center rounded-button border border-border text-text-secondary transition hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
              >
                <FaXmark aria-hidden="true" className="text-[13px]" />
              </button>
            </div>
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
      )}
    </div>
  );
}
