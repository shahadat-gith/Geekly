// Decorative page texture: fine dot grid on a cool canvas, faded below the
// fold, with the container's vertical margins drawn in.
const gridStyle = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-text) 18%, transparent) 1px, transparent 0)',
  backgroundSize: '28px 28px',
  maskImage: 'linear-gradient(to bottom, black, transparent 54%)',
  WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 54%)',
  opacity: 0.36,
};

const washStyle = {
  backgroundImage:
    'radial-gradient(ellipse 70% 44% at 50% -10%, color-mix(in srgb, var(--color-brand) 8%, transparent), transparent 70%)',
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
      <div className="mx-auto h-full max-w-6xl border-x border-border/40" />
    </div>
  );
}
