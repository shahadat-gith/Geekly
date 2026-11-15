import { Link } from 'react-router-dom';

export function Brand({ to = '/', size = 30, className = ''}) {
  const content = (
    <>
      <img src="/favicon.svg" width={size} height={size} alt="" className="shrink-0 rounded-[9px]" />
    </>
  );

  if (!to) return <span className={`inline-flex items-center gap-2.5 ${className}`}>{content}</span>;

  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2.5 rounded-button focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-soft ${className}`}
      aria-label="Noob Engineer admin dashboard"
    >
      {content}
    </Link>
  );
}
