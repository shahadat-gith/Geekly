import { Link } from 'react-router-dom';

const READ = [{ label: 'Start with a topic', to: '/#topics' }];

const LEGAL = [
  { label: 'Terms and conditions', to: '/terms' },
  { label: 'Privacy policy', to: '/privacy' },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-bg-secondary">
      <div className="mx-auto max-w-6xl px-6 pb-8 pt-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="max-w-sm">
            <Link
              to="/"
              aria-label="Geekly home"
              className="inline-flex rounded-button focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft"
            >
              <img
                src="/brand_light.png"
                alt="Geekly"
                className="h-8 w-auto max-w-[150px] object-contain"
              />
            </Link>
            <p className="mt-4 text-[13.5px] leading-[1.7] text-text-secondary">
              Geekly helps engineers understand the systems, tools and trade-offs behind the
              software they work on. Built on the belief that understanding beats memorising.
            </p>
          </div>

          <nav aria-label="Read">
            <p className="text-[12.5px] font-semibold text-text">Read</p>
            <ul className="mt-3 list-none space-y-2 p-0">
              {READ.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[13.5px] text-text-secondary transition hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <p className="text-[12.5px] font-semibold text-text">Legal</p>
            <ul className="mt-3 list-none space-y-2 p-0">
              {LEGAL.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[13.5px] text-text-secondary transition hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-[12.5px] text-text-tertiary">
            © {new Date().getFullYear()} Geekly. All rights reserved.
          </p>
          <p className="m-0 text-[12.5px] text-text-tertiary">
            Built with ❤️ by{' '}
            <a
              href="https://shahadat.geekly.in"
              rel="noopener noreferrer"
              target="_blank"
              className="font-medium text-text-secondary transition hover:text-brand"
            >
              Shahadat
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
