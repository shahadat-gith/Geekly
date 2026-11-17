import { Link } from 'react-router-dom';

const CARD =
  'hidden h-fit overflow-y-auto rounded-card border border-border bg-surface p-4 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)]';

function ArticleLink({ to, title, active, onNavigate }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`block rounded-button px-2.5 py-1.5 text-[12.5px] leading-snug transition-colors ${
        active
          ? 'bg-brand-soft font-medium text-brand'
          : 'text-text-secondary hover:bg-surface-secondary hover:text-text'
      }`}
    >
      {title}
    </Link>
  );
}

// Topic details plus its sections and articles. Rendered as the sticky card on
// desktop and, with variant="drawer", inside the mobile contents panel.
// Article URLs are /topic/article-slug, so every link is built the same way.
export default function Sidebar({
  topic,
  subtopics = [],
  articles = [],
  activePath,
  variant = 'card',
  onNavigate,
}) {
  return (
    <aside className={variant === 'drawer' ? '' : CARD}>
      <Link
        to={`/${topic.slug}`}
        onClick={onNavigate}
        className="block rounded-button px-2.5 text-[14px] font-semibold tracking-[-0.01em] text-text transition-colors hover:text-brand"
      >
        {topic.name}
      </Link>
      {topic.description && (
        <p className="mt-1.5 px-2.5 text-[11.5px] leading-relaxed text-text-tertiary">
          {topic.description}
        </p>
      )}

      <nav aria-label={`${topic.name} contents`} className="mt-4">
        {articles.length > 0 && (
          <ul className="m-0 list-none p-0">
            {articles.map((article) => {
              const to = `/${topic.slug}/${article.slug}`;
              return (
                <li key={article.id}>
                  <ArticleLink
                    to={to}
                    title={article.title}
                    active={activePath === to}
                    onNavigate={onNavigate}
                  />
                </li>
              );
            })}
          </ul>
        )}

        {subtopics.map((subtopic) => (
          <div key={subtopic.id} className="mt-4 first:mt-0">
            <p className="m-0 px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
              {subtopic.name}
            </p>
            <ul className="m-0 mt-1 list-none border-l border-border p-0 pl-2">
              {subtopic.articles.map((article) => {
                const to = `/${topic.slug}/${article.slug}`;
                return (
                  <li key={article.id} className="border-t border-border-secondary first:border-t-0">
                    <ArticleLink
                      to={to}
                      title={article.title}
                      active={activePath === to}
                      onNavigate={onNavigate}
                    />
                  </li>
                );
              })}
              {subtopic.articles.length === 0 && (
                <li className="px-2.5 py-1.5 text-[11.5px] text-text-tertiary">No articles yet</li>
              )}
            </ul>
          </div>
        ))}

        {subtopics.length === 0 && articles.length === 0 && (
          <p className="m-0 px-2.5 py-2 text-[11.5px] text-text-tertiary">
            Nothing has been published in this topic yet.
          </p>
        )}
      </nav>
    </aside>
  );
}
