import Link from "next/link";
import type { ReactNode } from "react";
import { Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TONE, type JourneyStep } from "@/lib/journey";

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
    <section className={`flex flex-col gap-6 rounded-3xl border border-line border-t-8 bg-surface p-6 sm:p-8 ${TONE[step.tone].top}`}>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">Ready to make your reading?</h2>
        <p className="text-lg text-ink-2">We’ll use the details you gave us. Nothing to type.</p>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {details.map((d) => (
          <div key={d.label} className="rounded-2xl bg-paper px-4 py-3">
            <dt className="text-base text-ink-2">{d.label}</dt>
            <dd className="text-lg font-semibold">{d.value}</dd>
          </div>
        ))}
      </dl>
      {children}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button size="lg" onClick={onStart} disabled={disabled} icon={<Sparkles className="h-5 w-5" aria-hidden="true" />}>
          {buttonLabel ?? `Make my ${step.short} reading`}
        </Button>
        <Link href="/me" className="flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-lg font-semibold text-ink underline-offset-4 hover:underline">
          <Pencil className="h-5 w-5" aria-hidden="true" />
          Change my details
        </Link>
      </div>
      <p className="text-base text-ink-2">It usually takes less than a minute. Your reading is saved, so you can come back to it any time.</p>
    </section>
  );
}
