/**
 * Shared waiting state. Polling happens in the page's query, so this component
 * only reports what the server says it is doing.
 */
export function ProcessingPanel({ title, stage, note }) {
  return (
    <div className="border-y border-border py-6 sm:py-8">
      <div className="flex items-start gap-4">
        <span
          role="status"
          aria-label="Working"
          className="mt-0.5 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-border border-t-brand"
        />

        <div className="min-w-0 flex-1">
          <h2 className="m-0 font-heading text-[18px] font-medium leading-snug tracking-[-0.015em] text-text">
            {title}
          </h2>

          <p className="m-0 mt-1.5 text-[13.5px] leading-[1.7] text-text-secondary">
            {stage || 'Getting started…'}
          </p>

          <p className="m-0 mt-3 border-t border-border-secondary pt-3 text-[12.5px] leading-[1.7] text-text-tertiary">
            {note ??
              'This usually takes a minute or two. The page updates on its own, and you can leave it — the work keeps running.'}
          </p>
        </div>
      </div>
    </div>
  );
}
