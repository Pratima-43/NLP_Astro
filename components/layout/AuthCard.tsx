import type { ReactNode } from "react";

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex flex-col gap-10 rise-in">
      <div className="flex flex-col gap-3">
        <h1 className="text-5xl sm:text-6xl">{title}</h1>
        {subtitle && <p className="text-xl text-ink-2">{subtitle}</p>}
      </div>
      <div className="flex flex-col gap-6">{children}</div>
      {footer && <div className="border-t border-line pt-6 text-lg text-ink-2">{footer}</div>}
    </div>
  );
}
