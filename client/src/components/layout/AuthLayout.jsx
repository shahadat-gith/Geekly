import { Link } from 'react-router-dom';
import { Card } from '../ui/Card.jsx';
import { Background } from './Background.jsx';

// Shell for the auth screens: wordmark and one centred column.
// The site header and footer are not rendered here, so nothing competes with
// the form. Shared by login, register and the reset pages so they cannot drift.
// `card` sets the form on a surface panel (used by sign in and register).
export function AuthLayout({ title, description, children, footer, card = false }) {
  const content = (
    <>
      <h1
        className={`font-heading font-normal leading-[1.02] tracking-[-0.02em] ${
          card ? 'text-[34px]' : 'text-[42px]'
        }`}
      >
        {title}
      </h1>
      {description && (
        <p className="mt-2.5 text-[14px] leading-[1.65] text-text-secondary">{description}</p>
      )}

      <div className={card ? 'mt-7' : 'mt-8'}>{children}</div>

      {footer && <div className="mt-6 text-[13px] text-text-secondary">{footer}</div>}
    </>
  );

  return (
    <div className="relative isolate min-h-svh">
      <Background />
      <div className="relative z-10 flex min-h-svh flex-col">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            aria-label="Geekly home"
            className="inline-flex items-center rounded-button focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
          >
            <img
              src="/brand_light.png"
              alt="Geekly"
              className="h-8 w-auto max-w-[150px] object-contain sm:h-9"
            />
          </Link>
        </header>

        <main className="animate-page flex flex-1 items-start justify-center px-6 pb-16 pt-8 sm:items-center sm:pb-24 sm:pt-0">
          <div className="w-full max-w-[368px]">
            {card ? (
              <Card className="border border-border px-6 py-7">{content}</Card>
            ) : (
              content
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AuthLink({ to, children }) {
  return (
    <Link to={to} className="font-medium text-brand hover:text-brand-hover">
      {children}
    </Link>
  );
}
