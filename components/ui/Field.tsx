"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown, CircleAlert, Eye, EyeOff } from "lucide-react";

export const INPUT_CLASS =
  "w-full min-h-14 rounded-2xl border-[1.5px] border-line-2 bg-surface px-5 text-lg text-ink placeholder:text-ink-3/80 transition-colors hover:border-ink-3 focus:border-ink focus:outline-none aria-[invalid=true]:border-bad";

interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** Renders the label visually smaller (for grouped sub-fields like Day / Month / Year). */
  compact?: boolean;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

/** Label above, optional hint, the control, then a plain-words error. */
export function Field({ label, hint, error, compact, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={compact ? "eyebrow text-ink-2" : "text-lg font-semibold text-ink"}>
        {label}
      </label>
      {hint && <p id={hintId} className="-mt-1 text-base text-ink-2">{hint}</p>}
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error && (
        <p id={errorId} className="flex items-start gap-2 text-base font-medium text-bad">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "children"> {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
}

export function TextField({ label, hint, error, className = "", ...rest }: TextFieldProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <input id={id} aria-describedby={describedBy} aria-invalid={invalid} className={`${INPUT_CLASS} ${className}`} {...rest} />
      )}
    </Field>
  );
}

export function PasswordField({ label, hint, error, className = "", ...rest }: TextFieldProps) {
  const [shown, setShown] = useState(false);
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <input
            id={id}
            type={shown ? "text" : "password"}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={`${INPUT_CLASS} pr-28 ${className}`}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            className="absolute right-2 top-1/2 flex min-h-11 -translate-y-1/2 items-center gap-1.5 rounded-full px-3.5 text-base font-semibold text-ink-2 hover:bg-black/[0.05] hover:text-ink"
            aria-label={shown ? "Hide password" : "Show password"}
          >
            {shown ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            {shown ? "Hide" : "Show"}
          </button>
        </div>
      )}
    </Field>
  );
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  compact?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function SelectField({ label, hint, error, compact, options, placeholder, className = "", ...rest }: SelectFieldProps) {
  return (
    <Field label={label} hint={hint} error={error} compact={compact}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <select
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={`${INPUT_CLASS} appearance-none pr-11 ${className}`}
            {...rest}
          >
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-2" aria-hidden="true" />
        </div>
      )}
    </Field>
  );
}

/** A plain drop-down with a large tap area and a clear arrow. */
export function SelectBox({ className = "", children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={`${INPUT_CLASS} appearance-none pr-10 disabled:cursor-not-allowed ${className}`} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-2" aria-hidden="true" />
    </div>
  );
}
