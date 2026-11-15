import { Link } from 'react-router-dom';

export function Brand({
  size = 15,
  inline = true,
  showLink = true,
  className = '',
}) {
  const content = (
    <span
      className={`inline-flex ${inline ? 'flex-row items-baseline gap-[0.35ch]' : 'flex-col items-center gap-0.5'} whitespace-nowrap font-extrabold leading-tight tracking-[-0.035em] ${className}`}
      style={{ fontSize: size }}
    >
      <span className="text-text">NOOB</span>
      <span className="bg-gradient-to-r from-brand to-brand-hover bg-clip-text text-transparent">
        ENGINEER
      </span>
    </span>
  );

  if (!showLink) return content;

  return (
    <Link to="/" className="inline-flex" aria-label="Noob Engineer home">
      {content}
    </Link>
  );
}
