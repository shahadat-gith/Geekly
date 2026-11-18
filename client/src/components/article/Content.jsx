
import { FaRegCalendar, FaBookOpen } from 'react-icons/fa6';

import { ArticleBody } from './ArticleBody.jsx';
import { formatDate } from '../../utils/format.js';

export default function Content({ article = null, topic }) {
  if (article) {
    return (
      <article className="mt-2 min-w-0 max-w-3xl">
        <header className="border-b border-border/80 pb-7 sm:pb-9">


          {/* Title */}
          <h1 className="
            max-w-3xl text-balance
            font-heading text-[30px]
            font-semibold leading-[1.18]
            tracking-[-0.035em] text-text
            sm:text-[38px] lg:text-[42px]
          ">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="
              mt-4 max-w-2xl
              text-[14.5px] leading-[1.85]
              text-text-secondary
              sm:text-[16px]
            ">
              {article.subtitle}
            </p>
          )}

          {/* Article metadata */}
          {article.publishedAt && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="
                inline-flex items-center gap-2
                rounded-full border border-border
                bg-surface px-3 py-1.5
                text-[11px] font-medium
                text-text-secondary
              ">
                <FaRegCalendar
                  aria-hidden="true"
                  className="text-[10px] text-text-tertiary"
                />
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
      <header className="border-b border-border/80 pb-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#527C42]/15 bg-brand-soft px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-active" />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[#527C42]">
            Learning topic
          </span>
        </div>

        <h1 className="
          max-w-3xl text-balance
          font-heading text-[30px]
          font-semibold leading-[1.18]
          tracking-[-0.035em] text-text
          sm:text-[38px] lg:text-[42px]
        ">
          {topic.name}
        </h1>

        {topic.description && (
          <p className="
            mt-4 max-w-2xl
            text-[14.5px] leading-[1.85]
            text-text-secondary
            sm:text-[16px]
          ">
            {topic.description}
          </p>
        )}
      </header>

      {/* Empty state */}
      <div className="
        mt-8 flex flex-col items-center
        rounded-panel border border-dashed
        border-border bg-surface-secondary
        px-6 py-12 text-center sm:py-16
      ">
        <div className="
          flex h-12 w-12 items-center justify-center
          rounded-2xl border border-[#527C42]/10
          bg-brand-soft text-[#527C42]
        ">
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
