import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

type Tone = "info" | "success" | "warning" | "error";

const STYLES: Record<Tone, { box: string; icon: typeof Info }> = {
  info: { box: "bg-ask-soft text-ask-ink border-ask/25", icon: Info },
  success: { box: "bg-good-soft text-[#14532d] border-good/30", icon: CircleCheck },
  warning: { box: "bg-care-soft text-[#7c2d12] border-care/25", icon: TriangleAlert },
  error: { box: "bg-bad-soft text-[#7f1d1d] border-bad/30", icon: CircleAlert },
};

/** A short message in a coloured box. Errors are announced to screen readers immediately. */
export function Notice({ tone = "info", title, children, action }: { tone?: Tone; title?: ReactNode; children?: ReactNode; action?: ReactNode }) {
  const { box, icon: Icon } = STYLES[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex gap-3 rounded-2xl border p-4 sm:p-5 ${box}`}>
      <Icon className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className="text-base leading-relaxed sm:text-lg">{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
