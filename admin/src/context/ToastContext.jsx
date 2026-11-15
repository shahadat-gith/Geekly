import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ToastContext } from './toastContext.js';

const TONES = {
  success: { icon: 'bx-check-circle', tone: 'text-success' },
  error: { icon: 'bx-error-circle', tone: 'text-error' },
  info: { icon: 'bx-info-circle', tone: 'text-brand' },
};

// Mount once. Toasts sit above the page but stay out of the tab order until
// they appear; each one removes itself after `duration` ms.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'success', duration = 4000 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((current) => [...current.slice(-3), { id, title, description, variant }]);

      if (duration > 0) {
        timers.current.set(id, setTimeout(() => dismiss(id), duration));
      }
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          aria-label="Admin notifications"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex flex-col items-center gap-2.5 p-4 sm:items-end sm:p-6"
        >
          {toasts.map((item) => {
            const tone = TONES[item.variant] ?? TONES.success;
            return (
              <div
                key={item.id}
                className="animate-rise pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-panel bg-surface px-4 py-3.5 shadow-dropdown"
              >
                <i
                  aria-hidden="true"
                  className={`bx ${tone.icon} mt-0.5 shrink-0 text-[19px] ${tone.tone}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[13px] font-semibold text-text">{item.title}</p>
                  {item.description && (
                    <p className="m-0 mt-0.5 text-[12px] leading-relaxed text-text-secondary">
                      {item.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 rounded-button p-1 text-text-tertiary transition hover:bg-surface-secondary hover:text-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
                >
                  <i aria-hidden="true" className="bx bx-x text-[17px]" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
