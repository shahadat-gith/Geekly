import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa6';

import { ArticleBody } from './ArticleBody.jsx';
import { formatDate } from '../../utils/format.js';

function Breadcrumb({ topic, articleTitle }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
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
          <h1 className="mt-5 max-w-3xl text-pretty font-heading text-[28px] font-medium leading-[1.18] tracking-[-0.03em] text-text sm:text-[36px] lg:text-[38px]">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-text-secondary">
              {article.subtitle}
            </p>
          )}

          {/* Article metadata */}
          {article.publishedAt && (
            <p className="m-0 mt-6 font-mono text-[11px] tabular-nums text-text-tertiary">
              {formatDate(article.publishedAt)}
            </p>
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

        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-brand" />
          <p className="folio m-0">Topic</p>
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>

        <h1 className="mt-5 max-w-3xl text-pretty font-heading text-[28px] font-medium leading-[1.18] tracking-[-0.03em] text-text sm:text-[36px] lg:text-[38px]">
          {topic.name}
        </h1>

        {topic.description && (
          <p className="mt-4 max-w-2xl text-[14px] leading-[1.8] text-text-secondary sm:text-[15px]">
            {topic.description}
          </p>
        )}
      </header>

      {/* Empty state */}
      <div className="mt-10 border-t border-border pt-8">
        <h2 className="m-0 font-heading text-[18px] font-medium tracking-[-0.015em] text-text">
          Lessons are on the way
        </h2>

        <p className="mt-2 max-w-md text-[13.5px] leading-[1.75] text-text-secondary">
          There are no published articles in this topic yet. Check back soon.
        </p>
      </div>
    </section>
  );
}
