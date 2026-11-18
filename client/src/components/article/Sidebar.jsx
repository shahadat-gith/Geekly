
import { Link } from 'react-router-dom';

const CARD =
  'hidden h-fit w-full overflow-y-auto rounded-card border border-border bg-surface p-4 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100svh-7rem)] lg:w-[280px] xl:w-[300px]';

function ArticleLink({ to, title, active, onNavigate, number }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`
        flex min-w-0 items-start gap-3 rounded-lg px-3 py-2.5
        text-[12.5px] leading-relaxed transition-colors duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-active
        ${active
          ? 'bg-brand-soft font-medium text-[#527C42]'
          : 'text-text-secondary hover:bg-surface-secondary hover:text-text'
        }
      `}
    >
      <span
        className={`mt-px w-5 shrink-0 text-right text-[11px] tabular-nums ${active ? 'font-semibold text-[#527C42]' : 'text-text-tertiary'
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
    <p className="mb-1 px-3 pt-5 text-[10px] font-semibold uppercase tracking-[0.09em] text-text-tertiary first:pt-0">
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
  let articleNumber = 0;

  return (
    <aside
      className={
        variant === 'drawer'
          ? 'min-w-0'
          : CARD
      }
    >
      <Link
        to={`/${topic.slug}`}
        onClick={onNavigate}
        aria-current={activePath === `/${topic.slug}` ? 'page' : undefined}
        className={`
          block rounded-lg px-3 py-2.5 text-[14px] font-semibold
          tracking-[-0.01em] transition-colors
          ${activePath === `/${topic.slug}`
            ? 'bg-brand-soft text-[#527C42]'
            : 'text-text hover:bg-surface-secondary'
          }
        `}
      >
        {topic.name}
      </Link>

      {topic.description && (
        <p className="px-3 pb-2 pt-1 text-[11.5px] leading-relaxed text-text-tertiary">
          {topic.description}
        </p>
      )}

      <nav aria-label={`${topic.name} contents`} className="mt-3">
        {articles.length > 0 && (
          <div>
            <SectionLabel>Articles</SectionLabel>
            <ul className="m-0 list-none space-y-0.5 p-0">
              {articles.map((article) => {
                const to = `/${topic.slug}/${article.slug}`;
                articleNumber += 1;

                return (
                  <li key={article.id}>
                    <ArticleLink
                      to={to}
                      title={article.title}
                      number={articleNumber}
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
                articleNumber += 1;

                return (
                  <li key={article.id}>
                    <ArticleLink
                      to={to}
                      title={article.title}
                      number={articleNumber}
                      active={activePath === to}
                      onNavigate={onNavigate}
                    />
                  </li>
                );
              })}

              {subtopic.articles.length === 0 && (
                <li className="px-3 py-2 text-[11px] text-text-tertiary">
                  No articles yet
                </li>
              )}
            </ul>
          </div>
        ))}

        {subtopics.length === 0 && articles.length === 0 && (
          <p className="px-3 py-3 text-[11.5px] leading-relaxed text-text-tertiary">
            Nothing has been published in this topic yet.
          </p>
        )}
      </nav>
    </aside>
  );
}
