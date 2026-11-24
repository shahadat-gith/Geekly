import { Link } from 'react-router-dom';

const RAIL =
  'hidden h-fit w-full lg:sticky lg:top-20 lg:block lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto lg:overscroll-contain lg:w-[248px] lg:border-r lg:border-border lg:pr-4 xl:w-[268px]';

function ArticleLink({ to, title, active, onNavigate, number }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={[
        'group flex min-h-9 min-w-0 items-start gap-2.5 rounded-button px-2.5 py-2 text-[12.5px] leading-snug transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-brand-soft/50 font-medium text-brand-strong'
          : 'text-text-secondary hover:bg-surface-secondary hover:text-text',
      ].join(' ')}
    >
      <span
        className={`mt-px w-4 shrink-0 text-right font-mono text-[10px] tabular-nums ${
          active ? 'text-brand-strong' : 'text-text-tertiary'
        }`}
      >
        {String(number).padStart(2, '0')}
      </span>

      <span className="min-w-0 flex-1 break-words">{title}</span>
    </Link>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="mb-1 mt-5 px-2.5 text-[11px] font-medium text-text-tertiary first:mt-0">
      {children}
    </p>
  );
}

export default function Sidebar({
  topic,
  subtopics = [],
  articles = [],
  activePath,
  variant = 'card',
  onNavigate,
}) {
  // Reading order across the topic: top-level articles first, then subtopics.
  const numberById = new Map(
    [...articles, ...subtopics.flatMap((subtopic) => subtopic.articles)].map(
      (article, index) => [article.id, index + 1],
    ),
  );

  return (
    <aside className={variant === 'drawer' ? 'min-w-0' : RAIL}>
      <Link
        to={`/${topic.slug}`}
        onClick={onNavigate}
        aria-current={activePath === `/${topic.slug}` ? 'page' : undefined}
        className={[
          'block rounded-button px-2.5 py-1.5 text-[13.5px] font-medium tracking-[-0.01em] transition-colors',
          activePath === `/${topic.slug}`
            ? 'text-brand-strong'
            : 'text-text hover:text-brand-strong',
        ].join(' ')}
      >
        {topic.name}
      </Link>

      <nav aria-label={`${topic.name} contents`} className="mt-3">
        {articles.length > 0 && (
          <div>
            <SectionLabel>Articles</SectionLabel>
            <ul className="m-0 list-none space-y-0.5 p-0">
              {articles.map((article) => {
                const to = `/${topic.slug}/${article.slug}`;

                return (
                  <li key={article.id}>
                    <ArticleLink
                      to={to}
                      title={article.title}
                      number={numberById.get(article.id)}
                      active={activePath === to}
                      onNavigate={onNavigate}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {subtopics.map((subtopic) => (
          <div key={subtopic.id}>
            <SectionLabel>{subtopic.name}</SectionLabel>

            <ul className="m-0 list-none space-y-0.5 p-0">
              {subtopic.articles.map((article) => {
                const to = `/${topic.slug}/${article.slug}`;

                return (
                  <li key={article.id}>
                    <ArticleLink
                      to={to}
                      title={article.title}
                      number={numberById.get(article.id)}
                      active={activePath === to}
                      onNavigate={onNavigate}
                    />
                  </li>
                );
              })}

              {subtopic.articles.length === 0 && (
                <li className="px-2.5 py-2 text-[11px] text-text-tertiary">
                  No articles yet
                </li>
              )}
            </ul>
          </div>
        ))}

        {subtopics.length === 0 && articles.length === 0 && (
          <p className="m-0 px-2.5 py-3 text-[11.5px] leading-relaxed text-text-tertiary">
            Nothing has been published in this topic yet.
          </p>
        )}
      </nav>
    </aside>
  );
}
