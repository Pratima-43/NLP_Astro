"use client";

import { useId, useState } from "react";
import { CircleAlert } from "lucide-react";
import { SelectBox } from "@/components/ui/Field";
import { MONTHS } from "@/lib/format";

function daysIn(month: number, year: number): number {
  return new Date(year || 2000, month, 0).getDate();
}

/** "" when incomplete or impossible (e.g. 31 April); otherwise "YYYY-MM-DD". */
export function composeDate(day: string, month: string, year: string): string {
  if (!day || !month || !year) return "";
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (d > daysIn(m, y)) return "";
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function birthDateProblem(day: string, month: string, year: string): string | null {
  if (!day || !month || !year) return "Please choose the day, the month and the year.";
  if (!composeDate(day, month, year)) return `${MONTHS[Number(month) - 1]} ${year} doesn’t have a day ${day}. Please check the day.`;
  const chosen = new Date(Number(year), Number(month) - 1, Number(day));
  if (chosen > new Date()) return "That date is in the future. Please check the year.";
  return null;
}

/**
 * Three big drop-downs (Day, Month, Year) instead of a calendar picker, which is hard to use
 * for birthdays decades ago. Calls onChange with the date parts as they are chosen.
 */
export function BirthDateField({ initial, error, onChange, legend = "Date of birth" }: {
  initial: string;
  error?: string | null;
  onChange: (parts: { day: string; month: string; year: string }) => void;
  legend?: string;
}) {
  const id = useId();
  const [y0, m0, d0] = initial ? initial.split("-") : ["", "", ""];
  const [parts, setParts] = useState({ day: d0 ? String(Number(d0)) : "", month: m0 ? String(Number(m0)) : "", year: y0 ?? "" });
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - 1899 }, (_, i) => String(thisYear - i));

  function update(key: "day" | "month" | "year", value: string) {
    const next = { ...parts, [key]: value };
    setParts(next);
    onChange(next);
  }

  const select = (key: "day" | "month" | "year", label: string, options: Array<{ value: string; label: string }>) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`${id}-${key}`} className="text-base font-semibold text-ink-2">{label}</label>
      <SelectBox
        id={`${id}-${key}`}
        value={parts[key]}
        onChange={(e) => update(key, e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="">{label}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </SelectBox>
    </div>
  );

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">{legend}</legend>
      <div className="grid grid-cols-[1fr_1.6fr_1.2fr] gap-3">
        {select("day", "Day", Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })))}
        {select("month", "Month", MONTHS.map((m, i) => ({ value: String(i + 1), label: m })))}
        {select("year", "Year", years.map((y) => ({ value: y, label: y })))}
      </div>
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-2 text-base font-medium text-bad">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </fieldset>
  );
}
