
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    FaArrowRight,
    FaChevronLeft,
    FaChevronRight,
} from 'react-icons/fa6';

import { topicsApi } from '../../api/index.js';
import { IconButton } from '../ui/IconButton.jsx';

const CARD_GAP = 16;

function TopicCover({ topic }) {
    if (topic.coverImage?.url) {
        return (
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-surface-secondary">
                <img
                    src={topic.coverImage.url}
                    alt=""
                    className="h-full w-full object-contain"
                    loading="lazy"
                />
            </div>
        );
    }

    return (
        <div
            aria-hidden="true"
            className="flex aspect-[16/10] w-full items-center justify-center bg-brand-soft"
        >
            <span className="font-heading text-[40px] font-semibold leading-none text-[#527C42]">
                {topic.name.slice(0, 1).toUpperCase()}
            </span>
        </div>
    );
}

function TopicCard({ topic }) {
    return (
        <li
            data-topic-card
            className="w-[268px] shrink-0 snap-start sm:w-[300px]"
        >
            <Link
                to={`/${topic.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
            >
                <div className="overflow-hidden">
                    <TopicCover topic={topic} />
                </div>

                <div className="flex min-h-[160px] flex-1 flex-col p-5">
                    <h3 className="m-0 font-heading text-[20px] font-semibold leading-[1.25] tracking-[-0.025em] text-text transition-colors group-hover:text-[#527C42]">
                        {topic.name}
                    </h3>

                    {topic.description && (
                        <p className="m-0 mt-2 line-clamp-2 text-[13px] leading-[1.65] text-text-secondary">
                            {topic.description}
                        </p>
                    )}

                    <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[12.5px] font-semibold text-[#527C42]">
                        Explore topic
                        <FaArrowRight
                            aria-hidden="true"
                            className="text-[11px] transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </span>
                </div>
            </Link>
        </li>
    );
}

function TopicSkeleton() {
    return (
        <div
            className="w-[268px] shrink-0 overflow-hidden rounded-card border border-border bg-surface sm:w-[300px]"
        >
            <div className="aspect-[16/10] w-full animate-pulse bg-skeleton-strong" />

            <div className="flex min-h-[160px] flex-1 flex-col p-5">
                <div className="h-5 w-40 animate-pulse rounded-md bg-skeleton" />
                <div className="mt-3 h-3 w-full animate-pulse rounded bg-skeleton" />
                <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-skeleton" />
                <div className="mt-auto h-3 w-24 animate-pulse rounded bg-skeleton" />
            </div>
        </div>
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

    const scrollerRef = useRef(null);
    const [edges, setEdges] = useState({
        start: true,
        end: true,
    });

    const measure = useCallback(() => {
        const element = scrollerRef.current;
        if (!element) return;

        setEdges({
            start: element.scrollLeft <= 1,
            end:
                element.scrollLeft + element.clientWidth >=
                element.scrollWidth - 1,
        });
    }, []);

    useEffect(() => {
        const element = scrollerRef.current;

        measure();
        if (!element) return;

        element.addEventListener('scroll', measure, { passive: true });
        window.addEventListener('resize', measure);

        return () => {
            element.removeEventListener('scroll', measure);
            window.removeEventListener('resize', measure);
        };
    }, [measure, topics.length, isLoading]);

    const scrollTopics = (direction) => {
        const element = scrollerRef.current;
        if (!element) return;

        const firstCard = element.querySelector('[data-topic-card]');
        const step = firstCard
            ? firstCard.getBoundingClientRect().width + CARD_GAP
            : element.clientWidth * 0.8;

        element.scrollBy({
            left: direction * step,
            behavior: 'smooth',
        });
    };

    const hasTopics = topics.length > 0;
    const canScroll = hasTopics && !(edges.start && edges.end);

    return (
        <section
            id="topics"
            aria-labelledby="topics-heading"
            className="mx-auto max-w-6xl scroll-mt-24 px-6"
        >
            <div className="border-t border-border py-16 sm:py-20">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#527C42]">
                            Learn and explore
                        </span>

                        <h2
                            id="topics-heading"
                            className="mt-3 max-w-2xl text-balance font-heading text-[30px] font-semibold leading-[1.15] tracking-[-0.035em] text-text sm:text-[36px]"
                        >
                            Build a stronger engineering foundation.
                        </h2>

                        <p className="mt-3 max-w-xl text-[14px] leading-[1.75] text-text-secondary sm:text-[15px]">
                            Explore engineering topics through focused lessons,
                            practical examples, and clear explanations. Start with
                            the fundamentals or jump straight into what interests you.
                        </p>
                    </div>

                    {hasTopics && (
                        <div className="flex shrink-0 items-center gap-3">
                            <span className="text-[12px] text-text-tertiary">
                                {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
                            </span>

                            <div className="flex items-center gap-1.5">
                                <IconButton
                                    label="Scroll topics left"
                                    onClick={() => scrollTopics(-1)}
                                    disabled={!canScroll || edges.start}
                                    className="border border-border bg-surface hover:border-border-focus/60"
                                >
                                    <FaChevronLeft aria-hidden="true" className="text-[12px]" />
                                </IconButton>

                                <IconButton
                                    label="Scroll topics right"
                                    onClick={() => scrollTopics(1)}
                                    disabled={!canScroll || edges.end}
                                    className="border border-border bg-surface hover:border-border-focus/60"
                                >
                                    <FaChevronRight aria-hidden="true" className="text-[12px]" />
                                </IconButton>
                            </div>
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div
                        className="mt-10 flex gap-4 overflow-hidden"
                        aria-label="Loading topics"
                        role="status"
                    >
                        {Array.from({ length: 3 }).map((_, index) => (
                            <TopicSkeleton key={index} />
                        ))}
                    </div>
                ) : isError ? (
                    <div
                        role="status"
                        className="mt-10 rounded-card border border-border bg-surface px-5 py-8 text-center"
                    >
                        <p className="m-0 text-[14px] font-medium text-text">
                            Topics are temporarily unavailable.
                        </p>
                        <p className="mb-0 mt-1 text-[12px] text-text-tertiary">
                            Please try again in a little while.
                        </p>
                    </div>
                ) : hasTopics ? (
                    <ul
                        ref={scrollerRef}
                        aria-label="Available engineering topics"
                        className="m-0 mt-10 flex snap-x snap-mandatory list-none gap-4 overflow-x-auto p-0 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {topics.map((topic) => (
                            <TopicCard key={topic.id} topic={topic} />
                        ))}
                    </ul>
                ) : (
                    <div className="mt-10 rounded-card border border-dashed border-border bg-surface-secondary px-5 py-10 text-center">
                        <p className="m-0 text-[14px] font-medium text-text">
                            No topics available yet.
                        </p>
                        <p className="mb-0 mt-1 text-[12px] text-text-tertiary">
                            New learning content will appear here.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
