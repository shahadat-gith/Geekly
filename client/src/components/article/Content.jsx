import { ArticleBody } from './ArticleBody.jsx';
import { formatDate } from '../../utils/format.js';

// The middle column: the article the API resolved for this URL, or the topic's
// empty state when it has no published articles.
export default function Content({ article = null, topic }) {
  if (article) {
    return (
      <article className="mt-6 max-w-3xl">
        <header className="border-b border-border pb-8">
          <h1 className="text-balance font-heading text-[32px] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[40px]">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="mt-4 text-[15.5px] leading-[1.75] text-text-secondary">
              {article.subtitle}
            </p>
          )}
          {article.publishedAt && (
            <p className="mt-4 text-[12.5px] text-text-tertiary">{formatDate(article.publishedAt)}</p>
          )}
        </header>

        <div className="mt-7">
          <ArticleBody doc={article.content || null} />
        </div>
      </article>
    );
  }

  return (
    <header className="mt-6 border-b border-border pb-8">
      <h1 className="text-balance font-heading text-[32px] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[40px]">
        {topic.name}
      </h1>
      {topic.description && (
        <p className="mt-4 max-w-3xl text-[15px] leading-[1.75] text-text-secondary">
          {topic.description}
        </p>
      )}
      <p className="mt-8 rounded-card border border-dashed border-border px-5 py-10 text-center text-[13.5px] text-text-secondary">
        Nothing has been published in this topic yet.
      </p>
    </header>
  );
}
