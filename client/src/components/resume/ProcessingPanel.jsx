
/**
 * Shared waiting state. Polling happens in the page's query, so this component
 * only reports what the server says it is doing.
 */
export function ProcessingPanel({ title, stage, note }) {
  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card sm:p-8">
      <div className="flex items-start gap-4">
        <span
          role="status"
          aria-label="Working"
          className="mt-1 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-brand-light border-t-[#527C42]"
        />

        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-[16px] font-semibold leading-snug tracking-[-0.01em] text-text">
            {title}
          </h2>

          <p className="m-0 mt-1.5 text-[14px] leading-[1.7] text-text-secondary">
            {stage || 'Getting started…'}
          </p>

          <p className="m-0 mt-3 text-[13px] leading-[1.7] text-text-tertiary">
            {note ??
              'This usually takes a minute or two. The page updates on its own, and you can leave it — the work keeps running.'}
          </p>
        </div>
      </div>
    </div>
  );
}
