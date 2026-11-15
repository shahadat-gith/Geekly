import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './IconButton.jsx';

const SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-5xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-text/35 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`animate-rise relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-card bg-surface shadow-dropdown sm:rounded-card ${SIZES[size] ?? SIZES.md}`}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-border-secondary px-5 py-4 sm:px-6">
            <div className="min-w-0">
              {title && (
                <h2 className="m-0 font-heading text-[19px] font-semibold leading-tight tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-text-secondary">
                  {description}
                </p>
              )}
            </div>
            <IconButton label="Close dialog" size="sm" onClick={onClose}>
              <i aria-hidden="true" className="bx bx-x" />
            </IconButton>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border-secondary bg-surface-secondary/60 px-5 py-3.5 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
