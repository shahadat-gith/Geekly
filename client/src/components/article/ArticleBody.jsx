
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { FaExpand, FaXmark } from 'react-icons/fa6';
import hljs from 'highlight.js/lib/common';

import { ArticleAnnotationHtml } from './ArticleAnnotationHtml.jsx';
import { renderArticleDocToHtml } from './articleDocument.js';

function DiagramFullscreen({ diagram, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="
        fixed inset-0 z-[120]
        flex items-center justify-center
        bg-ink/85 p-3 backdrop-blur-md
        sm:p-6
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={diagram.alt || 'Diagram preview'}
        className="
          flex max-h-full min-w-0 w-full max-w-7xl
          flex-col overflow-hidden
          rounded-panel border border-white/10
          bg-ink-secondary shadow-2xl
          animate-fade-in
        "
      >
        {/* Viewer header */}
        <div className="
          flex shrink-0 items-center justify-between gap-4
          border-b border-white/10
          px-4 py-3 sm:px-5
        ">
          <div className="flex min-w-0 items-center gap-3">
            <div className="
              flex h-8 w-8 shrink-0 items-center justify-center
              rounded-button bg-white/10 text-white/75
            ">
              <FaExpand className="text-[12px]" />
            </div>

            <div className="min-w-0">
              <p className="m-0 truncate text-[12.5px] font-semibold text-ink-text">
                {diagram.alt || 'Diagram preview'}
              </p>
              <p className="m-0 mt-0.5 text-[10.5px] text-ink-muted">
                Fullscreen diagram
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close diagram preview"
            className="
              inline-flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-button border border-white/10
              bg-white/5 text-ink-muted
              transition
              hover:border-white/20
              hover:bg-white/10 hover:text-white
              focus-visible:outline-none
              focus-visible:ring-4 focus-visible:ring-white/20
            "
          >
            <FaXmark aria-hidden="true" className="text-[13px]" />
          </button>
        </div>

        {/* Image area */}
        <div className="
          flex min-h-0 min-w-0 flex-1
          flex-col overflow-auto
          bg-ink p-3 sm:p-6
        ">
          <div className="
            flex min-h-0 flex-1
            items-center justify-center
          ">
            <img
              src={diagram.src}
              alt={diagram.alt || 'Diagram'}
              className="
                block h-auto w-auto
                max-h-[calc(100svh-9rem)]
                max-w-full
                rounded-lg
                object-contain
              "
            />
          </div>

          {diagram.caption && (
            <p className="
              mx-auto mb-1 mt-4 max-w-3xl
              px-2 text-center
              text-[11.5px] leading-[1.7]
              text-ink-muted
            ">
              {diagram.caption}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Renders the canonical Tiptap document with live annotations and visuals. */
export function ArticleBody({ doc = null }) {
  const containerRef = useRef(null);

  const bodyHtml = useMemo(
    () => (doc ? renderArticleDocToHtml(doc) : ''),
    [doc],
  );

  const [fullscreenDiagram, setFullscreenDiagram] = useState(null);

  const closeFullscreen = useCallback(() => {
    setFullscreenDiagram(null);
  }, []);

  // Apply syntax highlighting after article HTML is rendered.
  useEffect(() => {
    const root = containerRef.current;

    if (!root) return;

    root.querySelectorAll('pre code').forEach((block) => {
      if (block.dataset.highlighted === 'yes') return;

      try {
        hljs.highlightElement(block);
      } catch {
        // Unknown language classes fall back to unhighlighted text.
      }
    });
  }, [bodyHtml]);

  if (!bodyHtml.trim()) {
    return null;
  }

  function onBodyClick(event) {
    const trigger = event.target.closest?.('[data-diagram-open]');

    if (!trigger || !containerRef.current?.contains(trigger)) {
      return;
    }

    const src = trigger.getAttribute('data-diagram-src');

    if (!src) return;

    event.preventDefault();
    event.stopPropagation();

    setFullscreenDiagram({
      src,
      alt: trigger.getAttribute('data-diagram-alt') || 'Diagram',
      caption: trigger.getAttribute('data-diagram-caption') || '',
    });
  }

  return (
    <div
      ref={containerRef}
      onClick={onBodyClick}
      className="article-prose min-w-0"
    >
      <ArticleAnnotationHtml html={bodyHtml} />

      {fullscreenDiagram && (
        <DiagramFullscreen
          diagram={fullscreenDiagram}
          onClose={closeFullscreen}
        />
      )}
    </div>
  );
}
