import { Minus, Plus } from "lucide-react";
import { AREAS, type AreaNote } from "@/lib/areas";
import { TONE, type Tone } from "@/lib/journey";

/** One card per life area (Love, Money, Work…), each with the good side and what to watch out for. */
export function AreaCards({ notes, tone }: { notes: AreaNote[]; tone: Tone }) {
  if (!notes.length) return null;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((n) => {
        const { name, icon: Icon } = AREAS[n.key];
        return (
          <li key={n.key} className={`flex flex-col gap-4 rounded-[1.5rem] border border-line border-t-4 ${TONE[tone].top} bg-paper p-5 sm:p-6`}>
            <h3 className="flex items-center gap-3 text-3xl">
              <Icon className={`h-6 w-6 ${TONE[tone].text}`} strokeWidth={1.6} aria-hidden="true" />
              {name}
            </h3>
            <ul className="flex flex-col gap-3 text-lg leading-relaxed">
              {n.good.map((t) => (
                <li key={t} className="flex gap-3"><Plus className="mt-1.5 h-4 w-4 shrink-0 text-good" strokeWidth={2.2} aria-hidden="true" /><span>{t}</span></li>
              ))}
              {n.care.map((t) => (
                <li key={t} className="flex gap-3"><Minus className="mt-1.5 h-4 w-4 shrink-0 text-care" strokeWidth={2.2} aria-hidden="true" /><span><span className="sr-only">Watch out: </span>{t}</span></li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
