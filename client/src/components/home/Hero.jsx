import { Link } from 'react-router-dom';
import { FaBookOpen, FaFileLines } from 'react-icons/fa6';
import { Button } from '../ui/Button.jsx';

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <div>
          <p className="eyebrow m-0">Engineering, explained</p>

          <h1 className="mt-4 max-w-[16ch] text-balance font-heading text-[40px] font-semibold leading-[1.07] tracking-[-0.035em] xs:text-[48px] sm:text-[56px] lg:text-[60px]">
            Understand what
            <span className="text-brand-strong"> your code runs on.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-[1.8] text-text-secondary sm:text-[16px]">
            Learn backend, databases, operating systems, networking and
            system design through worked examples and diagrams — then
            check your resume against a real role and ship your own site.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button as={Link} to="/#topics" size="lg">
              <FaBookOpen aria-hidden="true" className="text-[14px]" />
              Browse topics
            </Button>

            <Button as={Link} to="/resume-analysis" variant="secondary" size="lg">
              <FaFileLines aria-hidden="true" className="text-[14px]" />
              Analyze a resume
            </Button>
          </div>

          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.12em] text-text-tertiary">
            No account needed to read · Sign in for tools
          </p>
        </div>

        <figure className="relative m-0">
          <div className="overflow-hidden rounded-panel border border-border bg-surface shadow-card">
            <div className="flex items-center gap-2 border-b border-border-secondary bg-surface-secondary px-4 py-3">
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-border" />
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-border" />
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="ml-2 truncate font-mono text-[11px] text-text-tertiary">
                geekly.in — system design
              </span>
            </div>

            <img
              src="/hero.webp"
              alt="Illustration of engineering concepts and software systems"
              className="block h-auto w-full object-cover"
            />
          </div>
        </figure>
      </div>
    </section>
  );
}
