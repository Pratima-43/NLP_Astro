"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity, BookOpen, Briefcase, CalendarDays, Clock, Coins, Compass, GraduationCap, Heart, MapPin, Moon, Orbit, Search, Sparkles, Star, Sun, UserRound,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DateField, TimeField } from "@/components/ui/DateTimeFields";
import { apiFetch, getLatest, postJson } from "@/lib/api";
import {
  CalculationGate, PrintButton, Disclaimer, ErrorBanner, EvidenceTable, LoadingStages, PageHero, PredictionCard, ReadingSections, SectionTitle,
} from "@/components/readings/ReadingUI";
import type { AstrologyReading, DomainOutlook, EvidenceItem, GeocodeResult, VedicChart } from "@/types/readings";

const ABBR: Record<string, string> = { Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju", Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke" };
const PLANET_COLORS: Record<string, string> = { Sun: "#D9822B", Moon: "#7C8DB5", Mars: "#C4453C", Mercury: "#3E9B6B", Jupiter: "#C69C2D", Venus: "#C2569A", Saturn: "#4C5A88", Rahu: "#6B5B95", Ketu: "#8C6A4F" };
// Label anchor for each house in the North-Indian diamond chart (300 x 300 viewBox).
const HOUSE_POS: Record<number, [number, number]> = {
  1: [150, 78], 2: [75, 40], 3: [40, 75], 4: [78, 150], 5: [40, 225], 6: [75, 262],
  7: [150, 222], 8: [225, 262], 9: [262, 225], 10: [222, 150], 11: [262, 75], 12: [225, 40],
};
const DIGNITY_STYLE: Record<string, string> = {
  exalted: "bg-success/10 text-success", moolatrikona: "bg-success/10 text-success", own_sign: "bg-success/10 text-success",
  friendly_sign: "bg-gold/10 text-gold-dark", neutral: "bg-border/60 text-text-secondary", enemy_sign: "bg-error/10 text-error", debilitated: "bg-error/10 text-error",
};
const ASSESSMENT_COLOR: Record<DomainOutlook["assessment"], string> = { strong: "#4A7C59", supportive: "#8AA65B", mixed: "#C6A15B", challenging: "#C45B5B" };
const SECTION_ICONS = { personality: UserRound, career: Briefcase, relationships: Heart, finance: Coins, health: Activity, spirituality: Sparkles };

