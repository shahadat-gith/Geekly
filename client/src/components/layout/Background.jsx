
// Subtle dot texture with a soft sage and peach ambient wash.
// Keeps the page bright, clean, and distraction-free.

const gridStyle = {
  backgroundImage:
    'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--color-text) 12%, transparent) 1px, transparent 0)',
  backgroundSize: '30px 30px',
  maskImage: 'linear-gradient(to bottom, black, transparent 58%)',
  WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 58%)',
  opacity: 0.22,
};

const washStyle = {
  backgroundImage: `
    radial-gradient(
      ellipse 65% 42% at 50% -12%,
      color-mix(in srgb, var(--color-brand) 15%, transparent),
      transparent 72%
    ),
    radial-gradient(
      ellipse 38% 30% at 95% 5%,
      color-mix(in srgb, var(--color-accent) 9%, transparent),
      transparent 75%
    )
  `,
};

/** Full-page decorative background. */
export function Background({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
    >
      {/* Soft ambient color */}
      <div className="absolute inset-0" style={washStyle} />

      {/* Fine dot texture */}
      <div className="absolute inset-0" style={gridStyle} />

      {/* Subtle content boundary */}
      <div className="mx-auto h-full max-w-6xl border-x border-border/30" />
    </div>
  );
}
