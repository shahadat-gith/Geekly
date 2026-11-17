import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa6';
import { Button } from '../ui/Button.jsx';

const SUBJECTS = ['Backend & APIs', 'Databases', 'Operating systems', 'Networking', 'System design'];

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-14 pt-12 sm:pb-20 sm:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-14">
        <div>
          <h1 className="max-w-[16ch] text-balance font-heading text-[42px] font-semibold leading-[1.04] tracking-[-0.03em] xs:text-[50px] sm:text-[58px] lg:text-[62px]">
            Understand what your code <span className="text-brand">runs on</span>.
          </h1>

          <p className="mt-6 max-w-xl text-[15.5px] leading-[1.75] text-text-secondary sm:text-[16.5px]">
            Geekly explains how the software you build actually works — the systems, tools and
            trade-offs behind it. Lessons start from a real problem, then show the mechanism, with
            worked examples and diagrams for engineers.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button as="a" href="#topics">
              Browse topics
              <FaArrowRight aria-hidden="true" className="text-[14px]" />
            </Button>
            <Link
              to="/auth/register"
              className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-text transition hover:text-brand"
            >
              Create an account
              <FaArrowRight
                aria-hidden="true"
                className="text-[12px] transition duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>

          <p className="mt-5 text-[12.5px] text-text-tertiary">
            Reading is open to everyone. An account keeps you signed in.
          </p>
        </div>

        <div className="overflow-hidden rounded-card border border-border shadow-card">
          <img
            src="/hero.webp"
            alt="Illustration of engineering concepts and software systems"
            className="block h-auto w-full object-cover"
          />
        </div>
      </div>

      <ul className="mt-14 flex list-none flex-wrap items-center gap-x-7 gap-y-3 border-t border-border p-0 pt-6">
        {SUBJECTS.map((subject) => (
          <li
            key={subject}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-text-secondary"
          >
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-brand" />
            {subject}
          </li>
        ))}
      </ul>
    </section>
  );
}
