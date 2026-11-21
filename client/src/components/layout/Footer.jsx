import { Link } from 'react-router-dom';

const LEARN = [
  { label: 'Browse topics', to: '/#topics' },
  { label: 'System design', to: '/#topics' },
  { label: 'CS fundamentals', to: '/#topics' },
];

const TOOLS = [
  { label: 'Resume analysis', to: '/resume-analysis' },
  { label: 'My sites', to: '/deployments' },
  { label: 'Profile', to: '/profile' },
];

const LEGAL = [
  { label: 'Terms of service', to: '/terms' },
  { label: 'Privacy policy', to: '/privacy' },
];

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_1fr] lg:gap-12">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              to="/"
              aria-label="Geekly home"
              className="inline-flex rounded-button transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img
                src="/logo.png"
                alt="Geekly"
                className="h-8 w-auto max-w-[150px] object-contain"
              />
            </Link>

            <p className="mt-5 text-sm leading-7 text-text-secondary">
              Understand what your code runs on — backend, databases,
              operating systems, networking and system design — with
              worked examples for engineers.
            </p>

            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-tertiary">
              Built for engineers
            </p>
          </div>

          {/* Learn */}
          <nav aria-label="Learn">
            <h3 className="eyebrow m-0">Learn</h3>

            <ul className="mt-5 list-none space-y-3 p-0">
              {LEARN.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-secondary transition-colors hover:text-brand-strong focus-visible:outline-none"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Tools */}
          <nav aria-label="Tools">
            <h3 className="eyebrow m-0">Tools</h3>

            <ul className="mt-5 list-none space-y-3 p-0">
              {TOOLS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-secondary transition-colors hover:text-brand-strong focus-visible:outline-none"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal">
            <h3 className="eyebrow m-0">Legal</h3>

            <ul className="mt-5 list-none space-y-3 p-0">
              {LEGAL.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-secondary transition-colors hover:text-brand-strong focus-visible:outline-none"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-border-secondary pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-xs text-text-tertiary">
            © {new Date().getFullYear()} Geekly. All rights reserved.
          </p>

          <p className="m-0 text-xs text-text-tertiary">
            Designed and built by{' '}
            <a
              href="https://shahadat.geekly.in"
              rel="noopener noreferrer"
              target="_blank"
              className="font-semibold text-text-secondary transition-colors hover:text-brand-strong"
            >
              Shahadat
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
