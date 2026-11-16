import { Link } from 'react-router-dom';

const LEGAL = [
  { label: 'Terms and conditions', to: '/terms' },
  { label: 'Privacy policy', to: '/privacy' },
  { label: 'Data protection', to: '/data-protection' }
];

const CONTACT = [
  { label: 'Contact us', href: '#' },
  { label: 'Report a problem', href: '#' },
  { label: 'Developer', href: '#' },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-bg-secondary">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <img
              src="/brand_light.png"
              alt="Geekly"
              className="h-8 w-auto max-w-[150px] object-contain"
            />
            <p className="mt-4 text-[13.5px] leading-[1.7] text-text-secondary">
              Geekly helps people at the start of their engineering careers understand the systems
              they work with. It is built on the belief that understanding beats memorising.
            </p>
          </div>

          <div>
            <nav aria-label="Legal">
              <p className="text-[13px] font-semibold">Legal</p>
              <ul className="mt-3 list-none space-y-2 p-0">
                {LEGAL.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[13.5px] text-text-secondary transition hover:text-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <nav aria-label="Contact">
              <p className="text-[13px] font-semibold">Contact</p>
              <ul className="mt-3 list-none space-y-2 p-0">
                {CONTACT.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13.5px] text-text-secondary transition hover:text-text"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className='flex items-center justify-between border-t border-border mt-6'>
          <p className="m-0 pt-6 text-[12.5px] text-text-tertiary">
            © {new Date().getFullYear()} Geekly. All rights reserved.
          </p>
          <p className='m-0 pt-6 text-[12.5px] text-text-tertiary'>
            Built with ❤️ by{' '}
            <a href="https://shahadat.geekly.in" rel="noopener noreferrer" target="_blank" className="text-blue-600 hover:underline">
              Shahadat
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}
