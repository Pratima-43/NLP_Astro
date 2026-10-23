"use client";

import React, { ReactNode } from "react";

export type BadgeVariant =
  | "gold"
  | "navy"
  | "success"
  | "error"
  | "outline"
  | "default"
  | "warning";

export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<BadgeVariant, string> = {
  gold: "bg-gold/15 text-gold-dark border border-gold/30",
  navy: "bg-navy text-white border border-navy",
  success: "bg-success/15 text-success border border-success/30",
  error: "bg-error/15 text-error border border-error/30",
  warning: "bg-warning/15 text-warning border border-warning/30",
  outline: "bg-transparent text-text-secondary border border-border",
  default: "bg-ivory text-text border border-border",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[11px] px-2 py-0.5 gap-1 font-medium",
  md: "text-xs px-2.5 py-1 gap-1.5 font-medium",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  icon,
  className = "",
  onClick,
}) => {
  const isClickable = Boolean(onClick);

  return (
    <span
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`
        inline-flex items-center rounded-full tracking-wide transition-colors select-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isClickable ? "cursor-pointer hover:opacity-85" : ""}
        ${className}
      `.trim()}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
