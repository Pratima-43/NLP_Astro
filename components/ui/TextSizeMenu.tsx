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
            className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-2 ${active ? "border-ink bg-ink text-white" : "border-line-2 bg-surface text-ink hover:border-ink"}`}
          >
            <span className={`font-display font-semibold leading-none ${option.sample}`} aria-hidden="true">Aa</span>
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
export function TextSizeMenu() {
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
        className="flex min-h-12 items-center gap-2 rounded-xl px-3 text-base font-semibold text-ink hover:bg-black/[0.05]"
      >
        <span className="font-display text-xl leading-none" aria-hidden="true">Aa</span>
        <span className="hidden sm:inline">Text size</span>
        <span className="sr-only sm:hidden">Text size</span>
      </button>
      {open && (
        <div id={panelId} className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-4 shadow-xl">
          <p className="mb-3 font-display text-lg font-semibold">Text size</p>
          <TextSizeChoice onChosen={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
