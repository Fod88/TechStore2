import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function FieldShell({ id, label, error, hint, children, labelAction }) {
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      {(label || labelAction) && (
        <div className="field__head">
          {label && <label htmlFor={id}>{label}</label>}
          {labelAction}
        </div>
      )}
      {children}
      {error ? (
        <p className="field__error" id={`${id}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export const Input = forwardRef(function Input({ label, error, hint, id, className = '', labelAction, ...props }, ref) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint} labelAction={labelAction}>
      <input
        ref={ref}
        id={inputId}
        className={`input ${className}`}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy(inputId, error, hint)}
        {...props}
      />
    </FieldShell>
  );
});

export const PasswordInput = forwardRef(function PasswordInput({ label, error, hint, id, ...props }, ref) {
  const auto = useId();
  const inputId = id ?? auto;
  const [visible, setVisible] = useState(false);
  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint}>
      <div className="input-wrap">
        <input
          ref={ref}
          id={inputId}
          className="input input--with-action"
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          {...props}
        />
        <button
          type="button"
          className="input-wrap__action"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </FieldShell>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, id, ...props }, ref) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint}>
      <textarea
        ref={ref}
        id={inputId}
        className="input textarea"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy(inputId, error, hint)}
        {...props}
      />
    </FieldShell>
  );
});

export const Select = forwardRef(function Select({ label, error, hint, id, children, className = '', ...props }, ref) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint}>
      <select
        ref={ref}
        id={inputId}
        className={`input select ${className}`}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy(inputId, error, hint)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
});
