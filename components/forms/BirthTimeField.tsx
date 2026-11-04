"use client";

import { useId, useState } from "react";
import { Check, CircleAlert } from "lucide-react";
import { SelectBox } from "@/components/ui/Field";

export type TimeParts = { hour: string; minute: string; period: "am" | "pm" | ""; unknown: boolean };

export function partsFromTime(time: string, unknown: boolean): TimeParts {
  if (!time) return { hour: "", minute: "", period: "", unknown };
  const [h, m] = time.split(":").map(Number);
  return { hour: String(h % 12 === 0 ? 12 : h % 12), minute: String(m).padStart(2, "0"), period: h < 12 ? "am" : "pm", unknown };
}

/** "HH:MM" in 24-hour time, or "" when the time is unknown or incomplete. */
export function timeFromParts(parts: TimeParts): string {
  if (parts.unknown || !parts.hour || !parts.minute || !parts.period) return "";
  let hour = Number(parts.hour) % 12;
  if (parts.period === "pm") hour += 12;
  return `${String(hour).padStart(2, "0")}:${parts.minute}`;
}

export function birthTimeProblem(parts: TimeParts): string | null {
  if (parts.unknown) return null;
  if (!parts.hour || !parts.minute) return "Please choose the hour and the minutes, or press “I don’t know my birth time”.";
  if (!parts.period) return "Please choose morning (AM) or afternoon/evening (PM).";
  return null;
}


export function BirthTimeField({ initial, error, onChange }: { initial: TimeParts; error?: string | null; onChange: (parts: TimeParts) => void }) {
  const id = useId();
  const [parts, setParts] = useState<TimeParts>(initial);

  function update(change: Partial<TimeParts>) {
    const next = { ...parts, ...change };
    setParts(next);
    onChange(next);
  }

  const disabled = parts.unknown;

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="sr-only">Time of birth</legend>
      <div className={`flex flex-col gap-4 ${disabled ? "opacity-45" : ""}`}>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-hour`} className="text-base font-semibold text-ink-2">Hour</label>
            <SelectBox id={`${id}-hour`} disabled={disabled} value={parts.hour} onChange={(e) => update({ hour: e.target.value })}>
              <option value="">Hour</option>
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => <option key={h} value={h}>{h}</option>)}
            </SelectBox>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-minute`} className="text-base font-semibold text-ink-2">Minutes</label>
            <SelectBox id={`${id}-minute`} disabled={disabled} value={parts.minute} onChange={(e) => update({ minute: e.target.value })}>
              <option value="">Minutes</option>
              {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map((m) => <option key={m} value={m}>{m}</option>)}
            </SelectBox>
          </div>
        </div>
        <div role="radiogroup" aria-label="Morning or afternoon" className="grid grid-cols-2 gap-3">
          {([["am", "AM", "morning"], ["pm", "PM", "afternoon or night"]] as const).map(([value, short, words]) => {
            const active = parts.period === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => update({ period: value })}
                className={`flex min-h-16 flex-col items-center justify-center rounded-2xl border-[1.5px] px-3 py-2 ${active ? "border-ink bg-ink text-moon" : "border-line-2 bg-surface text-ink hover:border-ink"}`}
              >
                <span className="text-lg font-bold">{short}</span>
                <span className={`text-sm ${active ? "text-white/85" : "text-ink-2"}`}>{words}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        aria-pressed={parts.unknown}
        onClick={() => update({ unknown: !parts.unknown })}
        className={`flex min-h-14 items-center gap-3 rounded-2xl border-[1.5px] px-4 text-left text-lg font-semibold ${parts.unknown ? "border-ink bg-ink text-moon" : "border-dashed border-line-2 bg-surface text-ink hover:border-ink"}`}
      >
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-[1.5px] ${parts.unknown ? "border-white bg-white text-ink" : "border-ink-3"}`} aria-hidden="true">
          {parts.unknown && <Check className="h-5 w-5" />}
        </span>
        I don’t know my birth time
      </button>

      {error && (
        <p className="flex items-start gap-2 text-base font-medium text-bad" role="alert">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </fieldset>
  );
}
