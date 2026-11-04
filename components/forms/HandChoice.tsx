"use client";

import { Check, Hand } from "lucide-react";

/** Two big buttons: left hand or right hand. */
export function HandChoice({ value, onChange, label = "Which hand?" }: { value: "left" | "right" | ""; onChange: (hand: "left" | "right") => void; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-3">
      {(["left", "right"] as const).map((hand) => {
        const active = value === hand;
        return (
          <button
            key={hand}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(hand)}
            className={`relative flex min-h-36 flex-col items-center justify-center gap-3 rounded-2xl border-[1.5px] p-4 ${active ? "border-ink bg-ink text-moon" : "border-line-2 bg-surface text-ink hover:border-ink"}`}
          >
            {active && <Check className="absolute right-3 top-3 h-6 w-6" aria-hidden="true" />}
            <Hand className={`h-14 w-14 ${hand === "left" ? "-scale-x-100" : ""}`} strokeWidth={1.6} aria-hidden="true" />
            <span className="text-xl font-semibold capitalize">{hand} hand</span>
          </button>
        );
      })}
    </div>
  );
}
