"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check } from "lucide-react";
import { useTextSize } from "@/lib/hooks";
import { TEXT_SIZES, type TextSize } from "@/lib/text-size";

/** Three big buttons to choose how large all text is. Used in the header menu and on the Me page. */
export function TextSizeChoice({ onChosen }: { onChosen?: () => void }) {
  const [size, setSize] = useTextSize();
  return (
    <div role="radiogroup" aria-label="Text size" className="grid grid-cols-3 gap-2">
      {TEXT_SIZES.map((option) => {
        const active = option.value === size;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              setSize(option.value as TextSize);
              onChosen?.();
            }}
            className={`flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border-[1.5px] px-2 py-2 ${active ? "border-ink bg-ink text-moon" : "border-line-2 bg-surface text-ink hover:border-ink"}`}
          >
            <span className={`font-display leading-none ${option.sample}`} aria-hidden="true">Aa</span>
            <span className="flex items-center gap-1 text-sm font-semibold">
              {active && <Check className="h-4 w-4" aria-hidden="true" />}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Header button: "Aa Text size", opens a small panel with the three sizes. */
export function TextSizeMenu({ tone = "ink" }: { tone?: "ink" | "moon" }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={`flex min-h-12 items-center gap-2 rounded-full px-3.5 text-base font-medium ${tone === "moon" ? "text-moon hover:bg-white/10" : "text-ink hover:bg-black/[0.05]"}`}
      >
        <span className="font-display text-2xl leading-none" aria-hidden="true">Aa</span>
        <span className="hidden sm:inline">Text size</span>
        <span className="sr-only sm:hidden">Text size</span>
      </button>
      {open && (
        <div id={panelId} className="absolute right-0 top-full z-50 mt-3 w-[min(21rem,calc(100vw-2rem))] rounded-3xl border border-line bg-surface p-5 text-ink shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)]">
          <p className="eyebrow mb-4 text-ink-2">Text size</p>
          <TextSizeChoice onChosen={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
