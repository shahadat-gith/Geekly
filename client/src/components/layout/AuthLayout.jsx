import { Link } from 'react-router-dom';

const NOTES = [
  {
    title: 'Read the fundamentals',
    description: 'Topics with worked examples and diagrams',
  },
  {
    title: 'Check a resume',
    description: 'Compare it with a real job posting',
  },
  {
    title: 'Publish a site',
    description: 'A built folder on geekly.in',
  },
];

function Wordmark() {
  return (
    <Link
      to="/"
      aria-label="Geekly home"
      className="inline-flex w-fit rounded-button transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <img
        src="/logo.png"
        alt="Geekly"
        className="h-9 w-auto max-w-[155px] object-contain"
      />
    </Link>
  );
}

function EditorialPanel() {
  return (
    <aside className="relative hidden min-h-svh flex-col justify-between overflow-hidden border-r border-ink-soft bg-ink px-10 py-10 lg:flex xl:px-16">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-brand-mint" />
        <p className="folio m-0 text-ink-muted">Geekly / field notes</p>
        <span aria-hidden="true" className="h-px flex-1 bg-ink-soft" />
      </div>

      <div className="max-w-lg py-12">
        <p className="folio m-0 text-brand-mint">For engineers</p>

        <h2 className="mt-5 max-w-[18ch] font-heading text-[38px] font-medium leading-[1.08] tracking-[-0.03em] text-ink-text xl:text-[44px]">
          Understand what your code runs on
        </h2>

        <p className="mt-6 max-w-md text-[15px] leading-7 text-ink-muted">
          Backend, databases, operating systems, networking and system design,
          with worked examples and diagrams.
        </p>

        <ol className="m-0 mt-12 max-w-md list-none border-t border-ink-soft p-0">
          {NOTES.map((note, index) => (
            <li
              key={note.title}
              className="grid grid-cols-[24px_minmax(0,1fr)] gap-4 border-b border-ink-soft py-4"
            >
              <span className="pt-0.5 font-mono text-[10.5px] tabular-nums text-ink-muted">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="min-w-0">
                <p className="m-0 text-[13.5px] font-medium text-ink-text">
                  {note.title}
                </p>
                <p className="m-0 mt-1 text-[12.5px] leading-[1.6] text-ink-muted">
                  {note.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="m-0 max-w-sm text-[12px] leading-6 text-ink-muted">
        A reading room and workbench for engineers.
      </p>
    </aside>
  );
}

// Authentication shell
export function AuthLayout({
  title,
  description,
  children,
  footer,
}) {
  return (
    <div className="relative isolate min-h-svh bg-bg text-text">
      <div className="relative z-10 mx-auto flex min-h-svh max-w-[1440px] flex-col lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        <EditorialPanel />

        <div className="flex min-h-svh flex-col bg-bg">
          <header className="flex px-6 py-6 lg:hidden">
            <Wordmark />
          </header>

          <main className="animate-page flex flex-1 items-start justify-center px-4 pb-10 pt-8 sm:px-8 lg:items-center lg:px-12 lg:py-12">
            <div className="w-full max-w-[420px]">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-brand" />
                <p className="folio m-0">Account</p>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>

              <h1 className="mt-5 text-balance font-heading text-[27px] font-medium leading-[1.15] tracking-[-0.025em] text-text sm:text-[30px]">
                {title}
              </h1>

              {description && (
                <p className="mt-3 text-[13.5px] leading-[1.75] text-text-secondary">
                  {description}
                </p>
              )}

              <div className="mt-8">{children}</div>

              {footer && (
                <div className="mt-8 border-t border-border-secondary pt-6 text-[13px] leading-6 text-text-secondary">
                  {footer}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Reusable authentication link
export function AuthLink({ to, children }) {
  return (
    <Link
      to={to}
      className="font-medium text-brand-strong transition-colors hover:text-brand-strong-hover focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </Link>
  );
}
