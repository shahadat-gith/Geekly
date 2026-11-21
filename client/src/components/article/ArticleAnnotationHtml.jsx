
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from '@floating-ui/dom';
import { FaXmark } from 'react-icons/fa6';

import {
  ANNOTATION_KIND_LABELS,
  normalizeAnnotationKind,
} from './articleDocument.js';

function AnnotationPopover({
  annotation,
  anchor,
  popoverRef,
  focusOnOpen,
  onMouseEnter,
  onMouseLeave,
  onClose,
}) {
  const closeRef = useRef(null);

  const [position, setPosition] = useState({
    left: 0,
    top: 0,
    visibility: 'hidden',
  });

  const kind = normalizeAnnotationKind(annotation.kind);
  const label = ANNOTATION_KIND_LABELS[kind];

  useLayoutEffect(() => {
    if (!anchor || !popoverRef.current) return undefined;

    let mounted = true;

    const updatePosition = () => {
      if (!popoverRef.current) return;

      computePosition(anchor, popoverRef.current, {
        placement: 'top',
        strategy: 'fixed',
        middleware: [
          offset(10),
          flip({ padding: 12 }),
          shift({ padding: 12 }),
        ],
      }).then(({ x, y }) => {
        if (!mounted) return;

        setPosition({
          left: x,
          top: y,
          visibility: 'visible',
        });
      });
    };

    const cleanup = autoUpdate(
      anchor,
      popoverRef.current,
      updatePosition,
    );

    return () => {
      mounted = false;
      cleanup();
    };
  }, [anchor, popoverRef]);

  useEffect(() => {
    if (focusOnOpen) {
      closeRef.current?.focus();
    }
  }, [focusOnOpen]);

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`${label} annotation`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      }}
      style={{
        ...position,
        position: 'fixed',
        zIndex: 90,
        width: 'min(22rem, calc(100vw - 1.5rem))',
        maxHeight: 'min(24rem, calc(100vh - 1.5rem))',
      }}
      className="
        flex flex-col overflow-hidden
        rounded-card border border-border
        bg-surface p-4
        shadow-dropdown
        animate-fade-in
      "
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-3">
        <span className="
          inline-flex items-center gap-2
          rounded-full border border-accent/25
          bg-accent-soft px-2.5 py-1
          text-[10.5px] font-semibold
          tracking-wide text-warning
        ">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-accent"
          />
          {label}
        </span>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close annotation"
          className="
            inline-flex h-8 w-8 shrink-0
            items-center justify-center
            rounded-button text-text-tertiary
            transition
            hover:bg-surface-secondary hover:text-text
            focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-ring
          "
        >
          <FaXmark aria-hidden="true" className="text-[12px]" />
        </button>
      </div>

      {/* Annotation content */}
      <div className="mt-3 min-h-0 overflow-y-auto overscroll-contain pr-1">
        <p className="
          m-0 whitespace-pre-wrap break-words
          text-[13px] leading-[1.8]
          text-text-secondary
        ">
          {annotation.content}
        </p>
      </div>
    </div>,
    document.body,
  );
}

/** Renders a prose chunk and attaches the interactive annotation layer to it. */
export function ArticleAnnotationHtml({ html }) {
  const containerRef = useRef(null);
  const popoverRef = useRef(null);
  const closeTimer = useRef(null);

  const [active, setActive] = useState(null);

  const clearTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const close = useCallback(() => {
    clearTimer();
    setActive(null);
  }, [clearTimer]);

  const scheduleClose = useCallback(() => {
    clearTimer();

    closeTimer.current = setTimeout(() => {
      const popover = popoverRef.current;

      if (
        popover?.matches(':hover') ||
        popover?.contains(document.activeElement)
      ) {
        return;
      }

      setActive(null);
    }, 220);
  }, [clearTimer]);

  const openFrom = useCallback((element, event) => {
    if (!element) return;

    clearTimer();

    setActive((current) => {
      if (current?.element === element) {
        return current;
      }

      return {
        id: element.dataset.annotationId,
        kind: element.dataset.annotationKind || 'explanation',
        content: element.dataset.annotationContent || '',
        element,
        focusOnOpen: event?.type === 'keydown',
      };
    });

    if (event?.type === 'keydown') {
      event.preventDefault();
    }
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Close when clicking outside the prose chunk and popover.
  useEffect(() => {
    if (!active) return undefined;

    const onPointerDown = (event) => {
      if (
        containerRef.current?.contains(event.target) ||
        popoverRef.current?.contains(event.target)
      ) {
        return;
      }

      close();
    };

    document.addEventListener('pointerdown', onPointerDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [active, close]);

  return (
    <>
      <div
        ref={containerRef}
        className="article-prose-chunk"
        dangerouslySetInnerHTML={{ __html: html }}
        onMouseOverCapture={(event) => {
          const element = event.target.closest?.('[data-annotation-id]');

          if (element && containerRef.current?.contains(element)) {
            openFrom(element, event);
          }
        }}
        onMouseOutCapture={(event) => {
          const element = event.target.closest?.('[data-annotation-id]');

          if (!element) return;

          const next = event.relatedTarget;

          if (
            next &&
            (element.contains(next) || popoverRef.current?.contains(next))
          ) {
            return;
          }

          scheduleClose();
        }}
        onClickCapture={(event) => {
          const element = event.target.closest?.('[data-annotation-id]');

          if (element && containerRef.current?.contains(element)) {
            openFrom(element, event);
          }
        }}
        onFocusCapture={(event) => {
          const element = event.target.closest?.('[data-annotation-id]');

          if (element && containerRef.current?.contains(element)) {
            openFrom(element, event);
          }
        }}
        onBlurCapture={(event) => {
          if (popoverRef.current?.contains(event.relatedTarget)) {
            return;
          }

          scheduleClose();
        }}
        onKeyDownCapture={(event) => {
          const element = event.target.closest?.('[data-annotation-id]');

          if (!element) return;

          if (event.key === 'Escape') {
            close();
            return;
          }

          if (event.key === 'Enter' || event.key === ' ') {
            openFrom(element, event);
          }
        }}
      />

      {active && (
        <AnnotationPopover
          annotation={active}
          anchor={active.element}
          popoverRef={popoverRef}
          focusOnOpen={active.focusOnOpen}
          onMouseEnter={clearTimer}
          onMouseLeave={scheduleClose}
          onClose={close}
        />
      )}
    </>
  );
}
