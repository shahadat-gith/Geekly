
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaTriangleExclamation,
} from 'react-icons/fa6';

const TONES = {
  error: {
    Icon: FaCircleExclamation,
    tone: 'border-error/25 bg-error/5 text-error',
  },
  success: {
    Icon: FaCircleCheck,
    tone: 'border-success/25 bg-success/5 text-success',
  },
  warning: {
    Icon: FaTriangleExclamation,
    tone: 'border-warning/25 bg-warning/5 text-warning',
  },
  info: {
    Icon: FaCircleInfo,
    tone: 'border-info/25 bg-info/5 text-info',
  },
};

/** Inline message for form errors, confirmations and notices. */
export function Alert({
  tone = 'error',
  title,
  children,
  className = '',
}) {
  const config = TONES[tone] ?? TONES.error;
  const Icon = config.Icon;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={[
        'flex items-start gap-3 rounded-field border px-4 py-3',
        'text-[13.5px] leading-relaxed',
        config.tone,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-[16px]"
      />

      <div className="min-w-0 flex-1">
        {title && (
          <p className="m-0 font-semibold">
            {title}
          </p>
        )}

        <div className={title ? 'mt-1' : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}
