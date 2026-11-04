"use client";

import { Check } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useElapsedSeconds } from "@/lib/hooks";
import { TONE, type Tone } from "@/lib/journey";

/** While a reading is being made: the steps we are working through, one after another. */
export function WorkingPanel({ stages, tone }: { stages: string[]; tone: Tone }) {
  const seconds = useElapsedSeconds(true);
  // Move through the steps every few seconds; the last one stays until the answer arrives.
  const current = Math.min(Math.floor(seconds / 4), stages.length - 1);
  return (
    <section className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-6 sm:p-8" aria-live="polite">
      <div className="flex items-center gap-4">
        <Spinner className={`h-9 w-9 ${TONE[tone].text}`} />
        <div className="flex flex-col">
          <h2 className="text-2xl font-semibold">Making your reading…</h2>
          <p className="text-lg text-ink-2">Please keep this page open. It usually takes under a minute.</p>
        </div>
      </div>
      <ol className="flex flex-col gap-3">
        {stages.map((stage, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={stage} className={`flex items-center gap-3 text-lg ${done ? "text-ink" : active ? "font-semibold text-ink" : "text-ink-3"}`}>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${done ? "bg-good text-white" : active ? `${TONE[tone].soft} ${TONE[tone].text}` : "bg-line text-ink-3"}`}
                aria-hidden="true"
              >
                {done ? <Check className="h-5 w-5" /> : active ? <span className={`pulse-dot h-2.5 w-2.5 rounded-full ${TONE[tone].solid}`} /> : <span className="text-sm">{i + 1}</span>}
              </span>
              {stage}
              <span className="sr-only">{done ? "(done)" : active ? "(working on it)" : "(waiting)"}</span>
            </li>
          );
        })}
      </ol>
      {seconds > 45 && (
        <p className="rounded-2xl bg-paper px-4 py-3 text-lg text-ink-2">
          Still working. When many people use the AI writer at once it can take a little longer. Your reading is saved as soon as it’s ready.
        </p>
      )}
    </section>
  );
}
