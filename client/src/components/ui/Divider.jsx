
/** Horizontal rule, optionally split by a small centred label (e.g. "or"). */
export function Divider({ label, className = '' }) {
  const classes = ['w-full', className].filter(Boolean).join(' ');

  if (!label) {
    return (
      <hr
        className={`border-0 border-t border-border ${classes}`}
      />
    );
  }

  return (
    <div
      role="separator"
      aria-label={typeof label === 'string' ? label : undefined}
      className={`flex items-center gap-3 text-[12px] font-medium text-text-tertiary ${classes}`}
    >
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
      <span>{label}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
}
