"use client";

import { Check } from "lucide-react";
import { OrbitArt, Starfield } from "@/components/brand/Celestial";
import { useElapsedSeconds } from "@/lib/hooks";
import type { Tone } from "@/lib/journey";

/** While a reading is being made: the steps we are working through, one after another. */
export function WorkingPanel({ stages }: { stages: string[]; tone?: Tone }) {
  const seconds = useElapsedSeconds(true);
  // Move through the steps every few seconds; the last one stays until the answer arrives.
  const current = Math.min(Math.floor(seconds / 4), stages.length - 1);
  return (
    <section className="night relative overflow-hidden rounded-[2rem]" aria-live="polite">
      <Starfield count={90} seed={9} className="absolute inset-0 h-full w-full opacity-70" />
      <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <OrbitArt className="mx-auto w-full max-w-[16rem] [&_.slow-spin]:[animation-duration:12s] [&_.spin-reverse]:[animation-duration:18s]" />
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="eyebrow text-moon-2">Reading the sky · {seconds}s</p>
            <h2 className="text-5xl">Making your reading…</h2>
            <p className="text-xl text-moon-2">Please keep this page open. It usually takes under a minute.</p>
          </div>
          <ol className="flex flex-col border-t border-night-line">
            {stages.map((stage, i) => {
              const done = i < current;
              const active = i === current;
              return (
                <li key={stage} className={`flex items-center gap-4 border-b border-night-line py-3.5 text-lg ${done ? "text-moon" : active ? "text-moon" : "text-moon-2/70"}`}>
                  <span className="eyebrow w-8 shrink-0 text-moon-2" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1">{stage}</span>
                  {done ? <Check className="h-5 w-5 text-[#9bd3b4]" aria-hidden="true" /> : active ? <span className="pulse-dot h-2.5 w-2.5 rounded-full bg-[#e3b56a]" aria-hidden="true" /> : null}
                  <span className="sr-only">{done ? "(done)" : active ? "(working on it)" : "(waiting)"}</span>
                </li>
              );
            })}
          </ol>
          {seconds > 45 && (
            <p className="text-lg text-moon-2">Still working. When many people use the AI writer at once it takes a little longer. Your reading is saved as soon as it’s ready.</p>
          )}
        </div>
      </div>
    </section>
  );
}
