import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import hljs from 'highlight.js/lib/common';
import { ArticleAnnotationHtml } from './ArticleAnnotationHtml.jsx';
import { renderArticleDocToHtml } from './articleDocument.js';

function DiagramFullscreen({ diagram, onClose }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-ink/90 p-3 backdrop-blur-sm sm:p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={diagram.alt || 'Diagram preview'}
        onClick={(event) => event.stopPropagation()}
        className="flex min-w-0 max-h-full w-full max-w-7xl flex-col overflow-hidden rounded-card border border-ink-soft bg-ink-secondary"
      >
        <div className="flex items-center justify-between gap-3 border-b border-ink-soft px-4 py-3">
          <p className="m-0 truncate text-[12.5px] font-medium text-ink-text">
            {diagram.alt || 'Diagram'}
          </p>
          <button
            autoFocus
            type="button"
            onClick={onClose}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-button border border-white/15 bg-white/10 px-2.5 text-[11.5px] font-semibold text-ink-text transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
          >
            Close
            <span aria-hidden="true" className="text-[15px] leading-none">×</span>
          </button>
        </div>
        <div className="min-h-0 min-w-0 w-full flex-1 overflow-auto bg-ink p-2 sm:p-4">
          <img
            src={diagram.src}
            alt={diagram.alt || 'Diagram'}
            className="mx-auto block h-auto max-h-[calc(100vh-8rem)] w-auto max-w-full rounded-field object-contain"
          />
          {diagram.caption && (
            <p className="mx-auto mt-2 max-w-3xl px-2 text-center text-[11.5px] leading-relaxed text-ink-muted">
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
  const bodyHtml = useMemo(() => (doc ? renderArticleDocToHtml(doc) : ''), [doc]);
  const [fullscreenDiagram, setFullscreenDiagram] = useState(null);
  const closeFullscreen = useCallback(() => setFullscreenDiagram(null), []);

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

  if (!bodyHtml.trim()) return null;

  function onBodyClick(event) {
    const trigger = event.target.closest?.('[data-diagram-open]');
    if (!trigger || !containerRef.current?.contains(trigger)) return;

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
    <div ref={containerRef} onClick={onBodyClick} className="article-prose">
      <ArticleAnnotationHtml html={bodyHtml} />
      {fullscreenDiagram && (
        <DiagramFullscreen diagram={fullscreenDiagram} onClose={closeFullscreen} />
      )}
    </div>
  );
}
