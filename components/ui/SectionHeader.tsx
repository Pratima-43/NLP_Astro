"use client";

import React, { ReactNode } from "react";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
  align?: "left" | "center";
  showDecorator?: boolean;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  action,
  align = "left",
  showDecorator = true,
  className = "",
}) => {
  const isCentered = align === "center";

  return (
    <div
      className={`
        flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6
        ${isCentered ? "text-center items-center" : "text-left"}
        ${className}
      `.trim()}
    >
      <div className={`space-y-1.5 ${isCentered ? "max-w-xl mx-auto" : "max-w-2xl"}`}>
        {eyebrow && (
          <div
            className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold ${
              isCentered ? "justify-center" : ""
            }`}
          >
            {showDecorator && <span className="text-gold">✦</span>}
            <span>{eyebrow}</span>
            {showDecorator && isCentered && <span className="text-gold">✦</span>}
          </div>
        )}

        <div className={`flex items-center gap-3 ${isCentered ? "justify-center" : ""}`}>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-text tracking-tight">
            {title}
          </h2>
          {showDecorator && !eyebrow && (
            <span className="text-gold text-lg select-none">✦</span>
          )}
        </div>

        {subtitle && (
          <p className="text-sm text-text-secondary leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className={`shrink-0 flex items-center gap-2.5 ${isCentered ? "justify-center" : ""}`}>
          {action}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
