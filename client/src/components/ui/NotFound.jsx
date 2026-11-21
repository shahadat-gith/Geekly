import { Link } from 'react-router-dom';
import { FaCompass } from 'react-icons/fa6';
import { Button } from './Button.jsx';

export function NotFound({ message = 'Page not found' }) {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-brand-soft text-brand-strong">
        <FaCompass aria-hidden="true" className="text-[22px]" />
      </div>

      <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        Error 404
      </span>

      <h1 className="mt-3 text-balance font-heading text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[34px]">
        {message}
      </h1>

      <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-[1.75] text-text-secondary">
        The page you're looking for doesn't exist, may have moved, or is
        currently unavailable.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button as={Link} to="/#topics" variant="primary" size="sm">
          Browse topics
        </Button>
      </div>
    </div>
  );
}
