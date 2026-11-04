import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { IconBadge } from "@/components/ui/IconBadge";
import { JOURNEY, TONE, type JourneyStep } from "@/lib/journey";

/** Top of every reading page: where you are on the path, what this page is, and its actions. */
export function ReadingHeader({ step, children }: { step: JourneyStep; children?: ReactNode }) {
  const number = JOURNEY.findIndex((s) => s.key === step.key) + 1;
  return (
    <header className="flex flex-col gap-5">
      <Link href="/home" className="no-print flex min-h-11 w-fit items-center gap-2 rounded-lg pr-2 text-base font-semibold text-ink-2 hover:text-ink">
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        Back to home
      </Link>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <IconBadge icon={step.icon} tone={step.tone} size="lg" />
          <div className="flex flex-col gap-1">
            <p className={`text-base font-semibold ${TONE[step.tone].text}`}>
              Step {number} of {JOURNEY.length} · {step.tradition}
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">{step.title}</h1>
            <p className="text-lg text-ink-2">{step.what}</p>
          </div>
        </div>
        {children && <div className="no-print flex flex-wrap gap-2 sm:justify-end">{children}</div>}
      </div>
    </header>
  );
}
