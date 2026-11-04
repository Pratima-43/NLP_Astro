import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/** A section that opens and closes (native <details>, so it works with keyboards and screen readers). */
export function Disclosure({ title, subtitle, icon, children, defaultOpen, className = "" }: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details open={defaultOpen} className={`rounded-2xl border border-line bg-surface ${className}`}>
      <summary className="flex min-h-16 items-center gap-4 rounded-2xl px-5 py-4 hover:bg-black/[0.02]">
        {icon}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-display text-lg font-semibold text-ink">{title}</span>
          {subtitle && <span className="text-base text-ink-2">{subtitle}</span>}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-base font-semibold text-ink-2">
          <span className="hidden sm:inline">Open</span>
          <ChevronDown className="chevron h-6 w-6 transition-transform" aria-hidden="true" />
        </span>
      </summary>
      <div className="border-t border-line px-5 py-5">{children}</div>
    </details>
  );
}
