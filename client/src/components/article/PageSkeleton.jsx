
function SkeletonBlock({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-tertiary ${className}`}
    />
  );
}

// Placeholder shown while the article page's content request is in flight.
export default function PageSkeleton() {
  return (
    <div
      className="
        mx-auto grid w-full max-w-[1440px] min-w-0
        grid-cols-1 gap-8 px-4 py-6
        sm:px-6 sm:py-8
        lg:grid-cols-[280px_minmax(0,1fr)]
        lg:gap-8 lg:px-8 lg:py-10
      "
      aria-hidden="true"
    >
      {/* Sidebar skeleton */}
      <aside className="hidden lg:block">
        <div className="rounded-card border border-border bg-surface p-4">
          <SkeletonBlock className="h-5 w-3/4" />
          <SkeletonBlock className="mt-3 h-3 w-full" />
          <SkeletonBlock className="mt-2 h-3 w-2/3" />

          <div className="mt-7 space-y-3">
            <SkeletonBlock className="h-3 w-1/3" />
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-2">
                <SkeletonBlock className="h-3 w-4" />
                <SkeletonBlock
                  className={`h-3 ${index % 2 === 0 ? 'w-4/5' : 'w-3/5'
                    }`}
                />
              </div>
            ))}
          </div>

          <div className="mt-7 space-y-3">
            <SkeletonBlock className="h-3 w-1/2" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-2">
                <SkeletonBlock className="h-3 w-4" />
                <SkeletonBlock
                  className={`h-3 ${index === 1 ? 'w-2/3' : 'w-4/5'
                    }`}
                />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Article content skeleton */}
      <main className="min-w-0">
        <div className="mt-2">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="mt-5 h-10 w-4/5 max-w-2xl sm:h-12" />
          <SkeletonBlock className="mt-3 h-10 w-2/3 max-w-xl sm:h-12" />
          <SkeletonBlock className="mt-5 h-4 w-full max-w-lg" />
          <SkeletonBlock className="mt-2 h-4 w-3/4 max-w-md" />

          <div className="mt-6 flex items-center gap-3">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        </div>

        <div className="mt-10 space-y-4">
          <SkeletonBlock className="h-5 w-1/3" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-[94%]" />
          <SkeletonBlock className="h-4 w-[97%]" />
          <SkeletonBlock className="h-4 w-4/5" />

          <SkeletonBlock className="mt-8 h-56 w-full rounded-card sm:h-72" />

          <SkeletonBlock className="mt-8 h-5 w-2/5" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-[92%]" />
          <SkeletonBlock className="h-4 w-3/4" />
        </div>
      </main>
    </div>
  );
}

// Placeholder for the reading area while a selected article loads.
export function ArticleSkeleton() {
  return (
    <div className="mt-2 min-w-0 max-w-3xl" aria-hidden="true">
      <SkeletonBlock className="h-3 w-28" />

      <SkeletonBlock className="mt-5 h-10 w-4/5 max-w-2xl sm:h-12" />
      <SkeletonBlock className="mt-3 h-10 w-2/3 max-w-xl sm:h-12" />

      <SkeletonBlock className="mt-5 h-4 w-full max-w-lg" />
      <SkeletonBlock className="mt-2 h-4 w-3/4 max-w-md" />

      <div className="mt-6 flex items-center gap-3">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-3 w-20" />
      </div>

      <div className="mt-10 space-y-4">
        <SkeletonBlock className="h-5 w-1/3" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-[94%]" />
        <SkeletonBlock className="h-4 w-[97%]" />
        <SkeletonBlock className="h-4 w-4/5" />

        <SkeletonBlock className="mt-8 h-56 w-full rounded-card sm:h-72" />

        <SkeletonBlock className="mt-8 h-5 w-2/5" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-[92%]" />
        <SkeletonBlock className="h-4 w-3/4" />
      </div>
    </div>
  );
}
