
export function ResumeSection({ id, active = true, title, meta, children }) {
  if (!active) return null;

  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-card border border-border bg-surface shadow-card"
    >
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border-secondary px-5 py-4">
        <h2 className="m-0 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-text">
          {title}
        </h2>

        {meta && (
          <span className="text-[12.5px] leading-snug text-text-tertiary">
            {meta}
          </span>
        )}
      </header>

      <div className="px-5 py-5 text-text">
        {children}
      </div>
    </section>
  );
}
