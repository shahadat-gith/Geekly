// Placeholder shown while the article page's content request is in flight.
export default function PageSkeleton() {
  return (
    <div
      className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 lg:py-12"
      aria-hidden="true"
    >
      <div className="hidden h-72 animate-pulse rounded-card bg-surface-tertiary/70 lg:block" />
      <div>
        <div className="mt-8 h-10 w-2/3 animate-pulse rounded bg-surface-tertiary" />
        <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-surface-tertiary" />
        <div className="mt-10 h-72 animate-pulse rounded-card bg-surface-tertiary/70" />
      </div>
    </div>
  );
}

// Placeholder for the middle column while a clicked article loads. The sidebar
// stays on screen, so only the reading area changes.
export function ArticleSkeleton() {
  return (
    <div className="mt-6 max-w-3xl" aria-hidden="true">
      <div className="h-9 w-3/4 animate-pulse rounded bg-surface-tertiary" />
      <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-surface-tertiary" />
      <div className="mt-10 h-64 animate-pulse rounded-card bg-surface-tertiary/70" />
    </div>
  );
}
