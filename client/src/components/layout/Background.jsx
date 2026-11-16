// Decorative page texture: fine dot grid on a cool canvas, faded below the
// fold, with the container's vertical margins drawn in.
const gridStyle = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-text) 16%, transparent) 1px, transparent 0)',
  backgroundSize: '24px 24px',
  maskImage: 'linear-gradient(to bottom, black, transparent 62%)',
  WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 62%)',
  opacity: 0.5,
};

const washStyle = {
  backgroundImage:
    'radial-gradient(ellipse 72% 46% at 50% -8%, color-mix(in srgb, var(--color-brand) 9%, transparent), transparent 72%)',
};

/** Full-page decorative background. */
export function Background({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0" style={washStyle} />
      <div className="absolute inset-0" style={gridStyle} />
      <div className="mx-auto h-full max-w-6xl border-x border-border/45" />
    </div>
  );
}
