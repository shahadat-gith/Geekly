const TONES = {
  error: { icon: 'bx-error-circle', tone: 'border-error/25 bg-error/8 text-error' },
  success: { icon: 'bx-check-circle', tone: 'border-success/25 bg-success/8 text-success' },
  warning: { icon: 'bx-error', tone: 'border-warning/25 bg-warning/8 text-warning' },
  info: { icon: 'bx-info-circle', tone: 'border-info/25 bg-info/8 text-info' },
};

export function Alert({ tone = 'error', title, children, className = '', action }) {
  const config = TONES[tone] ?? TONES.error;

  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 rounded-field border px-3.5 py-3 text-[12.5px] leading-relaxed ${config.tone} ${className}`}
    >
      <i
        aria-hidden="true"
        className={`bx ${config.icon} mt-0.5 shrink-0 text-[17px] leading-none`}
      />
      <div className="min-w-0 flex-1">
        {title && <p className="m-0 font-semibold">{title}</p>}
        <div className={title ? 'mt-0.5' : undefined}>{children}</div>
      </div>
      {action}
    </div>
  );
}
