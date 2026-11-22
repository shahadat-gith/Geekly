import { Link } from 'react-router-dom';
import { Button } from '../ui/Button.jsx';

const STEPS = [
  {
    title: 'Upload your build folder',
    description: 'The index.html file becomes your home page.',
  },
  {
    title: 'Pick your address',
    description: 'Your site goes live at yourname.geekly.in.',
  },
  {
    title: 'Go back to an old version',
    description: 'Switch to an earlier upload if a release goes wrong.',
  },
];

// The version list is the product's own record: every upload keeps a
// version, and the live one is marked.
const VERSIONS = [
  { version: 'v12', time: 'just now', live: true },
  { version: 'v11', time: '2 days ago' },
  { version: 'v10', time: '5 days ago' },
];

function VersionHistory() {
  return (
    <figure className="m-0 self-start rounded-panel border border-ink-soft bg-ink-secondary p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 border-b border-ink-soft pb-4">
        <p className="m-0 font-mono text-[12px] text-ink-text">
          notes.geekly.in
        </p>

        <p className="m-0 inline-flex items-center gap-2 font-mono text-[11px] text-ink-muted">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-mint" />
          live
        </p>
      </div>

      <p className="m-0 mt-5 font-mono text-[11px] text-ink-muted">Versions</p>

      <ul className="m-0 mt-2 list-none p-0">
        {VERSIONS.map(({ version, time, live }) => (
          <li
            key={version}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-b border-ink-soft py-3 last:border-b-0"
          >
            <span className="font-mono text-[12.5px] text-ink-text">
              {version}
              {live && (
                <span className="ml-2 font-sans text-[11px] text-ink-muted">
                  live
                </span>
              )}
            </span>

            <span className="font-mono text-[11px] text-ink-muted">{time}</span>
          </li>
        ))}
      </ul>

      <p className="m-0 mt-4 text-[12.5px] leading-[1.65] text-ink-muted">
        Every upload becomes a new version. Old versions stay online until you
        switch back.
      </p>
    </figure>
  );
}

export function HostingCta() {
  return (
    <section className="bg-ink">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,464px)] lg:gap-16 lg:px-8 lg:py-24">
        <div>
          <h2 className="m-0 max-w-[24ch] text-balance font-heading text-[32px] font-medium leading-[1.12] tracking-[-0.025em] text-ink-text sm:text-[38px]">
            Put your website online
          </h2>

          <p className="mt-4 max-w-[52ch] text-[14.5px] leading-[1.7] text-ink-muted sm:text-[15px]">
            Upload your build folder and choose a name. Your site goes live at
            yourname.geekly.in, and earlier uploads stay online.
          </p>

          <ol className="m-0 mt-8 list-none p-0">
            {STEPS.map(({ title, description }, index) => (
              <li
                key={title}
                className="grid grid-cols-[24px_minmax(0,1fr)] gap-4 border-t border-ink-soft py-4 last:border-b last:border-ink-soft"
              >
                <span className="pt-0.5 font-mono text-[11px] tabular-nums text-ink-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span>
                  <span className="block text-[14px] font-medium text-ink-text">
                    {title}
                  </span>
                  <span className="mt-1 block max-w-[46ch] text-[13px] leading-[1.6] text-ink-muted">
                    {description}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-8">
            <Button as={Link} to="/deployments" variant="light">
              Publish a site
            </Button>
          </div>
        </div>

        <VersionHistory />
      </div>
    </section>
  );
}
