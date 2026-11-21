// Subtle dot texture, strongest at the top of the page.
// Kept quiet so dense engineering content stays readable.

const gridStyle = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-text) 10%, transparent) 1px, transparent 0)',
  backgroundSize: '26px 26px',
  maskImage: 'linear-gradient(to bottom, black, transparent 42%)',
  WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 42%)',
  opacity: 0.35,
};

/** Full-page decorative background. */
export function Background({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0" style={gridStyle} />
    </div>
  );
}
