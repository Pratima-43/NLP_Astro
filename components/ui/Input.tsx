"use client";

import React, { InputHTMLAttributes, forwardRef, ReactNode, useId } from "react";
import { AlertCircle } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      rightIcon,
      id,
      name,
      type = "text",
      placeholder,
      value,
      onChange,
      required,
      disabled,
      fullWidth = true,
      className = "",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || name || generatedId;
    const hasError = Boolean(error);

    return (
      <div className={`${fullWidth ? "w-full" : "inline-block"} text-left`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5"
          >
            {label}
            {required && <span className="text-gold ml-1 font-bold">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            placeholder={placeholder}
            className={`
              w-full text-sm rounded-lg transition-all duration-200
              bg-card text-text placeholder:text-text-secondary/50
              border
              ${
                hasError
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                  : "border-border focus:border-gold focus:ring-2 focus:ring-gold/20"
              }
              ${icon ? "pl-10" : "pl-3.5"}
              ${rightIcon ? "pr-10" : "pr-3.5"}
              py-2.5
              outline-none
              disabled:opacity-50 disabled:bg-ivory/60 disabled:cursor-not-allowed
              ${className}
            `.trim()}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary flex items-center justify-center">
              {rightIcon}
            </div>
          )}
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

Input.displayName = "Input";
export default Input;
