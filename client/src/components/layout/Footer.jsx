
import { Link } from 'react-router-dom';

const EXPLORE = [
  { label: 'Interview preparation', to: '/#topics' },
  { label: 'System design', to: '/#topics' },
  { label: 'CS fundamentals', to: '/#topics' },
];

const CAREER = [
  { label: 'Resume analysis', to: '/resume' },
];

const LEGAL = [
  { label: 'Terms of service', to: '/terms' },
  { label: 'Privacy policy', to: '/privacy' },
];

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-border/70 bg-surface">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-8 lg:px-10">

        {/* Main footer */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_1fr] lg:gap-12">

          {/* Brand */}
          <div className="max-w-sm">
            <Link
              to="/"
              aria-label="Geekly home"
              className="inline-flex rounded-button transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
            >
              <img
                src="/logo.png"
                alt="Geekly"
                className="h-8 w-auto max-w-[150px] object-contain"
              />
            </Link>

            <p className="mt-5 text-sm leading-7 text-text-secondary">
              A platform for engineers to sharpen their skills, prepare
              for technical interviews, and grow their careers.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" />
              <span className="text-xs font-medium text-text-secondary">
                Built for engineers
              </span>
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Explore">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text">
              Explore
            </h3>

            <ul className="mt-5 list-none space-y-3 p-0">
              {EXPLORE.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-secondary transition-colors hover:text-brand-active"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Career */}
          <nav aria-label="Career tools">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text">
              Career tools
            </h3>

            <ul className="mt-5 list-none space-y-3 p-0">
              {CAREER.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-secondary transition-colors hover:text-brand-active"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text">
              Legal
            </h3>

            <ul className="mt-5 list-none space-y-3 p-0">
              {LEGAL.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-secondary transition-colors hover:text-brand-active"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">

          <p className="m-0 text-xs text-text-tertiary">
            © {new Date().getFullYear()} Geekly. All rights reserved.
          </p>

          <p className="m-0 text-xs text-text-tertiary">
            Designed and built with{' '}
            <span aria-label="love" role="img">♥</span>
            {' '}by{' '}
            <a
              href="https://shahadat.geekly.in"
              rel="noopener noreferrer"
              target="_blank"
              className="font-semibold text-text-secondary transition-colors hover:text-brand-active"
            >
              Shahadat
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
