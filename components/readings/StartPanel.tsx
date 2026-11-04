import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { OrbitArt, Starfield } from "@/components/brand/Celestial";
import { Button } from "@/components/ui/Button";
import type { JourneyStep } from "@/lib/journey";

/** Shown before a reading exists: what we'll use, and one big button. */
export function StartPanel({ step, details, onStart, disabled, children, buttonLabel }: {
  step: JourneyStep;
  details: Array<{ label: string; value: string }>;
  onStart: () => void;
  disabled?: boolean;
  children?: ReactNode;
  buttonLabel?: string;
}) {
  return (
    <section className="night relative overflow-hidden rounded-[2rem]">
      <Starfield count={90} seed={5} className="absolute inset-0 h-full w-full opacity-70" />
      <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="eyebrow text-moon-2">Ready when you are</p>
            <h2 className="text-5xl sm:text-6xl">Let’s read your {step.short.toLowerCase()}.</h2>
            <p className="text-xl text-moon-2">We’ll use the details you already gave us. Nothing to type.</p>
          </div>
          <dl className="grid border-t border-night-line sm:grid-cols-2">
            {details.map((d) => (
              <div key={d.label} className="flex flex-col gap-1 border-b border-night-line py-4 sm:odd:pr-6">
                <dt className="eyebrow text-moon-2">{d.label}</dt>
                <dd className="font-display text-2xl">{d.value}</dd>
              </div>
            ))}
          </dl>
          {children && <div className="flex flex-col gap-3 text-ink">{children}</div>}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button variant="light" size="lg" onClick={onStart} disabled={disabled} icon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>
              {buttonLabel ?? `Make my ${step.short} reading`}
            </Button>
            <Link href="/me" className="flex min-h-12 items-center justify-center px-2 text-lg font-semibold text-moon underline decoration-moon/40 underline-offset-4 hover:decoration-moon">
              Change my details
            </Link>
          </div>
          <p className="text-base text-moon-2">Usually under a minute. Your reading is saved, so you can come back any time.</p>
        </div>
        <OrbitArt className="mx-auto hidden w-full max-w-[20rem] lg:block" />
      </div>
    </section>
  );
}
