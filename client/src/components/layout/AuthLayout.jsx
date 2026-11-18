
import { Link } from 'react-router-dom';
import { Background } from './Background.jsx';

function Wordmark() {
  return (
    <Link
      to="/"
      aria-label="Geekly home"
      className="inline-flex w-fit rounded-button transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
    >
      <img
        src="/brand_light.png"
        alt="Geekly"
        className="h-9 w-auto max-w-[155px] object-contain"
      />
    </Link>
  );
}

function EditorialPanel() {
  return (
    <aside className="relative hidden min-h-svh flex-col justify-between overflow-hidden border-r border-border/70 bg-[#F1F6ED] px-10 py-10 lg:flex xl:px-14">

      {/* Decorative elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #78936C 1px, transparent 0)',
          backgroundSize: '28px 28px',
          maskImage: 'linear-gradient(to bottom, black, transparent 75%)',
        }}
      />

      <div className="pointer-events-none absolute -right-32 top-24 h-96 w-96 rounded-full bg-[#B9E5A2]/40 blur-3xl" />

      <div className="relative z-10">
        <Wordmark />
      </div>

      <div className="relative z-10 max-w-lg py-16">

        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#D8E6D0] bg-white/70 px-3.5 py-2">
          <span className="h-2 w-2 rounded-full bg-[#80AE69]" />
          <span className="text-xs font-semibold tracking-wide text-[#526B49]">
            BUILT FOR ENGINEERS
          </span>
        </div>

        <h2 className="max-w-lg font-heading text-4xl font-semibold leading-[1.13] tracking-[-0.045em] text-[#252D24] xl:text-[48px]">
          Grow your skills.
          <br />
          <span className="text-[#638B50]">
            Build your career.
          </span>
        </h2>

        <p className="mt-6 max-w-md text-[15px] leading-7 text-[#697466]">
          Everything you need to become a stronger engineer.
          Understand core concepts, master system design,
          prepare for technical interviews, and take your
          career to the next level.
        </p>
      </div>

      <div className="relative z-10">
        <p className="max-w-sm text-xs leading-6 text-[#899283]">
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
        <div className="flex min-h-svh flex-col bg-surface/50">

          {/* Mobile brand header */}
          <header className="flex px-6 py-6 lg:hidden">
            <Wordmark />
          </header>

          <main className="animate-page flex flex-1 items-center justify-center px-5 pb-12 pt-4 sm:px-8 lg:px-12 lg:py-16">

            <div className="w-full max-w-[420px] rounded-[24px] border border-border/80 bg-surface p-6 shadow-card sm:p-9">

              {/* Form heading */}
              <div>
                <h1 className="text-balance font-heading text-[28px] font-semibold leading-[1.2] tracking-[-0.035em] text-text sm:text-[32px]">
                  {title}
                </h1>

                {description && (
                  <p className="mt-3 text-sm leading-6 text-text-secondary">
                    {description}
                  </p>
                )}
              </div>

              {/* Form content */}
              <div className="mt-8">
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
      className="font-semibold text-[#527C42] transition-colors hover:text-[#365D2B] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {children}
    </Link>
  );
}
