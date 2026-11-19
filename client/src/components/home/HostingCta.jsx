import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaGlobe,
  FaUpload,
  FaRotateLeft,
  FaCircleCheck,
  FaArrowUpRightFromSquare,
} from 'react-icons/fa6';
import { Button } from '../ui/Button.jsx';

const FEATURES = [
  {
    Icon: FaUpload,
    title: 'Upload a built folder',
    description: 'Drop in the output of your build. Its index.html becomes the front page.',
  },
  {
    Icon: FaGlobe,
    title: 'Your own geekly.in address',
    description: 'Pick a name and your site goes live at yourname.geekly.in.',
  },
  {
    Icon: FaRotateLeft,
    title: 'Roll back any time',
    description: 'Make an earlier version live again instantly, without uploading anything.',
  },
];

function SitePreview() {
  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      <div className="absolute -inset-5 rounded-[2rem] bg-accent-soft/70 blur-2xl" />

      <div className="relative overflow-hidden rounded-panel border border-border bg-surface shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-[#527C42]">
              <FaGlobe className="text-[15px]" />
            </div>

            <div>
              <p className="text-[13px] font-semibold text-text">My portfolio</p>
              <p className="text-[11px] text-text-tertiary">my-portfolio.geekly.in</p>
            </div>
          </div>

          <span className="rounded-full border border-success/20 bg-success/5 px-2.5 py-1 text-[10px] font-semibold text-success">
            Live
          </span>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
              Publish status
            </p>
            <p className="mt-2 text-[15px] font-semibold text-text">
              Your site is online.
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
              Upload a new version whenever you rebuild, and keep the old ones to fall back on.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-secondary p-4">
            <div className="flex items-center gap-2">
              <FaRotateLeft className="text-[12px] text-[#527C42]" />
              <p className="text-[12px] font-semibold text-text">Versions</p>
            </div>

            <div className="mt-4 space-y-3">
              {[
                ['Version 3', 'Current', 'bg-success/10 text-success'],
                ['Version 2', 'Ready', 'bg-accent-soft text-[#A36B32]'],
                ['Version 1', 'Ready', 'bg-accent-soft text-[#A36B32]'],
              ].map(([title, status, tone]) => (
                <div key={title} className="flex items-center justify-between gap-3">
                  <span className="text-[11.5px] text-text-secondary">{title}</span>
                  <span className={`rounded-md px-2 py-1 text-[10px] font-medium ${tone}`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-2">
              <FaCircleCheck className="text-[12px] text-success" />
              <p className="text-[12px] font-semibold text-text">Checked before going live</p>
            </div>
            <div className="mt-3 space-y-2.5">
              {['index.html found at the top level', 'Files validated and uploaded', 'Address reserved for your site'].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <FaCircleCheck className="mt-0.5 shrink-0 text-[10px] text-success" />
                  <span className="text-[11.5px] leading-relaxed text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-[10px] text-text-tertiary">
            Illustrative preview · Sites are served from geekly.in addresses
          </p>
        </div>
      </div>

      <div className="absolute -bottom-5 -right-3 hidden items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 shadow-card sm:flex">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-[#527C42]">
          <FaArrowUpRightFromSquare className="text-[11px]" />
        </span>
        <span className="text-[11px] font-semibold text-text">Open your site in one click</span>
      </div>
    </div>
  );
}

export function HostingCta() {
  return (
    <section className="relative isolate overflow-hidden border-y border-border bg-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[500px] w-[500px] rounded-full bg-accent-soft/60 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -right-40 -z-10 h-[400px] w-[400px] rounded-full bg-brand-soft/70 blur-3xl"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 sm:py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div className="order-2 lg:order-1">
          <SitePreview />
        </div>

        <div className="order-1 max-w-xl lg:order-2">
          <h2 className="mt-6 text-balance font-heading text-[34px] font-semibold leading-[1.12] tracking-[-0.04em] sm:text-[42px] lg:text-[46px]">
            Built it? Put it online.
            <span className="text-[#527C42]">
              {' '}Under your own geekly.in address.
            </span>
          </h2>

          <p className="mt-5 max-w-lg text-[14.5px] leading-[1.8] text-text-secondary sm:text-[15.5px]">
            Publish a static website from a folder in a few clicks. Every
            version is kept, so you can roll back if a release goes wrong.
          </p>

          <div className="mt-8 space-y-4">
            {FEATURES.map(({ Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-secondary text-[#527C42]">
                  <Icon className="text-[14px]" />
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-text">{title}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button as={Link} to="/deployments">
              Publish a site
              <FaArrowRight aria-hidden="true" className="text-[13px]" />
            </Button>

            <span className="text-[11.5px] text-text-tertiary">Static sites · index.html required</span>
          </div>
        </div>
      </div>
    </section>
  );
}
