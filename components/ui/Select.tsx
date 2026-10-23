"use client";

import React, { SelectHTMLAttributes, forwardRef, useId } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      error,
      helperText,
      placeholder,
      required,
      disabled,
      name,
      id,
      fullWidth = true,
      className = "",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || name || generatedId;
    const hasError = Boolean(error);

    return (
      <div className={`${fullWidth ? "w-full" : "inline-block"} text-left`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5"
          >
            {label}
            {required && <span className="text-gold ml-1 font-bold">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`
              w-full text-sm rounded-lg transition-all duration-200
              bg-card text-text appearance-none cursor-pointer
              border
              ${
                hasError
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                  : "border-border focus:border-gold focus:ring-2 focus:ring-gold/20"
              }
              pl-3.5 pr-10 py-2.5
              outline-none
              disabled:opacity-50 disabled:bg-ivory/60 disabled:cursor-not-allowed
              ${className}
            `.trim()}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-text-secondary">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {hasError ? (
          <p className="mt-1.5 text-xs text-error flex items-center gap-1 font-medium animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-text-secondary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
