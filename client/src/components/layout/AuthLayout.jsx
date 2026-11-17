import { Link } from 'react-router-dom';
import { Background } from './Background.jsx';

const SUBJECTS = ['Backend & APIs', 'Databases', 'Operating systems', 'Networking', 'System design'];

function Wordmark() {
  return (
    <Link
      to="/"
      aria-label="Geekly home"
      className="inline-flex w-fit rounded-button focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
    >
      <img
        src="/brand_light.png"
        alt="Geekly"
        className="h-8 w-auto max-w-[150px] object-contain sm:h-9"
      />
    </Link>
  );
}

// Shell for the auth screens. On wide screens a quiet editorial column carries
// the brand and the form sits alone on the right; on small screens only the
// wordmark and the form remain. There is no site header or footer here.
export function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="relative isolate min-h-svh">
      <Background />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-6xl flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <aside className="hidden flex-col justify-between border-r border-border px-10 py-10 lg:flex">
          <Wordmark />

          <div className="py-10">
            <p className="max-w-sm text-balance font-heading text-[30px] font-semibold leading-[1.2] tracking-[-0.03em]">
              Learn the systems behind the software you build.
            </p>
            <ul className="mt-8 list-none border-t border-border p-0">
              {SUBJECTS.map((subject) => (
                <li
                  key={subject}
                  className="border-b border-border py-2.5 text-[13px] text-text-secondary"
                >
                  {subject}
                </li>
              ))}
            </ul>
          </div>

          <p className="max-w-xs text-[12.5px] leading-relaxed text-text-tertiary">
            Plain language, worked examples and diagrams. Reading is open to everyone.
          </p>
        </aside>

        <div className="flex min-h-svh flex-col">
          <header className="flex px-6 py-5 lg:hidden">
            <Wordmark />
          </header>

          <main className="animate-page flex flex-1 items-center justify-center px-6 pb-16 pt-4 sm:pb-20">
            <div className="w-full max-w-[380px]">
              <h1 className="text-balance font-heading text-[28px] font-semibold leading-[1.15] tracking-[-0.03em]">
                {title}
              </h1>
              {description && (
                <p className="mt-3 text-[14px] leading-[1.65] text-text-secondary">{description}</p>
              )}

              <div className="mt-8">{children}</div>

              {footer && (
                <div className="mt-7 border-t border-border pt-5 text-[13px] text-text-secondary">
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

export function AuthLink({ to, children }) {
  return (
    <Link to={to} className="font-medium text-brand transition hover:text-brand-hover">
      {children}
    </Link>
  );
}
