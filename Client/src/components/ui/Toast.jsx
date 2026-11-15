import { FaCircleCheck, FaCircleExclamation, FaCircleInfo, FaTriangleExclamation, FaXmark } from 'react-icons/fa6';
import { IconButton } from './IconButton.jsx';

const VARIANTS = {
  success: { Icon: FaCircleCheck, tone: 'text-success' },
  error: { Icon: FaCircleExclamation, tone: 'text-error' },
  warning: { Icon: FaTriangleExclamation, tone: 'text-warning' },
  info: { Icon: FaCircleInfo, tone: 'text-info' },
};

/** Single toast card. Rendering and dismissal are handled by ToastProvider. */
export function Toast({ title, description, variant = 'info', onDismiss }) {
  const config = VARIANTS[variant] ?? VARIANTS.info;

  return (
    <div
      role="status"
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card bg-surface p-4 shadow-dropdown"
    >
      <config.Icon aria-hidden="true" className={`mt-0.5 shrink-0 text-[18px] ${config.tone}`} />
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[14px] font-semibold text-text">{title}</p>
        {description && (
          <p className="m-0 mt-1 text-[13px] leading-relaxed text-text-secondary">{description}</p>
        )}
      </div>
      <IconButton label="Dismiss notification" variant="plain" size="sm" onClick={onDismiss}>
        <FaXmark aria-hidden="true" className="text-[15px]" />
      </IconButton>
    </div>
  );
}
