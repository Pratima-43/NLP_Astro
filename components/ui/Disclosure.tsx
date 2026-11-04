import type { ReactNode } from "react";
import { Plus } from "lucide-react";

/** A section that opens and closes (native <details>: keyboard and screen-reader friendly). */
export function Disclosure({ title, subtitle, icon, children, defaultOpen, className = "" }: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details open={defaultOpen} className={`group border-y border-line ${className}`}>
      <summary className="flex min-h-20 items-center gap-4 py-5 hover:opacity-80">
        {icon}
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-display text-2xl leading-tight sm:text-3xl">{title}</span>
          {subtitle && <span className="text-base text-ink-2">{subtitle}</span>}
        </span>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink/70" aria-hidden="true">
          <Plus className="chevron h-5 w-5 transition-transform duration-300" />
        </span>
      </summary>
      <div className="pb-8 pt-2">{children}</div>
    </details>
  );
}
