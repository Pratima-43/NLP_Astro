import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Halo } from "@/components/brand/Celestial";
import { JOURNEY, TONE, type JourneyStep } from "@/lib/journey";

/** Top of every reading page: where you are on the path, the title, and the page's actions. */
export function ReadingHeader({ step, children }: { step: JourneyStep; children?: ReactNode }) {
  const number = JOURNEY.findIndex((s) => s.key === step.key) + 1;
  return (
    <header className="flex flex-col gap-8">
      <Link href="/home" className="no-print eyebrow flex min-h-11 w-fit items-center gap-2 text-ink-2 hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to home
      </Link>
      <div className="grid items-end gap-8 border-b border-ink/80 pb-8 md:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-4">
          <p className={`eyebrow ${TONE[step.tone].text}`}>
            {String(number).padStart(2, "0")} / {String(JOURNEY.length).padStart(2, "0")} — {step.tradition}
          </p>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl">{step.title}</h1>
          <p className="max-w-2xl text-xl leading-relaxed text-ink-2">{step.what}</p>
          {children && <div className="no-print mt-2 flex flex-wrap gap-2">{children}</div>}
        </div>
        <Halo className={`hidden h-40 w-40 md:flex ${TONE[step.tone].text}`}>
          <step.icon className="h-12 w-12 text-ink" strokeWidth={1} aria-hidden="true" />
        </Halo>
      </div>
    </header>
  );
}
