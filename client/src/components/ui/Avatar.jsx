
import { useState } from 'react';

const SIZES = {
  sm: 'h-8 w-8 text-[12px]',
  md: 'h-9 w-9 text-[13px]',
  lg: 'h-11 w-11 text-[15px]',
};

function getInitials(name) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return initials || '?';
}

/**
 * User avatar with an initials fallback.
 * Pass `alt=""` (the default) when the avatar sits inside an already-labelled
 * control such as the profile button.
 */
export function Avatar({
  src,
  name = '',
  size = 'md',
  alt = '',
  className = '',
}) {
  const [failedSrc, setFailedSrc] = useState(null);
  const sizeClass = SIZES[size] ?? SIZES.md;

  const baseClass = `shrink-0 rounded-full ${sizeClass} ${className}`;

  if (src && failedSrc !== src) {
    return (
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(src)}
        className={`${baseClass} object-cover`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center ${baseClass} bg-brand-soft font-semibold text-brand-strong`}
    >
      {getInitials(name)}
    </span>
  );
}
