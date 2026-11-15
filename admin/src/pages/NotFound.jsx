import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';

export default function NotFound() {
  return (
    <Card className="mx-auto mt-10 max-w-lg px-6 py-12 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
        <i aria-hidden="true" className="bx bx-map-alt text-[27px]" />
      </span>
      <p className="m-0 mt-4 font-heading text-[42px] font-semibold leading-none tracking-tight">404</p>
      <h1 className="m-0 mt-2 text-[18px] font-semibold">Page not found</h1>
      <p className="m-0 mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-text-secondary">
        The page you are looking for does not exist in the admin console.
      </p>
      <Button as={Link} to="/" className="mt-5">
        <i aria-hidden="true" className="bx bx-grid-alt text-[17px]" />
        Open dashboard
      </Button>
    </Card>
  );
}
