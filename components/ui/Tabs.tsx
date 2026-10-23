"use client";

import React, { ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export type TabsVariant = "underline" | "pills";

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: TabsVariant;
  fullWidth?: boolean;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  fullWidth = false,
  className = "",
}) => {
  if (variant === "pills") {
    return (
      <div
        role="tablist"
        className={`inline-flex items-center gap-1.5 p-1 bg-ivory rounded-xl border border-border ${
          fullWidth ? "w-full" : ""
        } ${className}`}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`
                flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-150 select-none cursor-pointer outline-none
                ${fullWidth ? "flex-1" : ""}
                ${
                  isActive
                    ? "bg-gold text-white shadow-sm font-semibold"
                    : "text-text-secondary hover:text-text hover:bg-gold/10"
                }
                ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}
              `.trim()}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                    isActive ? "bg-white/25 text-white" : "bg-border text-text-secondary"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Underline variant
  return (
    <div
      role="tablist"
      className={`flex items-center border-b border-border gap-6 overflow-x-auto no-scrollbar ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={`
              relative flex items-center justify-center gap-2 py-3.5 text-sm font-medium
              transition-colors duration-150 select-none cursor-pointer outline-none whitespace-nowrap
              ${fullWidth ? "flex-1" : ""}
              ${
                isActive
                  ? "text-gold font-semibold"
                  : "text-text-secondary hover:text-text"
              }
              ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}
            `.trim()}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive ? "bg-gold/15 text-gold-dark" : "bg-border/60 text-text-secondary"
                }`}
              >
                {tab.badge}
              </span>
            )}

            {/* Active underline indicator */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full transition-all" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
