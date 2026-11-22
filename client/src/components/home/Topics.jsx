import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa6';

import { topicsApi } from '../../api/index.js';

function TopicThumb({ topic }) {
  const [failed, setFailed] = useState(false);

  if (!topic.coverImage?.url || failed) return null;

  return (
    <img
      src={topic.coverImage.url}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="hidden h-[60px] w-24 shrink-0 rounded-button border border-border bg-surface-secondary object-cover sm:block"
    />
  );
}

function TopicRow({ topic, index }) {
  return (
    <li className="border-b border-border first:border-t">
      <Link
        to={`/${topic.slug}`}
        className="group flex items-start gap-4 px-2 py-6 transition-colors hover:bg-surface sm:gap-6 sm:px-4"
      >
        <span className="mt-1 w-6 shrink-0 font-mono text-[12px] tabular-nums text-text-secondary">
          {String(index + 1).padStart(2, '0')}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-medium leading-snug text-text">
            {topic.name}
          </span>

          {topic.description && (
            <span className="mt-1.5 block max-w-2xl text-[13.5px] leading-[1.65] text-text-secondary">
              {topic.description}
            </span>
          )}
        </span>

        <TopicThumb topic={topic} />

        <FaArrowRight
          aria-hidden="true"
          className="mt-1 shrink-0 text-[12px] text-text-tertiary transition-colors group-hover:text-brand-strong"
        />
      </Link>
    </li>
  );
}

function TopicSkeletonRow() {
  return (
    <li className="animate-pulse border-b border-border first:border-t">
      <div className="flex items-start gap-4 px-2 py-6 sm:gap-6 sm:px-4">
        <div className="mt-1 h-3 w-6 shrink-0 rounded bg-skeleton" />
        <div className="min-w-0 flex-1">
          <div className="h-4 w-44 rounded bg-skeleton" />
          <div className="mt-3 h-3 w-full max-w-md rounded bg-skeleton" />
        </div>
        <div className="hidden h-[60px] w-24 shrink-0 rounded-button bg-skeleton-strong sm:block" />
      </div>
    </li>
  );
}

export function Topics() {
  // Fetch only parent topics. Child topics are not rendered in this section.
  const {
    data: topics = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['topics', 'parents'],
    queryFn: topicsApi.listParentTopicsApi,
  });

  const hasTopics = topics.length > 0;

  return (
    <section
      id="topics"
      aria-labelledby="topics-heading"
      className="scroll-mt-20 border-t border-border"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <div>
            <h2
              id="topics-heading"
              className="m-0 max-w-[24ch] text-balance font-heading text-[32px] font-medium leading-[1.12] tracking-[-0.025em] text-text sm:text-[38px]"
            >
              Engineering topics
            </h2>

            <p className="mt-4 max-w-[54ch] text-[14.5px] leading-[1.7] text-text-secondary sm:text-[15px]">
              Each topic has lessons with diagrams and examples. Start with the
              basics, or open the one you need right now.
            </p>
          </div>

          {hasTopics && (
            <p className="m-0 font-mono text-[12px] tabular-nums text-text-secondary">
              {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
            </p>
          )}
        </div>

        {isLoading ? (
          <ul
            aria-label="Loading topics"
            role="status"
            className="m-0 mt-10 list-none p-0"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <TopicSkeletonRow key={index} />
            ))}
          </ul>
        ) : isError ? (
          <div
            role="status"
            className="mt-10 rounded-panel border border-border bg-surface px-6 py-8"
          >
            <p className="m-0 text-[14px] font-medium text-text">
              Topics are temporarily unavailable
            </p>
            <p className="m-0 mt-1 text-[13px] text-text-secondary">
              Try again in a little while.
            </p>
          </div>
        ) : hasTopics ? (
          <ul
            aria-label="Available engineering topics"
            className="m-0 mt-10 list-none p-0"
          >
            {topics.map((topic, index) => (
              <TopicRow key={topic.id} topic={topic} index={index} />
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-panel border border-dashed border-border bg-surface px-6 py-8">
            <p className="m-0 text-[14px] font-medium text-text">
              No topics published yet
            </p>
            <p className="m-0 mt-1 text-[13px] text-text-secondary">
              New lessons will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
