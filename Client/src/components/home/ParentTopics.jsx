import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { topicsApi } from '../../api/index.js';
import { Card } from '../ui/Card.jsx';
import { IconButton } from '../ui/IconButton.jsx';
import { SectionHeading } from './SectionHeading.jsx';

const SCROLL_DURATION = 650;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function ParentTopics() {
  const stripRef = useRef(null);
  const frameRef = useRef(0);

  const { data: topics = [], isLoading, isError } = useQuery({
    queryKey: ['topics', 'parents'],
    queryFn: topicsApi.listParentTopicsApi,
  });

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  function scrollStrip(direction) {
    const strip = stripRef.current;
    if (!strip) return;

    cancelAnimationFrame(frameRef.current);

    const maxScroll = strip.scrollWidth - strip.clientWidth;
    const start = strip.scrollLeft;
    const target = Math.min(
      Math.max(start + direction * strip.clientWidth * 0.85, 0),
      maxScroll,
    );
    const distance = target - start;
    if (Math.abs(distance) < 1) return;

    const startedAt = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startedAt) / SCROLL_DURATION, 1);
      strip.scrollLeft = start + distance * easeInOutCubic(progress);
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="reveal">
        <SectionHeading
          title="Explore topics"
          lead="Build your engineering foundation with clear, practical guides across the subjects that matter."
        />
      </div>

      {isLoading ? (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-card bg-surface-secondary" />
          ))}
        </div>
      ) : isError ? (
        <p role="status" className="mt-8 text-center text-sm text-text-tertiary">
          Topics are temporarily unavailable.
        </p>
      ) : topics.length > 0 ? (
        <div className="relative mt-12 lg:mt-14">
          <div
            ref={stripRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
          >
            {topics.map((topic) => (
              <Card
                key={topic.id}
                as={Link}
                to={`/${topic.slug}`}
                interactive
                className="w-[16.5rem] shrink-0 snap-start overflow-hidden text-inherit no-underline sm:w-[17.5rem]"
              >
                {topic.coverImage?.url ? (
                  <img
                    src={topic.coverImage.url}
                    alt=""
                    loading="lazy"
                    className="h-36 w-full object-cover"
                  />
                ) : (
                  <div aria-hidden="true" className="h-36 bg-gradient-to-br from-brand-soft to-surface-tertiary" />
                )}
                <div className="p-5">
                  <h3 className="m-0 text-[17px] font-semibold leading-snug">{topic.name}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">
                    {topic.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <IconButton
            label="Scroll topics left"
            shape="round"
            onClick={() => scrollStrip(-1)}
            className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 border border-border bg-surface shadow-card"
          >
            <i aria-hidden="true" className="bx bx-chevron-left" />
          </IconButton>
          <IconButton
            label="Scroll topics right"
            shape="round"
            onClick={() => scrollStrip(1)}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2 border border-border bg-surface shadow-card"
          >
            <i aria-hidden="true" className="bx bx-chevron-right" />
          </IconButton>
        </div>
      ) : null}
    </section>
  );
}
