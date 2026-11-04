import { DOMAIN_WORDS } from "@/lib/readings";
import { formatMonthYear } from "@/lib/format";
import type { DomainOutlook, PlanetPlacement, VedicChart } from "@/types/readings";

export const PLANET_NAMES: Record<string, string> = {
  Sun: "Sun (Surya)", Moon: "Moon (Chandra)", Mars: "Mars (Mangal)", Mercury: "Mercury (Budh)", Jupiter: "Jupiter (Guru)",
  Venus: "Venus (Shukra)", Saturn: "Saturn (Shani)", Rahu: "Rahu (north node)", Ketu: "Ketu (south node)",
};

const ABBR: Record<string, string> = { Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke" };

// Where each house sits in the North-Indian diamond chart (300 × 300).
const HOUSE_POS: Record<number, [number, number]> = {
  1: [150, 78], 2: [75, 40], 3: [40, 75], 4: [78, 150], 5: [40, 225], 6: [75, 262],
  7: [150, 222], 8: [225, 262], 9: [262, 225], 10: [222, 150], 11: [262, 75], 12: [225, 40],
};

export function strengthWord(strength: number): { label: string; className: string } {
  if (strength >= 2) return { label: "Strong", className: "bg-good-soft text-[#14532d]" };
  if (strength >= 0.5) return { label: "Good", className: "bg-hand-soft text-hand-ink" };
  if (strength > -1) return { label: "Average", className: "bg-paper text-ink-2" };
  return { label: "Weak", className: "bg-care-soft text-[#7c2d12]" };
}

/** The birth chart, drawn the North-Indian way. House 1 (the rising sign) is the top diamond. */
export function BirthChart({ chart }: { chart: VedicChart }) {
  const lagna = chart.lagna.sign_index;
  return (
    <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[22rem]" role="img" aria-label="Your birth chart drawn the North-Indian way">
      <rect x="2" y="2" width="296" height="296" rx="8" fill="#ffffff" stroke="#4338ca" strokeWidth="2.5" />
      <g stroke="#4338ca" strokeWidth="1.5" fill="none">
        <line x1="2" y1="2" x2="298" y2="298" />
        <line x1="298" y1="2" x2="2" y2="298" />
        <polygon points="150,2 298,150 150,298 2,150" />
      </g>
      <polygon points="150,2 224,76 150,150 76,76" fill="#e6e9fe" opacity="0.7" />
      {Object.entries(HOUSE_POS).map(([houseText, [x, y]]) => {
        const house = Number(houseText);
        const sign = ((lagna + house - 1) % 12) + 1;
        const occupants = chart.houses[house - 1]?.occupants ?? [];
        return (
          <g key={house}>
            <text x={x} y={y - (occupants.length > 2 ? 18 : 12)} textAnchor="middle" fontSize="11" fill="#6b655d" fontWeight="700">{sign}</text>
            {occupants.map((planet, i) => {
              const row = Math.floor(i / 2);
              const col = i % 2;
              const inRow = Math.min(2, occupants.length - row * 2);
              const px = x + (col - (inRow - 1) / 2) * 25;
              const py = y + 3 + row * 14 - (occupants.length > 2 ? 6 : 0);
              return (
                <text key={planet} x={px} y={py} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#1c1a17">{ABBR[planet] ?? planet.slice(0, 2)}</text>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export function ChartLegend() {
  return (
    <p className="text-base text-ink-2">
      The shaded top diamond is house 1, your rising sign; houses go round anticlockwise. Small grey numbers are signs (1 = Aries … 12 = Pisces).
      Planets: {Object.entries(ABBR).map(([name, abbr]) => `${abbr} = ${name}`).join(", ")}.
    </p>
  );
}

/** Eight life areas as simple bars with a word, plus what is "switched on" by the current period. */
export function LifeAreas({ domains }: { domains: Record<string, DomainOutlook> }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {Object.entries(domains).map(([key, d]) => {
        const word = DOMAIN_WORDS[d.assessment];
        return (
          <li key={key} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-lg font-semibold">{d.label.replace("&", "and")}</span>
              <span className="text-base font-bold" style={{ color: word.color }}>{word.label}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-line" role="img" aria-label={`${d.score} out of 100`}>
              <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: word.color }} />
            </div>
            {d.activated_by_current_dasha.length > 0 && (
              <p className="text-base text-star-ink">Active now, because of your {d.activated_by_current_dasha.join(" and ")} period.</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function PlanetTable({ planets, timeUnknown }: { planets: Record<string, PlanetPlacement>; timeUnknown: boolean }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[34rem] text-left text-base">
        <thead className="bg-paper text-ink-2">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Planet</th>
            <th scope="col" className="px-4 py-3 font-semibold">Sign</th>
            {!timeUnknown && <th scope="col" className="px-4 py-3 font-semibold">House</th>}
            <th scope="col" className="px-4 py-3 font-semibold">Star</th>
            <th scope="col" className="px-4 py-3 font-semibold">Strength</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(planets).map((p) => {
            const s = strengthWord(p.strength);
            return (
              <tr key={p.name} className="border-t border-line">
                <th scope="row" className="px-4 py-3 font-semibold">{PLANET_NAMES[p.name] ?? p.name}</th>
                <td className="px-4 py-3">{p.sign} <span className="text-ink-3">{p.degree_label}</span></td>
                {!timeUnknown && <td className="px-4 py-3 tabular-nums">{p.house}</td>}
                <td className="px-4 py-3">{p.nakshatra.name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 font-semibold ${s.className}`} title={p.strength_factors.map((f) => `${f.factor}: ${f.points}`).join("\n")}>{s.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function PeriodTimeline({ chart }: { chart: VedicChart }) {
  const { mahadashas } = chart.dasha;
  return (
    <ol className="flex flex-col gap-2">
      {mahadashas.map((m) => (
        <li key={`${m.lord}-${m.start}`} className={`flex flex-col gap-2 rounded-2xl px-4 py-3 ${m.is_active ? "border-2 border-star bg-star-soft" : "bg-paper"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-lg font-semibold">{m.lord} period {m.is_active && <span className="ml-1 rounded-full bg-star px-2.5 py-0.5 text-sm text-white">Now</span>}</span>
            <span className="text-base text-ink-2">{formatMonthYear(m.start)} – {formatMonthYear(m.end)}</span>
          </div>
          {m.is_active && m.antardashas && (
            <ul className="grid gap-1 sm:grid-cols-2">
              {m.antardashas.map((a) => (
                <li key={`${a.lord}-${a.start}`} className={`text-base ${a.is_active ? "font-bold text-star-ink" : "text-ink-2"}`}>
                  {a.lord}: {formatMonthYear(a.start)} – {formatMonthYear(a.end)}{a.is_active ? " (now)" : ""}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
