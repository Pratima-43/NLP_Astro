import { MODULE_STEP, TONE } from "@/lib/journey";
import type { Contribution } from "@/types/readings";

/** How much of an answer came from each reading, as one bar plus words. */
export function ShareBar({ contributions, label = "Where this came from" }: { contributions: Contribution[]; label?: string }) {
  const shown = contributions.filter((c) => c.percent > 0);
  if (!shown.length) return null;
  const words = shown.map((c) => `${MODULE_STEP[c.module].short} ${c.percent}%`).join(", ");
  return (
    <div className="flex flex-col gap-2">
      <p className="text-base font-semibold text-ink-2">{label}</p>
      <div className="flex h-4 overflow-hidden rounded-full bg-line" role="img" aria-label={`${label}: ${words}`}>
        {shown.map((c) => (
          <span key={c.module} style={{ width: `${c.percent}%`, background: TONE[MODULE_STEP[c.module].tone].bar }} />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1" aria-hidden="true">
        {shown.map((c) => (
          <li key={c.module} className="flex items-center gap-2 text-base">
            <span className="h-3 w-3 rounded-full" style={{ background: TONE[MODULE_STEP[c.module].tone].bar }} />
            <span className="font-semibold">{MODULE_STEP[c.module].short}</span> {c.percent}%
          </li>
        ))}
      </ul>
    </div>
  );
}
