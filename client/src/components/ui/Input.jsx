
import { useId } from 'react';

const FIELD_BASE =
  'w-full min-h-[44px] rounded-field border bg-surface px-4 text-[14px] text-text placeholder:text-text-tertiary outline-none transition-[border-color,box-shadow,background] duration-150 focus:ring-4 disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:opacity-65';

const FIELD_STATES = {
  default:
    'border-border hover:border-text-tertiary focus:border-border-focus focus:ring-brand-soft',
  error:
    'border-error/70 hover:border-error focus:border-error focus:ring-error/10',
};

/**
 * Labelled text input.
 * `error` swaps the field to the error tone and replaces the hint with the
 * message, wiring up `aria-invalid` and `aria-describedby`.
 */
export function Input({
  label,
  hint,
  error,
  id,
  className = '',
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const hasDescription = Boolean(error || hint);

  const fieldClass = [
    FIELD_BASE,
    error ? FIELD_STATES.error : FIELD_STATES.default,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-medium text-text"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasDescription ? descriptionId : undefined}
        className={fieldClass}
        {...props}
      />

      {hasDescription && (
        <p
          id={descriptionId}
          className={`m-0 text-[12px] leading-relaxed ${error ? 'text-error' : 'text-text-tertiary'
            }`}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}
