import { useContent, useContentPath, NotFound } from './TopicPage.jsx';
import TopicPage from './TopicPage.jsx';
import ArticlePage from './ArticlePage.jsx';

// One route for all public content URLs. The server decides whether a path
// points at a topic page or an article, so links never need to guess.
export default function ContentPage() {
  const path = useContentPath();
  const { data, isLoading, isError, error } = useContent(path);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="h-4 w-40 animate-pulse rounded bg-surface-secondary" />
        <div className="mt-6 h-56 animate-pulse rounded-card bg-surface-secondary" />
        <div className="mt-8 h-10 w-1/3 animate-pulse rounded bg-surface-secondary" />
      </div>
    );
  }

  if (isError) {
    return <NotFound message={error.status === 404 ? 'Page not found' : 'This page could not load'} />;
  }

  if (data.type === 'article') return <ArticlePage />;
  return <TopicPage />;
}
