"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const pad = (n: number) => String(n).padStart(2, "0");
const daysIn = (year: number, month: number) => new Date(year || 2000, month || 1, 0).getDate();

function Segment({ label, value, onChange, disabled, required, className = "", children }: {
  label: string; value: string; onChange: (v: string) => void; disabled?: boolean; required?: boolean; className?: string; children: ReactNode;
}) {
  return (
    <div className={`relative flex-1 min-w-0 ${className}`}>
      <select aria-label={label} value={value} disabled={disabled} required={required} onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none bg-transparent pl-3 pr-7 py-2.5 text-sm outline-none cursor-pointer disabled:cursor-not-allowed ${value ? "text-text" : "text-text-secondary/70"}`}>
        {children}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-gold absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

function Shell({ disabled, children }: { disabled?: boolean; children: ReactNode }) {
  return (
    <div className={`flex items-stretch rounded-xl border border-border bg-white divide-x divide-border transition-all focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20 ${disabled ? "bg-ivory opacity-60" : "hover:border-gold/50"}`}>
      {children}
    </div>
  );
}

type DateParts = { d: string; m: string; y: string };
const parseDate = (value: string): DateParts => {
  const [y = "", m = "", d = ""] = value ? value.split("-") : [];
  return { y, m: m ? String(Number(m)) : "", d: d ? String(Number(d)) : "" };
};

/** Day / month / year pickers for a birth date. `value` and `onChange` use ISO `YYYY-MM-DD` ("" while incomplete). */
export function DateField({ value, onChange, required, disabled, minYear = 1920, maxDate, showSummary = true }: {
  value: string; onChange: (value: string) => void; required?: boolean; disabled?: boolean; minYear?: number; maxDate?: Date; showSummary?: boolean;
}) {
  // Partial picks (e.g. month chosen, no year yet) live here; a complete date comes from `value`.
  const [draft, setDraft] = useState<DateParts>(() => parseDate(value));
  const parts = value ? parseDate(value) : draft;
  const limit = maxDate ?? new Date();
  const maxYear = limit.getFullYear();
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  const maxMonth = Number(parts.y) === maxYear ? limit.getMonth() + 1 : 12;
  let maxDay = daysIn(Number(parts.y), Number(parts.m));
  if (Number(parts.y) === maxYear && Number(parts.m) === limit.getMonth() + 1) maxDay = Math.min(maxDay, limit.getDate());

  function update(key: keyof DateParts, v: string) {
    const next = { ...parts, [key]: v };
    const y = Number(next.y), m = Number(next.m);
    if (y === maxYear && m > limit.getMonth() + 1) next.m = "";
    if (next.d && next.m && Number(next.d) > daysIn(y, Number(next.m))) next.d = String(daysIn(y, Number(next.m)));
    if (next.d && y === maxYear && Number(next.m) === limit.getMonth() + 1 && Number(next.d) > limit.getDate()) next.d = String(limit.getDate());
    setDraft(next);
    onChange(next.d && next.m && next.y ? `${next.y}-${pad(Number(next.m))}-${pad(Number(next.d))}` : "");
  }

  const complete = value ? new Date(`${value}T12:00:00`) : null;
  return (
    <div>
      <Shell disabled={disabled}>
        <Segment label="Day" value={parts.d} onChange={(v) => update("d", v)} disabled={disabled} required={required} className="max-w-[5.5rem]">
          <option value="">Day</option>
          {Array.from({ length: maxDay }, (_, i) => <option key={i + 1} value={String(i + 1)}>{i + 1}</option>)}
        </Segment>
        <Segment label="Month" value={parts.m} onChange={(v) => update("m", v)} disabled={disabled} required={required}>
          <option value="">Month</option>
          {MONTHS.slice(0, maxMonth).map((name, i) => <option key={name} value={String(i + 1)}>{name}</option>)}
        </Segment>
        <Segment label="Year" value={parts.y} onChange={(v) => update("y", v)} disabled={disabled} required={required} className="max-w-[6.5rem]">
          <option value="">Year</option>
          {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
        </Segment>
      </Shell>
      {showSummary && complete && !Number.isNaN(complete.getTime()) && (
        <p className="text-[11px] text-text-secondary mt-1">Born on a <span className="font-semibold text-gold-dark">{WEEKDAYS[complete.getDay()]}</span></p>
      )}
    </div>
  );
}

/** Hour / minute / AM-PM pickers. `value` and `onChange` use 24-hour `HH:MM` ("" while incomplete). */
export function TimeField({ value, onChange, required, disabled }: {
  value: string; onChange: (value: string) => void; required?: boolean; disabled?: boolean;
}) {
  const fromValue = () => {
    if (!value) return null;
    const [h, m] = value.split(":").map(Number);
    return { h: String(h % 12 || 12), m: pad(m), p: h >= 12 ? "PM" : "AM" };
  };
  const [draft, setDraft] = useState(() => fromValue() ?? { h: "", m: "", p: "AM" });
  const parts = fromValue() ?? draft;

  function update(key: "h" | "m" | "p", v: string) {
    const next = { ...parts, [key]: v };
    setDraft(next);
    if (!next.h || !next.m) return onChange("");
    const hour = (Number(next.h) % 12) + (next.p === "PM" ? 12 : 0);
    onChange(`${pad(hour)}:${next.m}`);
  }

  return (
    <Shell disabled={disabled}>
      <Segment label="Hour" value={disabled ? "" : parts.h} onChange={(v) => update("h", v)} disabled={disabled} required={required && !disabled}>
        <option value="">Hour</option>
        {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={String(i + 1)}>{i + 1}</option>)}
      </Segment>
      <Segment label="Minute" value={disabled ? "" : parts.m} onChange={(v) => update("m", v)} disabled={disabled} required={required && !disabled}>
        <option value="">Min</option>
        {Array.from({ length: 60 }, (_, i) => <option key={i} value={pad(i)}>{pad(i)}</option>)}
      </Segment>
      <div className="flex items-center gap-1 px-1.5 shrink-0">
        {(["AM", "PM"] as const).map((p) => (
          <button key={p} type="button" disabled={disabled} onClick={() => update("p", p)}
            className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${parts.p === p && !disabled ? "bg-gold text-white" : "text-text-secondary hover:text-gold-dark"}`}>
            {p}
          </button>
        ))}
      </div>
    </Shell>
  );
}
