"use client";

import { Printer } from "lucide-react";

/** Opens the browser's print window ("Save as PDF"), with every folded section opened first. */
export function PrintButton() {
  function print() {
    const closed = Array.from(document.querySelectorAll<HTMLDetailsElement>("main details:not([open])"));
    closed.forEach((d) => (d.open = true));
    window.print();
    closed.forEach((d) => (d.open = false));
  }
  return (
    <button
      type="button"
      onClick={print}
      className="no-print inline-flex min-h-12 items-center gap-2 rounded-full border-[1.5px] border-ink/70 px-5 text-base font-semibold text-ink hover:bg-ink hover:text-moon"
    >
      <Printer className="h-5 w-5" aria-hidden="true" />
      Save as PDF
    </button>
  );
}
