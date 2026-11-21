import { Skeleton } from '../ui/Skeleton.jsx';

// Placeholder shown while the article page's content request is in flight.
export default function PageSkeleton() {
  return (
    <div
      className="mx-auto grid w-full max-w-[1400px] min-w-0 grid-cols-1 gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[248px_minmax(0,1fr)] lg:px-8 lg:py-10"
      aria-hidden="true"
    >
      {/* Sidebar skeleton */}
      <aside className="hidden lg:block">
        <div className="w-[248px] border-r border-border pr-4">
          <Skeleton className="h-4 w-3/4" />

          <div className="mt-6 space-y-2.5">
            <Skeleton className="h-2.5 w-16" />
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2.5">
                <Skeleton className="h-2.5 w-4" />
                <Skeleton className={`h-2.5 ${index % 2 === 0 ? 'w-4/5' : 'w-3/5'}`} />
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2.5">
            <Skeleton className="h-2.5 w-20" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2.5">
                <Skeleton className="h-2.5 w-4" />
                <Skeleton className={`h-2.5 ${index === 1 ? 'w-2/3' : 'w-4/5'}`} />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Article content skeleton */}
      <main className="min-w-0">
        <div className="mb-5 flex items-center justify-between border-b border-border pb-3 lg:hidden">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-9 w-24 rounded-button" />
        </div>

        <div className="mt-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-2.5 w-20" />
          </div>

          <Skeleton className="mt-6 h-9 w-4/5 max-w-2xl sm:h-10" />
          <Skeleton className="mt-2.5 h-9 w-2/3 max-w-xl sm:h-10" />
          <Skeleton className="mt-5 h-4 w-full max-w-lg" />
          <Skeleton className="mt-2 h-4 w-3/4 max-w-md" />

          <div className="mt-5 flex items-center gap-2">
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </div>

        <div className="mt-9 max-w-3xl space-y-4 border-t border-border pt-8">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-[94%]" />
          <Skeleton className="h-3.5 w-[97%]" />
          <Skeleton className="h-3.5 w-4/5" />

          <Skeleton strong className="mt-6 h-52 w-full rounded-card sm:h-64" />

          <Skeleton className="mt-6 h-4 w-2/5" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-[92%]" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
      </main>
    </div>
  );
}

// Placeholder for the reading area while a selected article loads.
export function ArticleSkeleton() {
  return (
    <div className="mt-2 min-w-0 max-w-3xl" aria-hidden="true">
      <div className="flex items-center gap-2">
        <Skeleton className="h-2.5 w-12" />
        <Skeleton className="h-2.5 w-2.5 rounded-full" />
        <Skeleton className="h-2.5 w-20" />
      </div>

      <Skeleton className="mt-6 h-9 w-4/5 max-w-2xl sm:h-10" />
      <Skeleton className="mt-2.5 h-9 w-2/3 max-w-xl sm:h-10" />

      <Skeleton className="mt-5 h-4 w-full max-w-lg" />
      <Skeleton className="mt-2 h-4 w-3/4 max-w-md" />

      <div className="mt-5 flex items-center gap-2">
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      <div className="mt-9 space-y-4 border-t border-border pt-8">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-[94%]" />
        <Skeleton className="h-3.5 w-[97%]" />
        <Skeleton className="h-3.5 w-4/5" />

        <Skeleton strong className="mt-6 h-52 w-full rounded-card sm:h-64" />

        <Skeleton className="mt-6 h-4 w-2/5" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-[92%]" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
    </div>
  );
}
