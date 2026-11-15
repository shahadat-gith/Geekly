const gridStyle = {
  backgroundImage:
    'linear-gradient(to right, color-mix(in srgb, var(--color-border) 78%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--color-border) 78%, transparent) 1px, transparent 1px)',
  backgroundSize: '48px 48px',
  maskImage: 'radial-gradient(ellipse 115% 105% at 50% 40%, black 48%, transparent 100%)',
  WebkitMaskImage: 'radial-gradient(ellipse 115% 105% at 50% 40%, black 48%, transparent 100%)',
};

const glowStyle = {
  backgroundImage:
    'radial-gradient(ellipse 58% 42% at 50% 0%, color-mix(in srgb, var(--color-brand) 17%, transparent), transparent 72%), radial-gradient(ellipse 36% 30% at 50% 8%, color-mix(in srgb, var(--color-brand) 8%, transparent), transparent 76%)',
};

/** Full-page decorative background for the home page. */
export function Background({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0" style={glowStyle} />
      <div className="animate-background-drift absolute -left-32 top-[8%] h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
      <div className="animate-background-drift-slow absolute -right-[12%] top-[32%] h-[28rem] w-[28rem] rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-500/10" />
      <div className="animate-background-drift absolute bottom-[-18%] left-[18%] h-[30rem] w-[30rem] rounded-full bg-rose-300/15 blur-3xl dark:bg-rose-500/10" />

      <div className="absolute inset-0 opacity-[0.72]" style={gridStyle} />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_72%,color-mix(in_srgb,var(--color-bg)_35%,transparent))]" />
    </div>
  );
}