function NorthIndianChart({ chart }: { chart: VedicChart }) {
  const lagna = chart.lagna.sign_index;
  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[360px] mx-auto" role="img" aria-label="North Indian birth chart">
      <defs>
        <linearGradient id="chartBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFDF8" /><stop offset="1" stopColor="#F4EAD6" /></linearGradient>
      </defs>
      <rect x="2" y="2" width="296" height="296" rx="6" fill="url(#chartBg)" stroke="#C6A15B" strokeWidth="2" />
      <g stroke="#C6A15B" strokeWidth="1.2" fill="none">
        <line x1="2" y1="2" x2="298" y2="298" /><line x1="298" y1="2" x2="2" y2="298" />
        <polygon points="150,2 298,150 150,298 2,150" />
      </g>
      {Object.entries(HOUSE_POS).map(([houseStr, [x, y]]) => {
        const house = Number(houseStr);
        const sign = ((lagna + house - 1) % 12) + 1;
        const occupants = chart.houses[house - 1].occupants;
        return (
          <g key={house}>
            <text x={x} y={y - (occupants.length > 2 ? 18 : 12)} textAnchor="middle" fontSize="10" fill="#9E7938" fontWeight="700">{sign}</text>
            {house === 1 && <text x={x} y={y + 30} textAnchor="middle" fontSize="8" fill="#9E7938" letterSpacing="1">LAGNA</text>}
            {occupants.map((p, i) => {
              const perRow = 2;
              const row = Math.floor(i / perRow);
              const col = i % perRow;
              const count = Math.min(perRow, occupants.length - row * perRow);
              const px = x + (col - (count - 1) / 2) * 24;
              const py = y + 2 + row * 13 - (occupants.length > 2 ? 6 : 0);
              const placement = chart.planets[p];
              return (
                <text key={p} x={px} y={py} textAnchor="middle" fontSize="11" fontWeight="700" fill={PLANET_COLORS[p]}>
                  {ABBR[p]}{placement.retrograde && p !== "Rahu" && p !== "Ketu" ? "ᴿ" : ""}
                </text>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function DomainCard({ domain }: { domain: DomainOutlook }) {
  const [open, setOpen] = useState(false);
  const color = ASSESSMENT_COLOR[domain.assessment];
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-text">{domain.label}</p>
        <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color }}>{domain.assessment}</span>
      </div>
      <div className="h-2 rounded-full bg-border/60 overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${domain.score}%`, background: color }} /></div>
      <div className="flex items-center justify-between mt-1.5 text-[11px] text-text-secondary">
        <span>Houses {domain.houses.join(", ")} · karaka {domain.karakas.join(", ")}</span><span className="font-semibold">{domain.score}/100</span>
      </div>
      {domain.activated_by_current_dasha.length > 0 && <p className="mt-2 text-[11px] text-navy bg-navy/5 rounded-md px-2 py-1">Activated now by the {domain.activated_by_current_dasha.join(" & ")} period</p>}
      <button onClick={() => setOpen(!open)} className="mt-2 text-[11px] font-medium text-gold-dark hover:text-gold">{open ? "Hide" : "Show"} scoring factors</button>
      {open && (
        <ul className="mt-1.5 space-y-0.5">
          {domain.factors.map((f, i) => (
            <li key={i} className="flex justify-between text-[11px] text-text-secondary"><span>{f.factor}</span><span className={f.points >= 0 ? "text-success" : "text-error"}>{f.points >= 0 ? "+" : ""}{f.points}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AstrologyPage() {
  const { user } = useApp();
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [dob, setDob] = useState(user?.dateOfBirth ?? "");
  const [tob, setTob] = useState(user?.timeOfBirth ?? "");
  const [timeUnknown, setTimeUnknown] = useState(Boolean(user?.timeOfBirthUnknown));
  const [place, setPlace] = useState(user?.placeOfBirth ?? "");
  const [matches, setMatches] = useState<GeocodeResult[]>([]);
  const [chosen, setChosen] = useState<GeocodeResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<AstrologyReading | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLatest<AstrologyReading>("/astrology/latest").then((saved) => saved && setResult(saved)).catch(() => undefined);
  }, []);

  async function findPlace() {
    if (place.trim().length < 2) return;
    setSearching(true);
    setError("");
    try {
      const found = await apiFetch<GeocodeResult[]>(`/astrology/geocode?q=${encodeURIComponent(place.trim())}`);
      setMatches(found);
      setChosen(found[0] ?? null);
      if (!found.length) setError("No matching place found. Try a nearby city.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Place lookup failed.");
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const reading = await postJson<AstrologyReading>("/astrology/chart", {
        full_name: fullName.trim(), date_of_birth: dob, time_of_birth: timeUnknown || !tob ? null : tob,
        place_name: chosen?.name ?? place.trim(),
        ...(chosen ? { latitude: chosen.latitude, longitude: chosen.longitude, timezone: chosen.timezone } : {}),
      });
      setResult(reading);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to calculate the chart right now.");
    } finally {
      setLoading(false);
    }
  }

  const evidence = useMemo(() => Object.fromEntries((result?.evidence ?? []).map((e) => [e.evidence_id, e])) as Record<string, EvidenceItem>, [result]);
  const chart = result?.chart;
  const reading = result?.interpretation;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
      <PageHero icon={Star} eyebrow="Vedic Astrology · Jyotish" title="Your Sidereal Birth Chart"
        subtitle="Planets computed with the Swiss Ephemeris in the Lahiri sidereal zodiac, read through classical Parashari rules: dignities, yogas, Vimshottari dashas and current transits." />

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-5 sm:p-6 card-shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-text mb-1.5 flex items-center gap-1.5"><UserRound className="w-4 h-4 text-gold" />Name</span>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none" />
          </label>
          <div>
            <span className="text-sm font-medium text-text mb-1.5 flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-gold" />Date of birth</span>
            <DateField required value={dob} onChange={setDob} />
          </div>
          <div>
            <span className="text-sm font-medium text-text mb-1.5 flex items-center gap-1.5"><Clock className="w-4 h-4 text-gold" />Time of birth</span>
            <TimeField required={!timeUnknown} disabled={timeUnknown} value={tob} onChange={setTob} />
            <label className="mt-1.5 flex items-center gap-1.5 text-xs text-text-secondary"><input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknown(e.target.checked)} className="accent-[#C6A15B]" />I don&apos;t know my birth time</label>
          </div>
        </div>
        <div>
          <span className="text-sm font-medium text-text mb-1.5 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gold" />Place of birth</span>
          <div className="flex gap-2">
            <input required value={place} onChange={(e) => { setPlace(e.target.value); setChosen(null); setMatches([]); }} placeholder="City, country" className="flex-1 px-4 py-2.5 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none" />
            <button type="button" onClick={findPlace} disabled={searching} className="px-4 rounded-xl border border-gold text-gold-dark text-sm font-medium hover:bg-gold/10 inline-flex items-center gap-1.5 disabled:opacity-50"><Search className="w-4 h-4" />{searching ? "Finding…" : "Find"}</button>
          </div>
          {matches.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {matches.map((m) => (
                <button type="button" key={m.name} onClick={() => setChosen(m)} className={`text-xs px-3 py-1.5 rounded-full border text-left ${chosen?.name === m.name ? "border-gold bg-gold/10 text-gold-dark" : "border-border text-text-secondary hover:border-gold/50"}`}>
                  {m.name.split(",").slice(0, 3).join(",")} · {m.latitude.toFixed(2)}, {m.longitude.toFixed(2)} · {m.timezone}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-text-secondary">Sidereal · Lahiri ayanamsa · whole-sign houses · mean nodes</p>
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gold-gradient text-white font-semibold shadow-md shadow-gold/30 disabled:opacity-60"><Orbit className="w-4 h-4" />{loading ? "Casting your chart…" : "Cast my chart"}</button>
        </div>
        <ErrorBanner message={error} />
      </form>

      {loading && <LoadingStages stages={["Locating your birthplace and time zone", "Computing sidereal planetary positions", "Placing planets in houses and nakshatras", "Checking dignities, yogas and dashas", "Writing your reading from classical significations"]} />}

      {result && chart && !loading && (
        <section className="space-y-6 animate-fade-in">
          <div className="flex justify-end -mb-2"><PrintButton /></div>
          <div className="rounded-2xl overflow-hidden border border-gold/30 bg-gradient-to-br from-[#FFFDF8] to-[#F3EBDD] card-shadow grid grid-cols-1 lg:grid-cols-[1fr_380px]">
            <div className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-dark font-semibold mb-2">{result.full_name} · {chart.birth.local_datetime.replace("T", " ")} · {result.place_name?.split(",")[0]}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-text leading-tight">{reading?.headline || "Your Vedic Chart"}</h2>
              {reading?.overview && <p className="mt-3 text-text-secondary leading-relaxed">{reading.overview}</p>}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: Compass, label: "Ascendant (Lagna)", value: result.birth_time_unknown ? "Needs birth time" : chart.lagna.sign, sub: result.birth_time_unknown ? "" : `${chart.lagna.sign_sanskrit} · ${chart.lagna.degree_label} · lord ${chart.lagna.lord}` },
                  { icon: Moon, label: "Moon sign (Rashi)", value: chart.moon_sign, sub: `${chart.planets.Moon.nakshatra.name} pada ${chart.planets.Moon.nakshatra.pada} · ${chart.moon_paksha}` },
                  { icon: Sun, label: "Sun sign", value: chart.sun_sign, sub: `${chart.planets.Sun.degree_label} · ${chart.planets.Sun.nakshatra.name}` },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-white/70 border border-border p-3.5">
                    <p className="text-[11px] text-text-secondary flex items-center gap-1"><item.icon className="w-3.5 h-3.5 text-gold" />{item.label}</p>
                    <p className="text-lg font-bold text-text mt-0.5">{item.value}</p>
                    <p className="text-[11px] text-text-secondary">{item.sub}</p>
                  </div>
                ))}
              </div>
              {chart.dasha.current_period && (
                <div className="mt-4 rounded-xl bg-navy text-white p-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div><p className="text-[11px] text-gold uppercase tracking-wider">Running period</p><p className="font-bold">{chart.dasha.current_period.mahadasha} – {chart.dasha.current_period.antardasha}</p></div>
                  <p className="text-xs text-white/70">Antardasha {chart.dasha.current_period.antardasha_start} → {chart.dasha.current_period.antardasha_end}<br />Mahadasha until {chart.dasha.current_period.mahadasha_end}</p>
                  {chart.transits.sade_sati.active && <span className="text-xs px-2.5 py-1 rounded-full bg-error/20 text-[#FFB4B4]">Sade Sati · {chart.transits.sade_sati.phase}</span>}
                </div>
              )}
            </div>
            <div className="p-6 bg-white/60 border-t lg:border-t-0 lg:border-l border-gold/20 flex flex-col justify-center">
              {result.birth_time_unknown ? <p className="text-sm text-text-secondary text-center">The house chart needs an exact birth time.</p> : <NorthIndianChart chart={chart} />}
              <p className="text-[11px] text-center text-text-secondary mt-2">Rashi chart (D1), North-Indian style · numbers are signs</p>
            </div>
          </div>

          {reading?.predictions && reading.predictions.length > 0 && (
            <div className="space-y-3">
              <SectionTitle icon={Sparkles} title="Predictions" subtitle="Each prediction states its timing, confidence and the chart factors behind it." />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reading.predictions.map((p, i) => <PredictionCard key={i} prediction={p} evidence={evidence} />)}
              </div>
            </div>
          )}

          {reading?.current_period?.text && (
            <div className="rounded-xl border-l-4 border-navy bg-navy/5 p-4"><p className="text-xs font-bold uppercase tracking-wide text-navy mb-1">Now</p><p className="text-sm text-text leading-relaxed">{reading.current_period.text}</p></div>
          )}

          {reading?.sections && reading.sections.length > 0 && (
            <div className="space-y-3"><SectionTitle icon={BookOpen} title="Your reading" /><ReadingSections sections={reading.sections} evidence={evidence} icons={SECTION_ICONS} /></div>
          )}

          {!result.birth_time_unknown && (
            <div className="space-y-3">
              <SectionTitle icon={GraduationCap} title="Life-domain outlook" subtitle="Rule-based scores from house lords, occupants and karakas — open any card to see its arithmetic." />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">{Object.values(chart.domains).map((d) => <DomainCard key={d.label} domain={d} />)}</div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl border border-border p-5 card-shadow">
              <SectionTitle icon={Sparkles} title="Yogas in your chart" />
              <ul className="mt-3 space-y-2.5">
                {chart.yogas.length === 0 && <li className="text-sm text-text-secondary">No classical yogas from the checked list are formed.</li>}
                {chart.yogas.map((y, i) => (
                  <li key={i} className="rounded-xl bg-ivory border border-border p-3">
                    <p className="text-sm font-semibold text-text">{y.name}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{y.condition}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5 card-shadow">
              <SectionTitle icon={Clock} title="Vimshottari Mahadashas" subtitle={`Starts from the Moon's nakshatra (${chart.dasha.moon_nakshatra}); ${chart.dasha.balance_at_birth_years} years of ${chart.dasha.starting_lord} remained at birth.`} />
              <ol className="mt-3 relative border-l-2 border-gold/30 ml-2 space-y-2.5">
                {chart.dasha.mahadashas.slice(0, 9).map((m) => (
                  <li key={m.lord + m.start} className="ml-4 relative">
                    <span className={`absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border-2 ${m.is_active ? "bg-gold border-gold animate-pulse-gold" : "bg-white border-gold/50"}`} />
                    <div className={`flex items-center justify-between text-sm ${m.is_active ? "font-bold text-text" : "text-text-secondary"}`}>
                      <span style={{ color: m.is_active ? PLANET_COLORS[m.lord] : undefined }}>{m.lord} <span className="text-[11px] font-normal">({m.years} yrs)</span></span>
                      <span className="text-xs font-mono">{m.start.slice(0, 7)} → {m.end.slice(0, 7)}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border card-shadow overflow-hidden">
            <div className="p-5 pb-3"><SectionTitle icon={Orbit} title="Planetary positions" subtitle="Sidereal longitudes, dignity and a transparent strength score for each graha." /></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ivory text-[11px] uppercase tracking-wider text-text-secondary">
                  <tr>{["Planet", "Sign", "Degree", "House", "Nakshatra", "Dignity", "Navamsa", "Strength"].map((h) => <th key={h} className="text-left font-semibold px-4 py-2.5">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {Object.values(chart.planets).map((p) => (
                    <tr key={p.name} className="border-t border-border/70">
                      <td className="px-4 py-2.5 font-semibold" style={{ color: PLANET_COLORS[p.name] }}>{p.name}{p.retrograde && !["Rahu", "Ketu"].includes(p.name) && <span className="ml-1 text-[10px] text-text-secondary">R</span>}{p.combust && <span className="ml-1 text-[10px] text-error">C</span>}</td>
                      <td className="px-4 py-2.5">{p.sign}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">{p.degree_label}</td>
                      <td className="px-4 py-2.5">{result.birth_time_unknown ? "—" : p.house}</td>
                      <td className="px-4 py-2.5 text-xs">{p.nakshatra.name} <span className="text-text-secondary">· {p.nakshatra.pada}</span></td>
                      <td className="px-4 py-2.5"><span className={`text-[11px] px-2 py-0.5 rounded-full ${DIGNITY_STYLE[p.dignity]}`}>{p.dignity.replace("_", " ")}</span></td>
                      <td className="px-4 py-2.5 text-xs">{p.navamsa_sign}{p.vargottama && <span className="ml-1 text-gold-dark">★</span>}</td>
                      <td className={`px-4 py-2.5 font-semibold ${p.strength >= 1 ? "text-success" : p.strength < 0 ? "text-error" : "text-text-secondary"}`} title={p.strength_factors.map((f) => `${f.factor}: ${f.points}`).join("\n")}>{p.strength > 0 ? "+" : ""}{p.strength.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <CalculationGate description="See the astronomical inputs, conventions, each planet's strength arithmetic and every classical claim the chart activated — with the exact chart factor that triggered it.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-ivory border border-border p-4 text-sm space-y-1">
                <p className="font-semibold text-text mb-1">Astronomical inputs</p>
                <p className="text-text-secondary">Local time: {chart.birth.local_datetime} ({chart.birth.timezone})</p>
                <p className="text-text-secondary">UTC: {chart.birth.utc_datetime} · Julian day {chart.birth.julian_day_ut}</p>
                <p className="text-text-secondary">Coordinates: {chart.birth.latitude}, {chart.birth.longitude}</p>
                <p className="text-text-secondary">Lahiri ayanamsa: {chart.birth.ayanamsa_lahiri}°</p>
                <p className="text-text-secondary">Transits as of {chart.transits.as_of}: Saturn in {chart.transits.saturn.sign} ({chart.transits.saturn.house_from_moon} from Moon), Jupiter in {chart.transits.jupiter.sign} ({chart.transits.jupiter.house_from_moon} from Moon)</p>
              </div>
              <div className="rounded-xl bg-ivory border border-border p-4 text-sm space-y-1">
                <p className="font-semibold text-text mb-1">Conventions</p>
                {Object.entries(result.conventions).map(([k, v]) => <p key={k} className="text-text-secondary"><span className="capitalize font-medium text-text">{k.replace("_", " ")}:</span> {v}</p>)}
              </div>
            </div>
            <div>
              <p className="font-semibold text-text mb-2">Planet strength arithmetic</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.values(chart.planets).map((p) => (
                  <div key={p.name} className="rounded-xl border border-border p-3 bg-card">
                    <p className="text-sm font-semibold" style={{ color: PLANET_COLORS[p.name] }}>{p.name} = {p.strength > 0 ? "+" : ""}{p.strength.toFixed(1)}</p>
                    {p.strength_factors.map((f, i) => <p key={i} className="text-[11px] text-text-secondary flex justify-between"><span>{f.factor}</span><span>{f.points > 0 ? "+" : ""}{f.points}</span></p>)}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-text mb-2">Activated classical claims ({result.evidence.length})</p>
              <EvidenceTable evidence={result.evidence} />
            </div>
          </CalculationGate>

          <Disclaimer text={result.disclaimer} />
        </section>
      )}
    </div>
  );
}
