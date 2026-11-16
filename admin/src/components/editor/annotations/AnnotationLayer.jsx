import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import {
  ANNOTATION_KINDS,
  ANNOTATION_KIND_LABELS,
  normalizeAnnotationKind,
} from '../tiptap/articleDocument.js';

function AnnotationPopover({
  annotation,
  anchor,
  editable,
  popoverRef,
  onMouseEnter,
  onMouseLeave,
  onClose,
  onUpdate,
  onRemove,
}) {
  const [editing, setEditing] = useState(false);
  const [kind, setKind] = useState(normalizeAnnotationKind(annotation.kind));
  const [content, setContent] = useState(annotation.content || '');
  const [error, setError] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    if (!anchor || !popoverRef.current) return undefined;
    return autoUpdate(anchor, popoverRef.current, () => {
      computePosition(anchor, popoverRef.current, {
        placement: 'top',
        strategy: 'fixed',
        middleware: [offset(8), flip({ padding: 12 }), shift({ padding: 12 })],
      }).then(({ x, y }) => setPosition({ x, y }));
    });
  }, [anchor, popoverRef, editing]);

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  function save(event) {
    event.preventDefault();
    const nextContent = content.trim();
    if (!nextContent) {
      setError('Add an explanation before saving.');
      return;
    }
    const applied = onUpdate(annotation.id, { kind, content: nextContent });
    if (!applied) {
      setError('This annotation could not be updated.');
      return;
    }
    onClose();
  }

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Annotation"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDown={onMouseEnter}
      onFocusCapture={onMouseEnter}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 130,
        width: 'min(21rem, calc(100vw - 1.5rem))',
      }}
      className="rounded-field border border-accent/35 bg-surface p-3.5 shadow-dropdown"
    >
      {editing ? (
        <form onSubmit={save}>
          <p className="m-0 text-[10.5px] font-semibold tracking-[0.04em] text-accent">
            Edit annotation
          </p>
          <label className="mt-2.5 flex flex-col gap-1 text-[11px] font-semibold text-text-secondary">
            Type
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value)}
              className="min-h-[34px] w-full rounded-field border border-border bg-surface px-2.5 text-[12px] font-medium text-text outline-none focus:border-border-focus focus:ring-4 focus:ring-brand-soft"
            >
              {ANNOTATION_KINDS.map((value) => (
                <option key={value} value={value}>
                  {ANNOTATION_KIND_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-2.5 flex flex-col gap-1 text-[11px] font-semibold text-text-secondary">
            Explanation
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={4}
              maxLength={2000}
              className="w-full resize-y rounded-field border border-border bg-surface px-2.5 py-2 text-[12.5px] font-normal leading-relaxed text-text outline-none focus:border-border-focus focus:ring-4 focus:ring-brand-soft"
            />
          </label>
          {error && (
            <p role="alert" className="m-0 mt-2 text-[11px] leading-relaxed text-error">
              {error}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <button
              type="submit"
              className="inline-flex min-h-[32px] items-center gap-1 rounded-button bg-brand px-2.5 text-[11px] font-semibold text-on-brand transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
            >
              <i aria-hidden="true" className="bx bx-check text-[14px]" />
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex min-h-[32px] items-center rounded-button px-2.5 text-[11px] font-semibold text-text-secondary transition hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onRemove(annotation.id)}
              className="ml-auto inline-flex min-h-[32px] items-center gap-1 rounded-button px-2 text-[11px] font-semibold text-error transition hover:bg-error/8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-error/15"
            >
              <i aria-hidden="true" className="bx bx-trash text-[14px]" />
              Delete
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
              {ANNOTATION_KIND_LABELS[normalizeAnnotationKind(annotation.kind)]}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close annotation"
              className="inline-flex h-6 w-6 items-center justify-center rounded-button text-text-tertiary transition hover:bg-surface-secondary hover:text-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
            >
              <i aria-hidden="true" className="bx bx-x text-[15px]" />
            </button>
          </div>
          <p className="m-0 mt-2 whitespace-pre-wrap text-[12.5px] leading-relaxed text-text-secondary">
            {annotation.content}
          </p>
          {editable && (
            <div className="mt-3 flex items-center gap-1.5 border-t border-border-secondary pt-2.5">
              <button
                type="button"
                onClick={() => {
                  setKind(normalizeAnnotationKind(annotation.kind));
                  setContent(annotation.content || '');
                  setError('');
                  setEditing(true);
                }}
                className="inline-flex min-h-[30px] items-center gap-1 rounded-button px-2 text-[11px] font-semibold text-brand transition hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
              >
                <i aria-hidden="true" className="bx bx-edit-alt text-[14px]" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => onRemove(annotation.id)}
                className="inline-flex min-h-[30px] items-center gap-1 rounded-button px-2 text-[11px] font-semibold text-error transition hover:bg-error/8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-error/15"
              >
                <i aria-hidden="true" className="bx bx-trash text-[14px]" />
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>,
    document.body,
  );
}

/** Event-delegated annotation hover/tap layer used by the editor and preview. */
export function AnnotationLayer({ editor = null, editable = false, className = '', children }) {
  const containerRef = useRef(null);
  const popoverRef = useRef(null);
  const closeTimer = useRef(null);
  const [active, setActive] = useState(null);
  const activeRef = useRef(active);
  const canEdit = Boolean(editable && editor?.isEditable);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

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
      if (popoverRef.current?.matches(':hover') || popoverRef.current?.contains(document.activeElement)) {
        return;
      }
      setActive(null);
    }, 220);
  }, [clearTimer]);

  const open = useCallback((element, { pinned = false } = {}) => {
    if (!element) return;
    clearTimer();
    setActive((current) => {
      if (current?.element === element && (!pinned || current.pinned)) return current;
      return {
        id: element.dataset.annotationId,
        kind: element.dataset.annotationKind || 'explanation',
        content: element.dataset.annotationContent || '',
        element,
        pinned: current?.id === element.dataset.annotationId ? current.pinned || pinned : pinned,
      };
    });
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  useEffect(() => {
    if (!active) return undefined;
    const onPointerDown = (event) => {
      if (containerRef.current?.contains(event.target) || popoverRef.current?.contains(event.target)) return;
      close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [active, close]);

  // ProseMirror handles mouse events on the editable DOM, and can replace the
  // marked span during selection changes. Native capture listeners on our
  // wrapper see the original target before that happens, so hover, tap and
  // keyboard activation all stay reliable.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return undefined;

    const annotationTarget = (target) => {
      const element = target?.closest?.('[data-annotation-id]');
      return element && root.contains(element) ? element : null;
    };
    const onPointerDown = (event) => {
      const element = annotationTarget(event.target);
      if (element) open(element, { pinned: true });
    };
    const onClick = (event) => {
      const element =
        annotationTarget(event.target) ||
        event
          .composedPath?.()
          .find((node) => node?.matches?.('[data-annotation-id]') && root.contains(node));
      if (element) open(element, { pinned: true });
    };
    const onMouseOver = (event) => {
      const element = annotationTarget(event.target);
      if (element) open(element);
    };
    const onMouseOut = (event) => {
      const element = annotationTarget(event.target);
      if (!element || activeRef.current?.pinned) return;
      const next = event.relatedTarget;
      if (next && (element.contains(next) || popoverRef.current?.contains(next))) return;
      scheduleClose();
    };
    const onFocusIn = (event) => {
      const element = annotationTarget(event.target);
      if (element) open(element, { pinned: true });
    };
    const onFocusOut = (event) => {
      if (activeRef.current?.pinned) return;
      if (popoverRef.current?.contains(event.relatedTarget)) return;
      scheduleClose();
    };
    const onKeyDown = (event) => {
      const element = annotationTarget(event.target);
      if (!element) return;
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(element, { pinned: true });
      }
    };

    root.addEventListener('pointerdown', onPointerDown, true);
    root.addEventListener('mousedown', onPointerDown, true);
    root.addEventListener('click', onClick, true);
    root.addEventListener('mouseover', onMouseOver, true);
    root.addEventListener('mouseout', onMouseOut, true);
    root.addEventListener('focusin', onFocusIn, true);
    root.addEventListener('focusout', onFocusOut, true);
    root.addEventListener('keydown', onKeyDown, true);
    return () => {
      root.removeEventListener('pointerdown', onPointerDown, true);
      root.removeEventListener('mousedown', onPointerDown, true);
      root.removeEventListener('click', onClick, true);
      root.removeEventListener('mouseover', onMouseOver, true);
      root.removeEventListener('mouseout', onMouseOut, true);
      root.removeEventListener('focusin', onFocusIn, true);
      root.removeEventListener('focusout', onFocusOut, true);
      root.removeEventListener('keydown', onKeyDown, true);
    };
  }, [close, open, scheduleClose]);

  return (
    <div ref={containerRef} className={className}>
      {children}

      {active && (
        <AnnotationPopover
          key={active.id}
          annotation={active}
          anchor={active.element}
          editable={canEdit}
          popoverRef={popoverRef}
          onMouseEnter={clearTimer}
          onMouseLeave={scheduleClose}
          onClose={close}
          onUpdate={(id, attributes) =>
            editor?.chain().focus().updateAnnotation(id, attributes).run() ?? false
          }
          onRemove={(id) => {
            editor?.chain().focus().removeAnnotation(id).run();
            close();
          }}
        />
      )}
    </div>
  );
}
