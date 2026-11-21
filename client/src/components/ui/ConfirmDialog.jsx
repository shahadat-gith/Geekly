import { useEffect, useRef } from 'react';
import { FaTriangleExclamation } from 'react-icons/fa6';
import { Button } from './Button.jsx';

/**
 * Accessible confirmation dialog for destructive actions.
 * Replaces window.confirm: traps focus on open, closes on Escape.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const panelRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();

    function onKey(event) {
      if (event.key === 'Escape') onCancel();
      if (event.key !== 'Tab') return;

      const focusable = panelRef.current?.querySelectorAll(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-ink/45"
      />

      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="relative w-full max-w-md rounded-panel border border-border bg-surface p-6 shadow-dropdown animate-page"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-error/10">
            <FaTriangleExclamation
              aria-hidden="true"
              className="text-[17px] text-error"
            />
          </div>

          <div className="min-w-0">
            <h2
              id="confirm-dialog-title"
              className="m-0 text-[16px] font-semibold tracking-[-0.01em] text-text"
            >
              {title}
            </h2>

            <p
              id="confirm-dialog-message"
              className="m-0 mt-1.5 text-[13.5px] leading-[1.7] text-text-secondary"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 xs:flex-row xs:justify-end">
          <Button
            ref={cancelRef}
            autoFocus
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            className="w-full xs:w-auto"
          >
            {cancelLabel}
          </Button>

          <Button
            variant="destructive"
            onClick={onConfirm}
            loading={loading}
            className="w-full xs:w-auto"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
