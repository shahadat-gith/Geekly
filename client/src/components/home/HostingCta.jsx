import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaGlobe,
  FaUpload,
  FaRotateLeft,
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

export function HostingCta() {
  return (
    <section className="border-b border-border bg-bg">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="eyebrow m-0">Static hosting</p>

        <h2 className="mt-4 text-balance font-heading text-[32px] font-semibold leading-[1.12] tracking-[-0.035em] sm:text-[40px]">
          Built it? Put it online.
          <span className="text-brand-strong">
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
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-brand-strong">
                <Icon className="text-[14px]" />
              </div>

              <div>
                <p className="m-0 text-[13px] font-semibold text-text">{title}</p>
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

          <span className="font-mono text-[11px] text-text-tertiary">static sites · index.html required</span>
        </div>
      </div>
    </section>
  );
}
