import { Link } from 'react-router-dom';
import { Background } from './Background.jsx';

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
    <aside className="relative hidden min-h-svh flex-col justify-between overflow-hidden bg-ink px-10 py-10 lg:flex xl:px-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)',
          backgroundSize: '28px 28px',
          maskImage: 'linear-gradient(to bottom, black, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 70%)',
        }}
      />

      <div className="relative z-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-ink-soft bg-ink-secondary px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-mint" />
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Built for engineers
          </span>
        </span>
      </div>

      <div className="relative z-10 max-w-lg py-16">
        <h2 className="max-w-lg font-heading text-4xl font-semibold leading-[1.1] tracking-[-0.035em] text-ink-text xl:text-[44px]">
          Understand what
          <br />
          your code runs on.
        </h2>

        <p className="mt-6 max-w-md text-[15px] leading-7 text-ink-muted">
          Backend, databases, operating systems, networking and system
          design — with worked examples and diagrams, not slogans.
        </p>

        <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-ink-soft pt-8">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              Learn
            </dt>
            <dd className="m-0 mt-2 text-[13px] leading-snug text-ink-text">
              Topics with worked examples
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              Prepare
            </dt>
            <dd className="m-0 mt-2 text-[13px] leading-snug text-ink-text">
              Resume analysis against a role
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">
              Ship
            </dt>
            <dd className="m-0 mt-2 text-[13px] leading-snug text-ink-text">
              Static sites on geekly.in
            </dd>
          </div>
        </dl>
      </div>

      <div className="relative z-10">
        <p className="m-0 max-w-sm text-xs leading-6 text-ink-muted">
          A space to learn, prepare, and grow as an engineer.
        </p>
      </div>
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
      <Background />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-[1440px] flex-col lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        {/* Editorial brand panel */}
        <EditorialPanel />

        {/* Authentication area */}
        <div className="flex min-h-svh flex-col bg-surface/60">
          {/* Mobile brand header */}
          <header className="flex px-6 py-6 lg:hidden">
            <Wordmark />
          </header>

          <main className="animate-page flex flex-1 items-center justify-center px-4 pb-12 pt-4 sm:px-8 lg:px-12 lg:py-16">
            <div className="w-full max-w-[420px] rounded-panel border border-border bg-surface p-6 shadow-card sm:p-8">
              {/* Form heading */}
              <div>
                <h1 className="text-balance font-heading text-[26px] font-semibold leading-[1.2] tracking-[-0.03em] text-text sm:text-[30px]">
                  {title}
                </h1>

                {description && (
                  <p className="mt-2.5 text-sm leading-6 text-text-secondary">
                    {description}
                  </p>
                )}
              </div>

              {/* Form content */}
              <div className="mt-7">
                {children}
              </div>

              {/* Footer links */}
              {footer && (
                <div className="mt-7 border-t border-border-secondary pt-6 text-center text-[13px] leading-6 text-text-secondary">
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
      className="font-semibold text-brand-strong transition-colors hover:text-brand-strong-hover focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </Link>
  );
}
