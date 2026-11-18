
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaTriangleExclamation,
  FaXmark,
} from 'react-icons/fa6';

import { IconButton } from './IconButton.jsx';

const VARIANTS = {
  success: {
    Icon: FaCircleCheck,
    tone: 'text-success',
    border: 'border-success/20',
  },
  error: {
    Icon: FaCircleExclamation,
    tone: 'text-error',
    border: 'border-error/20',
  },
  warning: {
    Icon: FaTriangleExclamation,
    tone: 'text-warning',
    border: 'border-warning/20',
  },
  info: {
    Icon: FaCircleInfo,
    tone: 'text-info',
    border: 'border-info/20',
  },
};

/** Single toast card. Rendering and dismissal are handled by ToastProvider. */
export function Toast({
  title,
  description,
  variant = 'info',
  onDismiss,
}) {
  const config = VARIANTS[variant] ?? VARIANTS.info;
  const Icon = config.Icon;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      className={[
        'pointer-events-auto flex w-full max-w-sm items-start gap-3',
        'rounded-card border border-border bg-surface p-4 shadow-dropdown',
        config.border,
      ].join(' ')}
    >
      <Icon
        aria-hidden="true"
        className={`mt-0.5 shrink-0 text-[18px] ${config.tone}`}
      />

      <div className="min-w-0 flex-1">
        {title && (
          <p className="m-0 text-[13.5px] font-semibold leading-snug text-text">
            {title}
          </p>
        )}

        {description && (
          <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-text-secondary">
            {description}
          </p>
        )}
      </div>

      {onDismiss && (
        <IconButton
          label="Dismiss notification"
          variant="plain"
          size="sm"
          onClick={onDismiss}
          className="-mr-1 -mt-1"
        >
          <FaXmark aria-hidden="true" className="text-[15px]" />
        </IconButton>
      )}
    </div>
  );
}
