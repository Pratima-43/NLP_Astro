"use client";

import React, { useState } from "react";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  status?: "online" | "offline";
  className?: string;
  alt?: string;
}

const sizeClasses: Record<AvatarSize, { box: string; text: string; status: string }> = {
  sm: { box: "w-8 h-8", text: "text-xs", status: "w-2 h-2 ring-1" },
  md: { box: "w-10 h-10", text: "text-sm", status: "w-2.5 h-2.5 ring-2" },
  lg: { box: "w-14 h-14", text: "text-lg", status: "w-3.5 h-3.5 ring-2" },
  xl: { box: "w-20 h-20", text: "text-2xl", status: "w-4 h-4 ring-2" },
};

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = "md",
  status,
  className = "",
  alt,
}) => {
  const [hasError, setHasError] = useState(false);
  const initials = getInitials(name);
  const sizeConfig = sizeClasses[size];

  const showImage = Boolean(src) && !hasError;

  return (
    <div className={`relative inline-block select-none ${className}`}>
      <div
        className={`
          ${sizeConfig.box} rounded-full overflow-hidden flex items-center justify-center
          border border-border shadow-xs
          ${!showImage ? "gold-gradient text-white font-serif font-semibold tracking-wide" : "bg-card"}
        `}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary avatar URLs/data URLs
          <img
            src={src}
            alt={alt || name}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={sizeConfig.text}>{initials}</span>
        )}
      </div>

      {status && (
        <span
          aria-label={`Status: ${status}`}
          className={`
            absolute bottom-0 right-0 rounded-full ring-white
            ${sizeConfig.status}
            ${status === "online" ? "bg-success" : "bg-text-secondary/50"}
          `}
        />
      )}
    </div>
  );
};

export default Avatar;
