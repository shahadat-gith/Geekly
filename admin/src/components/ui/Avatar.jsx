import { initialsFrom } from '../../utils/format.js';

const SIZES = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-9 w-9 text-[12px]',
  lg: 'h-11 w-11 text-[14px]',
};

export function Avatar({ email = '', name = '', size = 'md', className = '' }) {
  const initials = name ? initialsFrom(name) : initialsFrom(email);

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-bold text-brand ring-1 ring-brand/10 ${SIZES[size] ?? SIZES.md} ${className}`}
    >
      {initials}
    </span>
  );
}
