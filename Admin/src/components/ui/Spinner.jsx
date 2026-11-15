export function Spinner({ className = 'h-5 w-5', label = 'Loading' }) {
  return (
    <span role="status" aria-label={label} className="inline-flex items-center justify-center">
      <i
        aria-hidden="true"
        className={`bx bx-loader-alt animate-admin-spin text-brand ${className}`}
      />
    </span>
  );
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[50svh] flex-col items-center justify-center gap-3">
      <Spinner className="text-[30px]" label={label} />
      <p className="m-0 text-[13px] font-medium text-text-secondary">{label}</p>
    </div>
  );
}

export function FullScreenLoader({ label = 'Loading admin console…' }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-canvas">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-button">
        <i aria-hidden="true" className="bx bx-terminal text-[28px]" />
      </span>
      <Spinner className="text-[26px]" label={label} />
      <p className="m-0 text-[13px] font-medium text-text-secondary">{label}</p>
    </div>
  );
}
