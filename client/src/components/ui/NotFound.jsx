
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCompass,
} from 'react-icons/fa6';
import { Button } from './Button.jsx';

export function NotFound({ message = 'Page not found' }) {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-brand-soft text-[#527C42]">
        <FaCompass aria-hidden="true" className="text-[26px]" />
      </div>

      <span className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
        Error 404
      </span>

      <h1 className="text-balance font-heading text-[32px] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[40px]">
        {message}
      </h1>

      <p className="mx-auto mt-4 max-w-md text-[14px] leading-[1.75] text-text-secondary">
        The page you're looking for doesn't exist, may have moved, or is
        currently unavailable.
      </p>

      <Button
        as={Link}
        to="/"
        variant="primary"
        className="mt-8"
      >
        <FaArrowLeft aria-hidden="true" className="text-[13px]" />
        Back to home
      </Button>
    </div>
  );
}
