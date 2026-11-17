import { Link } from 'react-router-dom';
import { Button } from '../ui/Button.jsx';

export function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 sm:pb-24">
      <div className="overflow-hidden rounded-panel bg-ink px-6 py-12 sm:px-10 sm:py-14 lg:px-14">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14">
          <div>
            <h2 className="max-w-xl text-balance font-heading text-[30px] font-semibold leading-[1.15] tracking-[-0.025em] text-ink-text sm:text-[36px]">
              Start with one lesson.
            </h2>
            <p className="mt-4 max-w-lg text-[14.5px] leading-[1.75] text-ink-muted">
              Pick a topic above and read the first lesson. Reading is open to everyone; an
              account keeps you signed in.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button as={Link} to="/auth/register">
              Create an account
            </Button>
            <Button as="a" href="#topics" variant="inverse">
              Browse topics
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
