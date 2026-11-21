/** Single loading placeholder block. */
export function Skeleton({ className = '', strong = false }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg ${strong ? 'bg-skeleton-strong' : 'bg-skeleton'} ${className}`}
    />
  );
}
