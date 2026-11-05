import { AREAS, AREA_ORDER, type AreaKey } from "@/lib/areas";
import { DOMAIN_WORDS } from "@/lib/readings";
import { formatMonthYear } from "@/lib/format";
import type { DomainOutlook, PlanetPlacement, VedicChart } from "@/types/readings";

export const PLANET_NAMES: Record<string, string> = {
  Sun: "Sun (Surya)", Moon: "Moon (Chandra)", Mars: "Mars (Mangal)", Mercury: "Mercury (Budh)", Jupiter: "Jupiter (Guru)",
  Venus: "Venus (Shukra)", Saturn: "Saturn (Shani)", Rahu: "Rahu (shadow planet)", Ketu: "Ketu (shadow planet)",
};

/** Special planet patterns (yogas), each with a plain name and what the books say it brings. */
export const YOGA_WORDS: Record<string, { name: string; meaning: string }> = {
  gaja_kesari: { name: "Moon and Jupiter together", meaning: "A lucky mix for cleverness, respect and success." },
  budha_aditya: { name: "Sun and Mercury together", meaning: "A mix for a sharp mind and a good name." },
  chandra_mangala: { name: "Moon and Mars together", meaning: "A mix for earning by your own effort, sometimes in unusual ways." },
  ruchaka: { name: "A strong Mars", meaning: "Courage, strength and leadership." },
  bhadra: { name: "A strong Mercury", meaning: "A clever mind and a way with words." },
  hamsa: { name: "A strong Jupiter", meaning: "Wisdom and goodness, and people respect you." },
  malavya: { name: "A strong Venus", meaning: "Charm, comfort, art and a happy marriage." },
  shasha: { name: "A strong Saturn", meaning: "The strength to lead and organise people." },
  sunapha: { name: "A planet just after the Moon", meaning: "Helps you earn your own money and a good name." },
  anapha: { name: "A planet just before the Moon", meaning: "Good health, a pleasant nature and self-respect." },
  durudhara: { name: "Planets on both sides of the Moon", meaning: "Comfort, money and a giving heart." },
  kemadruma: { name: "A lonely Moon", meaning: "Sometimes you may feel alone or have a hard time, but other things in your chart can soften this." },
  yogakaraka: { name: "A lucky planet", meaning: "Your chart has a planet that helps you." },
  raja_yoga: { name: "A pattern for rising up", meaning: "A rise in status, especially in certain years." },
  dhana_yoga: { name: "A pattern for wealth", meaning: "A good chance to build wealth." },
  viparita_raja: { name: "Good from hard times", meaning: "Good things can come to you after hard times." },
  mangal_dosha: { name: "Mars and marriage", meaning: "Marriage may need more patience; matching charts with your partner can help." },
  neecha_bhanga: { name: "A weak spot that turns strong", meaning: "A weak spot early in life can turn into a strength later." },
};

/** What each planet's time in your life tends to bring, in plain words. */
export const PERIOD_WORDS: Record<string, string> = {
  Sun: "A time for being noticed and leading.",
  Moon: "A time about feelings, home and family.",
  Mars: "A time of energy and quick action.",
  Mercury: "A time for learning, talking and business.",
  Jupiter: "A time of growth and good luck.",
  Venus: "A time for love, comfort and enjoying life.",
  Saturn: "A time of hard work, with slow but lasting results.",
  Rahu: "A time of big dreams, new chances and restlessness.",
  Ketu: "A time for letting go and growing inside.",
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
  if (strength > -1) return { label: "Okay", className: "bg-paper text-ink-2" };
  return { label: "Weak", className: "bg-care-soft text-[#7c2d12]" };
}

/** The birth chart, drawn the North-Indian way. Box 1 (the rising sign) is the top diamond. */
export function BirthChart({ chart }: { chart: VedicChart }) {
  const lagna = chart.lagna.sign_index;
  return (
    <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[22rem]" role="img" aria-label="Your birth chart, a map of the sky when you were born">
      <rect x="2" y="2" width="296" height="296" rx="8" fill="#faf9f6" stroke="#121211" strokeWidth="1.5" />
      <g stroke="#121211" strokeWidth="0.9" fill="none">
        <line x1="2" y1="2" x2="298" y2="298" />
        <line x1="298" y1="2" x2="2" y2="298" />
        <polygon points="150,2 298,150 150,298 2,150" />
      </g>
      <polygon points="150,2 224,76 150,150 76,76" fill="#e5e4f1" opacity="0.9" />
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
      This is a map of the sky when you were born. The chart has 12 boxes, one for each part of life. The shaded box at the top is box 1: you.
      The boxes go round to the left. The small grey numbers are the signs (1 = Aries, 2 = Taurus … 12 = Pisces).
      The letters are planets: {Object.entries(ABBR).map(([name, abbr]) => `${abbr} = ${name}`).join(", ")}.
    </p>
  );
}

/** Life areas (Love, Money, Work…) as a word and a simple bar, plus which ones matter most right now. */
export function LifeAreas({ domains }: { domains: Record<string, DomainOutlook> }) {
  const keys = [
    ...AREA_ORDER.filter((k) => domains[k]),
    ...Object.keys(domains).filter((k) => !AREA_ORDER.includes(k as AreaKey)),
  ];
  return (
    <ul className="grid gap-x-12 md:grid-cols-2">
      {keys.map((key) => {
        const d = domains[key];
        const word = DOMAIN_WORDS[d.assessment];
        const area = AREAS[key as AreaKey];
        const Icon = area?.icon;
        return (
          <li key={key} className="flex flex-col gap-3 border-b border-line py-5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-3 font-display text-3xl">
                {Icon && <Icon className="h-5 w-5 text-star" strokeWidth={1.6} aria-hidden="true" />}
                {area?.name ?? d.label.replace("&", "and")}
              </span>
              <span className="flex items-baseline gap-2">
                <span className="text-lg font-semibold" style={{ color: word.color }}>{word.label}</span>
                <span className="text-sm text-ink-3 tabular-nums">{d.score}%</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-line" role="img" aria-label={`${d.score} out of 100`}>
              <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: word.color }} />
            </div>
            {d.activated_by_current_dasha.length > 0 && (
              <p className="text-base text-star-ink">This matters a lot for you right now.</p>
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
            <th scope="col" className="px-4 py-3 font-semibold">Birth star</th>
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
        <li key={`${m.lord}-${m.start}`} className={`flex flex-col gap-2 border-b py-4 ${m.is_active ? "border-star" : "border-line"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-display text-2xl">{m.lord} time {m.is_active && <span className="eyebrow ml-2 rounded-full bg-star px-2.5 py-1 align-middle text-moon">Now</span>}</span>
            <span className="text-base text-ink-2">{formatMonthYear(m.start)} to {formatMonthYear(m.end)}</span>
          </div>
          {PERIOD_WORDS[m.lord] && <p className="text-lg text-ink-2">{PERIOD_WORDS[m.lord]}</p>}
          {m.is_active && m.antardashas && (
            <ul className="grid gap-1 sm:grid-cols-2" aria-label="Smaller times inside this one">
              {m.antardashas.map((a) => (
                <li key={`${a.lord}-${a.start}`} className={`text-base ${a.is_active ? "font-bold text-star-ink" : "text-ink-2"}`}>
                  {a.lord}: {formatMonthYear(a.start)} to {formatMonthYear(a.end)}{a.is_active ? " (now)" : ""}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
