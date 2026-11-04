import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

type Tone = "info" | "success" | "warning" | "error";

const STYLES: Record<Tone, { box: string; icon: typeof Info; iconColor: string }> = {
  info: { box: "bg-surface border-line", icon: Info, iconColor: "text-ask" },
  success: { box: "bg-good-soft border-good/25", icon: CircleCheck, iconColor: "text-good" },
  warning: { box: "bg-care-soft border-care/25", icon: TriangleAlert, iconColor: "text-care" },
  error: { box: "bg-bad-soft border-bad/30", icon: CircleAlert, iconColor: "text-bad" },
};

/** A short message. Errors are announced to screen readers immediately. */
export function Notice({ tone = "info", title, children, action }: { tone?: Tone; title?: ReactNode; children?: ReactNode; action?: ReactNode }) {
  const { box, icon: Icon, iconColor } = STYLES[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex gap-4 rounded-3xl border p-5 sm:p-6 ${box}`}>
      <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${iconColor}`} strokeWidth={1.8} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-ink">
        {title && <p className="text-lg font-semibold">{title}</p>}
        {children && <div className="text-base leading-relaxed text-ink-2 sm:text-lg">{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
