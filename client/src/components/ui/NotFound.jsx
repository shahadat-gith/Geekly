import { Link } from 'react-router-dom';
import { Button } from './Button.jsx';

export function NotFound({ message = 'Page not found' }) {
  return (
    <div className="mx-auto flex min-h-[62vh] max-w-2xl flex-col justify-center px-4 py-20 sm:px-6">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-brand" />
        <p className="folio m-0">Error 404</p>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>

      <h1 className="mt-5 text-balance font-heading text-[32px] font-medium leading-[1.15] tracking-[-0.025em] sm:text-[38px]">
        {message}
      </h1>

      <p className="mt-3 max-w-md text-[14px] leading-[1.75] text-text-secondary">
        The page you are looking for does not exist, may have moved, or is
        currently unavailable.
      </p>

      <div className="mt-8">
        <Button as={Link} to="/#topics" size="sm">
          Browse topics
        </Button>
      </div>
    </div>
  );
}
