"use client";

import React from "react";

export type ProgressBarVariant = "gold" | "navy" | "success";
export type ProgressBarSize = "sm" | "md" | "lg";

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercent?: boolean;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  className?: string;
}

const variantGradients: Record<ProgressBarVariant, string> = {
  gold: "bg-gradient-to-r from-gold via-gold-light to-gold-dark",
  navy: "bg-gradient-to-r from-navy to-navy-light",
  success: "bg-gradient-to-r from-success to-emerald-600",
};

const sizeStyles: Record<ProgressBarSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = false,
  variant = "gold",
  size = "md",
  className = "",
}) => {
  const clampedValue = Math.min(Math.max(Math.round(value), 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-text">
          {label && <span>{label}</span>}
          {showPercent && (
            <span className="text-text-secondary font-mono ml-auto">
              {clampedValue}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progress"}
        className={`w-full bg-border/50 rounded-full overflow-hidden ${sizeStyles[size]}`}
      >
        <div
          className={`${variantGradients[variant]} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
