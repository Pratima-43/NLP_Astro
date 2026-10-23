"use client";

import React from "react";

export type SpinnerSize = "sm" | "md" | "lg" | "xl";

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
  fullScreen?: boolean;
}

const sizeClasses: Record<SpinnerSize, { spinner: string; text: string }> = {
  sm: { spinner: "w-4 h-4 border-2", text: "text-xs" },
  md: { spinner: "w-6 h-6 border-2", text: "text-sm" },
  lg: { spinner: "w-9 h-9 border-3", text: "text-base" },
  xl: { spinner: "w-12 h-12 border-3", text: "text-base" },
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
  label,
  fullScreen = false,
}) => {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        role="status"
        aria-label={label || "Loading..."}
        className={`
          ${sizeClasses[size].spinner}
          rounded-full border-gold/25 border-t-gold animate-spin
        `}
      />
      {label && (
        <span
          className={`font-medium text-text-secondary tracking-wide animate-pulse ${sizeClasses[size].text}`}
        >
          {label}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ivory/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
