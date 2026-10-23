"use client";

import React, { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  bordered?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = "",
  bordered = true,
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-card
        ${bordered ? "border border-dashed border-border" : ""}
        ${className}
      `.trim()}
    >
      <div className="w-16 h-16 rounded-2xl bg-gold/10 text-gold border border-gold/20 flex items-center justify-center mb-4 transition-transform hover:scale-105">
        {icon || <Sparkles className="w-8 h-8" />}
      </div>

      <h3 className="text-lg font-serif font-semibold text-text mb-2">
        {title}
      </h3>

      <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
};

export default EmptyState;
