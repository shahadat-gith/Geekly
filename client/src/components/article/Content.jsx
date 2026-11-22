import { Link } from 'react-router-dom';
import { FaRegCalendar, FaBookOpen, FaChevronRight } from 'react-icons/fa6';

import { ArticleBody } from './ArticleBody.jsx';
import { formatDate } from '../../utils/format.js';

function Breadcrumb({ topic, articleTitle }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="m-0 flex flex-wrap items-center gap-1.5 list-none p-0 text-[12.5px]">
        <li>
          <Link
            to="/"
            className="text-text-secondary transition-colors hover:text-brand-strong focus-visible:outline-none"
          >
            Home
          </Link>
        </li>
        <li aria-hidden="true" className="flex items-center gap-1.5 text-text-disabled">
          <FaChevronRight className="text-[9px]" />
        </li>
        <li>
          <Link
            to={`/${topic.slug}`}
            aria-current={articleTitle ? undefined : 'page'}
            className={`transition-colors hover:text-brand-strong focus-visible:outline-none ${articleTitle ? 'text-text-secondary' : 'font-medium text-text'}`}
          >
            {topic.name}
          </Link>
        </li>
        {articleTitle && (
          <>
            <li aria-hidden="true" className="flex items-center gap-1.5 text-text-disabled">
              <FaChevronRight className="text-[9px]" />
            </li>
            <li aria-current="page" className="max-w-[220px] truncate font-medium text-text sm:max-w-xs">
              {articleTitle}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}

export default function Content({ article = null, topic }) {
  if (article) {
    return (
      <article className="mt-2 min-w-0 max-w-3xl">
        <header className="border-b border-border pb-6 sm:pb-8">
          <Breadcrumb topic={topic} articleTitle={article.title} />

          {/* Title */}
          <h1 className="max-w-3xl text-pretty font-heading text-[28px] font-semibold leading-[1.18] tracking-[-0.03em] text-text sm:text-[36px] lg:text-[38px]">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="mt-4 max-w-2xl text-[14px] leading-[1.8] text-text-secondary sm:text-[15px]">
              {article.subtitle}
            </p>
          )}

          {/* Article metadata */}
          {article.publishedAt && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-[11px] text-text-secondary">
                <FaRegCalendar aria-hidden="true" className="text-[10px] text-text-tertiary" />
                {formatDate(article.publishedAt)}
              </span>
            </div>
          )}
        </header>

        {/* Article body */}
        <div className="mt-7 sm:mt-9">
          <ArticleBody doc={article.content || null} />
        </div>
      </article>
    );
  }

  return (
    <section className="mt-2 min-w-0">
      <header className="border-b border-border pb-8">
        <Breadcrumb topic={topic} />

        <p className="eyebrow m-0">Learning topic</p>

        <h1 className="mt-3 max-w-3xl text-pretty font-heading text-[28px] font-semibold leading-[1.18] tracking-[-0.03em] text-text sm:text-[36px] lg:text-[38px]">
          {topic.name}
        </h1>

        {topic.description && (
          <p className="mt-4 max-w-2xl text-[14px] leading-[1.8] text-text-secondary sm:text-[15px]">
            {topic.description}
          </p>
        )}
      </header>

      {/* Empty state */}
      <div className="mt-8 flex flex-col items-center rounded-panel border border-dashed border-border bg-surface px-6 py-12 text-center sm:py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-strong/15 bg-brand-soft text-brand-strong">
          <FaBookOpen aria-hidden="true" className="text-lg" />
        </div>

        <h2 className="mt-5 text-[15px] font-semibold text-text">
          Lessons are on the way
        </h2>

        <p className="mt-2 max-w-sm text-[13px] leading-[1.75] text-text-secondary">
          There are no published articles in this topic yet.
          Check back soon for new learning resources.
        </p>
      </div>
    </section>
  );
}
