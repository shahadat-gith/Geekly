import { useId } from 'react';

const controlBase =
  'w-full rounded-field border bg-surface px-3.5 text-[14px] text-text placeholder:text-text-tertiary outline-none transition-shadow focus:border-border-focus focus:ring-4 focus:ring-brand-soft disabled:opacity-55';

function FieldFrame({ label, htmlFor, hint, error, required, children, className = '' }) {
  const descriptionId = `${htmlFor}-description`;
  const hasDescription = Boolean(error || hint);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="text-[12.5px] font-semibold text-text-secondary">
          {label}
          {required && <span className="ml-1 text-brand">*</span>}
        </label>
      )}
      {children}
      {hasDescription && (
        <p
          id={descriptionId}
          className={`m-0 text-[11.5px] leading-relaxed ${error ? 'text-error' : 'text-text-tertiary'}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}

export function Input({ label, hint, error, id, className = '', required, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FieldFrame
      label={label}
      htmlFor={inputId}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${inputId}-description` : undefined}
        className={`${controlBase} min-h-[42px] ${error ? 'border-error' : 'border-border'}`}
        {...props}
      />
    </FieldFrame>
  );
}

export function Textarea({ label, hint, error, id, className = '', required, rows = 4, ...props }) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldFrame
      label={label}
      htmlFor={fieldId}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <textarea
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${fieldId}-description` : undefined}
        className={`${controlBase} resize-y py-2.5 leading-relaxed ${error ? 'border-error' : 'border-border'}`}
        {...props}
      />
    </FieldFrame>
  );
}

export function Select({
  label,
  hint,
  error,
  id,
  className = '',
  required,
  children,
  ...props
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldFrame
      label={label}
      htmlFor={fieldId}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <div className="relative">
        <select
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${fieldId}-description` : undefined}
          className={`${controlBase} min-h-[42px] appearance-none pr-9 ${error ? 'border-error' : 'border-border'}`}
          {...props}
        >
          {children}
        </select>
        <i
          aria-hidden="true"
          className="bx bx-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-text-tertiary"
        />
      </div>
    </FieldFrame>
  );
}
