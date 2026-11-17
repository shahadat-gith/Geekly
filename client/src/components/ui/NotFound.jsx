import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa6';
import { Button } from './Button.jsx';

export function NotFound({ message = 'Page not found' }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-balance font-heading text-[32px] font-semibold leading-[1.12] tracking-[-0.03em] sm:text-[40px]">
        {message}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-[14.5px] leading-[1.7] text-text-secondary">
        The page you were looking for is not here, or it has not been published yet.
      </p>
      <Button as={Link} to="/" className="mt-8">
        <FaArrowRight aria-hidden="true" className="text-[14px]" />
        Explore topics
      </Button>
    </div>
  );
}
