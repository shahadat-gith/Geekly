import { FaCircleCheck, FaCircleExclamation, FaCircleInfo, FaTriangleExclamation } from 'react-icons/fa6';

const TONES = {
  error: {
    Icon: FaCircleExclamation,
    tone: 'border-error/30 bg-error/10 text-error',
  },
  success: { Icon: FaCircleCheck, tone: 'border-success/30 bg-success/10 text-success' },
  warning: { Icon: FaTriangleExclamation, tone: 'border-warning/30 bg-warning/10 text-warning' },
  info: { Icon: FaCircleInfo, tone: 'border-info/30 bg-info/10 text-info' },
};

/** Inline message for form errors, confirmations and notices. */
export function Alert({ tone = 'error', title, children, className = '' }) {
  const config = TONES[tone] ?? TONES.error;

  return (
    <div
      role="alert"
      className={`flex gap-3 rounded-field border px-4 py-3 text-[13.5px] leading-relaxed ${config.tone} ${className}`}
    >
      <config.Icon aria-hidden="true" className="mt-0.5 shrink-0 text-[16px]" />
      <div className="min-w-0">
        {title && <p className="m-0 font-semibold">{title}</p>}
        <div className={title ? 'mt-1' : undefined}>{children}</div>
      </div>
    </div>
  );
}
