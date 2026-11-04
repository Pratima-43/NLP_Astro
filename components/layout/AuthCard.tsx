import type { ReactNode } from "react";

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-7 rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">{title}</h1>
          {subtitle && <p className="text-lg text-ink-2">{subtitle}</p>}
        </div>
        {children}
      </div>
      {footer && <div className="text-center text-lg text-ink-2">{footer}</div>}
    </div>
  );
}
