import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa6';
import { topicsApi } from '../../api/index.js';

export function ParentTopics() {
  const { data: topics = [], isLoading, isError } = useQuery({
    queryKey: ['topics', 'parents'],
    queryFn: topicsApi.listParentTopicsApi,
  });

  return (
    <section id="topics" className="mx-auto max-w-6xl scroll-mt-24 px-6">
      <div className="border-t border-border py-16 sm:py-20">
        <div className="text-left">
          <h2 className="max-w-2xl text-balance font-heading text-[34px] font-normal leading-[1.05] tracking-[-0.02em] sm:text-[42px]">
            Start with a topic
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-[1.7] text-text-secondary">{"Each topic is a set of short lessons. Read them in order, or open the one you need right now."}</p>
        </div>

        {isLoading ? (
          <div className="mt-10 border-t border-border" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border-b border-border py-7">
                <div className="h-5 w-48 animate-pulse rounded bg-surface-tertiary" />
                <div className="mt-3 h-3.5 w-full max-w-lg animate-pulse rounded bg-surface-tertiary" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <p role="status" className="mt-10 border-t border-border py-8 text-[14px] text-text-secondary">
            Topics are temporarily unavailable.
          </p>
        ) : topics.length > 0 ? (
          <ul className="mt-10 list-none border-t border-border p-0">
            {topics.map((topic) => (
              <li key={topic.id} className="border-b border-border">
                <Link
                  to={`/${topic.slug}`}
                  className="group -mx-4 flex items-start justify-between gap-6 rounded-button px-4 py-6 transition hover:bg-surface/70 sm:items-center sm:py-7"
                >
                  <div className="min-w-0">
                    <h3 className="font-heading text-[26px] font-normal leading-none tracking-[-0.015em] transition group-hover:text-brand sm:text-[30px]">
                      {topic.name}
                    </h3>
                    <p className="mt-2 max-w-2xl text-[13.5px] leading-[1.65] text-text-secondary">
                      {topic.description}
                    </p>
                  </div>
                  <FaChevronRight
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-[16px] text-text-tertiary transition duration-300 group-hover:translate-x-1 group-hover:text-brand sm:mt-0"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
