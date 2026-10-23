"use client";

import React, { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export type StatTrend = "up" | "down" | "neutral";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: StatTrend;
  trendLabel?: string;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  className = "",
  onClick,
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`
        bg-card p-5 rounded-xl border border-border card-shadow transition-all duration-200
        ${isClickable ? "cursor-pointer hover:card-shadow-hover hover:-translate-y-0.5" : ""}
        ${className}
      `.trim()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-serif font-bold text-text tracking-tight">
              {value}
            </span>
          </div>

          {(subtitle || trend || trendLabel) && (
            <div className="mt-2 flex items-center gap-2 text-xs flex-wrap">
              {trend && (
                <span
                  className={`inline-flex items-center gap-0.5 font-semibold ${
                    trend === "up"
                      ? "text-success"
                      : trend === "down"
                      ? "text-error"
                      : "text-text-secondary"
                  }`}
                >
                  {trend === "up" && <TrendingUp className="w-3.5 h-3.5" />}
                  {trend === "down" && <TrendingDown className="w-3.5 h-3.5" />}
                  {trend === "neutral" && <Minus className="w-3.5 h-3.5" />}
                  {trendLabel}
                </span>
              )}

              {subtitle && (
                <span className="text-text-secondary">{subtitle}</span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div className="w-11 h-11 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0 border border-gold/20">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
