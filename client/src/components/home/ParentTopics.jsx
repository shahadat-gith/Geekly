import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa6';
import { topicsApi } from '../../api/index.js';

export function ParentTopics() {
  const { data: topics = [], isLoading, isError } = useQuery({
    queryKey: ['topics', 'parents'],
    queryFn: topicsApi.listParentTopicsApi,
  });

  return (
    <section id="topics" className="mx-auto max-w-6xl scroll-mt-24 px-6">
      <div className="border-t border-border py-16 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="max-w-2xl text-balance font-heading text-[30px] font-semibold leading-[1.15] tracking-[-0.025em] sm:text-[36px]">
              Pick what you need to understand
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-[1.7] text-text-secondary">
              Each topic is a set of short lessons. Read them in order, or jump to the one that
              matches the problem you are facing today.
            </p>
          </div>
          <p className="text-[13px] text-text-tertiary">
            {topics.length > 0 ? `${topics.length} topics to explore` : null}
          </p>
        </div>

        {isLoading ? (
          <div className="mt-10" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border-t border-border py-7">
                <div className="h-6 w-48 animate-pulse rounded bg-surface-tertiary" />
                <div className="mt-3 h-3.5 w-full max-w-lg animate-pulse rounded bg-surface-tertiary" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <p
            role="status"
            className="mt-10 border-t border-border py-8 text-[14px] text-text-secondary"
          >
            Topics are temporarily unavailable.
          </p>
        ) : topics.length > 0 ? (
          <ul className="mt-10 list-none p-0">
            {topics.map((topic) => (
              <li key={topic.id} className="border-t border-border last:border-b">
                <Link
                  to={`/${topic.slug}`}
                  className="group -mx-3 grid items-start gap-3 rounded-button px-3 py-6 transition-colors hover:bg-surface sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-10 sm:px-5 sm:py-7"
                >
                  <div className="min-w-0">
                    <h3 className="font-heading text-[22px] font-semibold leading-[1.25] tracking-[-0.02em] transition-colors group-hover:text-brand sm:text-[25px]">
                      {topic.name}
                    </h3>
                    <p className="mt-2 max-w-2xl text-[13.5px] leading-[1.65] text-text-secondary">
                      {topic.description}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-text-tertiary transition-colors group-hover:text-brand">
                    Read lessons
                    <FaArrowRight
                      aria-hidden="true"
                      className="text-[12px] transition duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
