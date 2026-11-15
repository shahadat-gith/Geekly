import { Link } from 'react-router-dom';
import { Card } from '../ui/Card.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { StatusBadge } from '../ui/Badge.jsx';
import { relativeTime } from '../../utils/format.js';

export function RecentArticles({ articles = [] }) {
  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-[14.5px] font-semibold text-text">Recent articles</h2>
          <p className="m-0 mt-1 text-[11.5px] text-text-tertiary">
            The latest edits across the library
          </p>
        </div>
        <Link
          to="/articles"
          className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-text-secondary transition hover:text-brand"
        >
          View all
          <i aria-hidden="true" className="bx bx-right-arrow-alt text-[15px]" />
        </Link>
      </div>

      {articles.length === 0 ? (
        <EmptyState
          compact
          icon="bx-file-blank"
          title="No articles yet"
          description="Your first article will appear here after you write it."
          action={
            <Link
              to="/articles/new"
              className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand"
            >
              Write an article
              <i aria-hidden="true" className="bx bx-right-arrow-alt text-[14px]" />
            </Link>
          }
        />
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border-secondary">
                <th className="pb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                  Article
                </th>
                <th className="pb-2.5 pl-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                  Topic
                </th>
                <th className="pb-2.5 pl-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                  Status
                </th>
                <th className="pb-2.5 pl-3 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr
                  key={article.id}
                  className="group border-b border-border-secondary/70 last:border-0"
                >
                  <td className="max-w-[240px] py-3 pr-3">
                    <Link
                      to={`/articles/${article.id}/edit`}
                      className="block truncate text-[12.5px] font-semibold text-text transition group-hover:text-brand"
                    >
                      {article.title}
                    </Link>
                    <p className="m-0 mt-0.5 truncate text-[10.5px] text-text-tertiary">
                      {article.subtitle || 'No subtitle'}
                    </p>
                  </td>
                  <td className="py-3 pl-3 text-[11.5px] text-text-secondary">
                    {article.topic?.name || '—'}
                  </td>
                  <td className="py-3 pl-3">
                    <StatusBadge status={article.status} />
                  </td>
                  <td className="py-3 pl-3 text-right text-[11px] whitespace-nowrap text-text-tertiary">
                    {relativeTime(article.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
