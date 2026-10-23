"use client";

import React, { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "navy";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-white hover:bg-gold-dark active:bg-gold-dark shadow-sm hover:shadow transition-all focus:ring-gold/40",
  secondary:
    "bg-transparent border border-gold text-gold hover:bg-gold/10 active:bg-gold/20 transition-all focus:ring-gold/30",
  ghost:
    "bg-transparent text-text hover:bg-gold/10 hover:text-gold active:bg-gold/20 transition-colors focus:ring-gold/30",
  danger:
    "bg-error text-white hover:bg-error/90 active:bg-error/95 shadow-sm hover:shadow transition-all focus:ring-error/40",
  navy:
    "bg-navy text-white hover:bg-navy-light active:bg-navy-light shadow-sm hover:shadow transition-all focus:ring-navy/40",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-6 py-3.5 rounded-xl gap-2.5 font-medium",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      fullWidth = false,
      icon,
      iconPosition = "left",
      className = "",
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center font-medium select-none
          cursor-pointer outline-none focus:ring-2 focus:ring-offset-1
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          active:scale-[0.98] transition-transform
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `.trim()}
        {...props}
      >
        {loading ? (
          <Loader2
            className={`animate-spin ${
              size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4"
            }`}
          />
        ) : (
          icon && iconPosition === "left" && <span>{icon}</span>
        )}

        {children && <span>{children}</span>}

        {!loading && icon && iconPosition === "right" && <span>{icon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
