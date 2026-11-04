"use client";

import { Square, Volume2 } from "lucide-react";
import { useSpeech } from "@/lib/hooks";

/** "Listen" button that reads text aloud with the device's own voice. Hidden where the browser can't speak. */
export function ReadAloud({ text, label = "Listen", className = "" }: { text: string; label?: string; className?: string }) {
  const { supported, speaking, speak, stop } = useSpeech();
  if (!supported || !text.trim()) return null;
  return (
    <button
      type="button"
      onClick={() => (speaking ? stop() : speak(text))}
      aria-pressed={speaking}
      className={`no-print inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-line-2 bg-surface px-4 text-base font-semibold text-ink hover:border-ink ${className}`}
    >
      {speaking ? <Square className="h-5 w-5 fill-current" aria-hidden="true" /> : <Volume2 className="h-5 w-5" aria-hidden="true" />}
      {speaking ? "Stop reading" : label}
    </button>
  );
}
