"use client";

import React, { HTMLAttributes, forwardRef, ReactNode } from "react";

export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  hover?: boolean;
  padding?: CardPadding;
  className?: string;
  bordered?: boolean;
}

const paddingStyles: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      hover = false,
      padding = "md",
      bordered = true,
      className = "",
      onClick,
      ...props
    },
    ref
  ) => {
    const isClickable = Boolean(onClick);

    return (
      <div
        ref={ref}
        onClick={onClick}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
                }
              }
            : undefined
        }
        className={`
          bg-card rounded-xl transition-all duration-200 card-shadow
          ${bordered ? "border border-border" : ""}
          ${paddingStyles[padding]}
          ${hover ? "hover:card-shadow-hover hover:-translate-y-0.5 cursor-pointer" : ""}
          ${isClickable && !hover ? "cursor-pointer" : ""}
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export const CardHeader = ({ children, className = "", ...props }: CardHeaderProps) => (
  <div className={`mb-4 flex items-center justify-between gap-3 ${className}`} {...props}>
    {children}
  </div>
);

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const CardTitle = ({ children, as: Tag = "h3", className = "", ...props }: CardTitleProps) => (
  <Tag className={`font-semibold text-text tracking-tight ${className}`} {...props}>
    {children}
  </Tag>
);

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
  className?: string;
}

export const CardDescription = ({ children, className = "", ...props }: CardDescriptionProps) => (
  <p className={`text-sm text-text-secondary ${className}`} {...props}>
    {children}
  </p>
);

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export const CardContent = ({ children, className = "", ...props }: CardContentProps) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  className?: string;
}

export const CardFooter = ({ children, className = "", ...props }: CardFooterProps) => (
  <div className={`mt-4 pt-4 border-t border-border/60 flex items-center justify-between gap-3 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
