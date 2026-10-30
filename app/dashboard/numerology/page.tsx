"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight, CalendarDays, CheckCircle2, Compass, Hash, Lightbulb, Link2, Sparkles, TriangleAlert, UserRound, Wand2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DateField } from "@/components/ui/DateTimeFields";
import { getLatest, postJson } from "@/lib/api";
import {
  CalculationGate, PrintButton, Disclaimer, ErrorBanner, LoadingStages, PageHero, SectionTitle,
} from "@/components/readings/ReadingUI";
import type { CitedItem, EvidenceLayer, NumerologyComponent, NumerologyRecord, NumerologyReport } from "@/types/readings";

const COMPONENTS: Array<{ key: NumerologyComponent; title: string; subtitle: string; layer: string }> = [
  { key: "moolank", title: "Moolank", subtitle: "Psychic Number", layer: "Your inner, instinctive nature · from the day of birth" },
  { key: "bhagyank", title: "Bhagyank", subtitle: "Destiny Number", layer: "Your wider life-current · from the full date of birth" },
  { key: "namank", title: "Namank", subtitle: "Name Number", layer: "Your public expression · from the spelling of your name" },
  { key: "personal_year", title: "Personal Year", subtitle: "Yearly Number", layer: "The themes of one chosen year" },
];

const LAYER_LABELS: Record<EvidenceLayer, { label: string; color: string }> = {
  component_specific: { label: "Component-specific", color: "#C6A15B" },
  compound_birth_date: { label: "Compound birth day", color: "#9E7938" },
  general_number: { label: "General number trait", color: "#5B6CC6" },
  context_specific: { label: "Context-specific", color: "#4A9C7A" },
};

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Jupiter: "♃", Rahu: "☊", Mercury: "☿", Venus: "♀", Ketu: "☋", Saturn: "♄", Mars: "♂",
};

function Medallion({ number, size = "lg" }: { number: number; size?: "lg" | "sm" }) {
  return (
    <div className={`relative ${size === "lg" ? "w-20 h-20 text-4xl" : "w-12 h-12 text-xl"} shrink-0`}>
      <div className="absolute inset-0 rounded-full gold-gradient shadow-lg shadow-gold/30" />
      <div className="absolute inset-[3px] rounded-full border border-white/40" />
      <div className="absolute inset-0 flex items-center justify-center font-bold text-white drop-shadow">{number}</div>
    </div>
  );
}

function CitedList({ items, tone }: { items: CitedItem[]; tone: "strength" | "challenge" | "theme" }) {
  const styles = {
    strength: { dot: "bg-success", border: "border-success/20" },
    challenge: { dot: "bg-error", border: "border-error/20" },
    theme: { dot: "bg-gold", border: "border-gold/25" },
  }[tone];
  if (!items.length) return <p className="text-sm text-text-secondary italic">No source-backed items for this section.</p>;
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className={`rounded-lg border ${styles.border} bg-white/70 p-3`}>
          {item.title && <p className="text-xs font-bold uppercase tracking-wide text-gold-dark mb-0.5">{item.title}</p>}
          <p className="text-sm text-text leading-relaxed flex gap-2"><span className={`w-1.5 h-1.5 rounded-full ${styles.dot} shrink-0 mt-2`} />{item.text}</p>
        </li>
      ))}
    </ul>
  );
}

export default function NumerologyPage() {
  const { user } = useApp();
  const [fullName, setFullName] = useState(user?.name ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ?? "");
  const [targetYear, setTargetYear] = useState(String(new Date().getFullYear()));
  const [context, setContext] = useState("general");
  const [result, setResult] = useState<NumerologyReport | null>(null);
  const [active, setActive] = useState<NumerologyComponent>("moolank");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => Array.from({ length: 11 }, (_, i) => currentYear - 2 + i), [currentYear]);

  useEffect(() => {
    getLatest<NumerologyReport>("/numerology/latest").then((saved) => saved && setResult(saved)).catch(() => undefined);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const report = await postJson<NumerologyReport>("/numerology/calculate", {
        full_name: fullName.trim(), date_of_birth: dateOfBirth, target_year: Number(targetYear),
        context: context === "general" ? null : context,
      });
      setResult(report);
      setActive("moolank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to calculate numerology right now.");
    } finally {
      setLoading(false);
    }
  }

  const records: Record<string, NumerologyRecord> = useMemo(() => {
    const map: Record<string, NumerologyRecord> = {};
    if (result) Object.values(result.interpretations).flat().forEach((r) => { map[r.record_id] = r; });
    return map;
  }, [result]);

  const activeMeta = COMPONENTS.find((c) => c.key === active)!;
  const calc = result?.components[active];
  const reading = result?.generated_interpretations[active];
  const layerCounts = result?.evidence_summary?.[active];
  const layerTotal = layerCounts ? Object.values(layerCounts).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
      <PageHero icon={Hash} eyebrow="Vedic Numerology" title="Your Numbers, Decoded"
        subtitle="Moolank, Bhagyank, Namank and Personal Year, calculated exactly as the research guide specifies and interpreted only from source-backed records." />

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-5 sm:p-6 card-shadow">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <label className="md:col-span-2 block">
            <span className="text-sm font-medium text-text mb-1.5 flex items-center gap-1.5"><UserRound className="w-4 h-4 text-gold" />Name to analyse</span>
            <input required maxLength={200} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Exact spelling, e.g. Lakshmi Sharma"
              className="w-full px-4 py-2.5 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-text" />
            <span className="text-[11px] text-text-secondary mt-1 block">Spelling decides the Namank. Spaces and punctuation are ignored; digits count at face value.</span>
          </label>
          <div className="md:col-span-2">
            <span className="text-sm font-medium text-text mb-1.5 flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-gold" />Date of birth</span>
            <DateField required value={dateOfBirth} onChange={setDateOfBirth} />
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-text mb-1.5 block">Year</span>
              <select value={targetYear} onChange={(e) => setTargetYear(e.target.value)} className="select-gold w-full px-3 py-2.5 rounded-xl border border-border outline-none hover:border-gold/50 focus:border-gold focus:ring-2 focus:ring-gold/20 text-text">
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-text mb-1.5 block">Context</span>
              <select value={context} onChange={(e) => setContext(e.target.value)} className="select-gold w-full px-3 py-2.5 rounded-xl border border-border outline-none hover:border-gold/50 focus:border-gold focus:ring-2 focus:ring-gold/20 text-text">
                <option value="general">General</option>
                <option value="business">Business</option>
              </select>
            </label>
          </div>
        </div>
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <p className="text-xs text-text-secondary">Chaldean letter table · digit-reduction rules · knowledge base from the Numerology Guide</p>
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gold-gradient text-white font-semibold shadow-md shadow-gold/30 hover:brightness-105 disabled:opacity-60">
            <Wand2 className="w-4 h-4" />{loading ? "Reading your numbers…" : "Reveal my numbers"}
          </button>
        </div>
        <div className="mt-3"><ErrorBanner message={error} /></div>
      </form>

      {loading && <LoadingStages stages={["Reducing your birth day to its Moolank", "Adding every digit for your Bhagyank", "Converting your name with the Chaldean table", "Retrieving source-backed interpretations", "Writing your personalised reading"]} />}

      {result && !loading && (
        <section aria-live="polite" className="space-y-6 animate-fade-in">
          <div className="flex justify-end -mb-2"><PrintButton /></div>
          {/* Profile synthesis */}
          <div className="rounded-2xl overflow-hidden border border-gold/30 bg-gradient-to-br from-[#FFFDF8] to-[#F6EEDD] card-shadow">
            <div className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-dark font-semibold mb-2">Your numbers together · {result.full_name}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-text leading-tight">{result.synthesis?.headline || "Your Numerology Profile"}</h2>
              {result.synthesis?.overview && <p className="mt-3 text-text-secondary leading-relaxed max-w-3xl">{result.synthesis.overview}</p>}
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {COMPONENTS.map((c) => {
                  const component = result.components[c.key];
                  return (
                    <button key={c.key} onClick={() => setActive(c.key)}
                      className={`text-left rounded-xl p-4 border transition-all ${active === c.key ? "bg-white border-gold shadow-md shadow-gold/15" : "bg-white/60 border-border hover:border-gold/50"}`}>
                      <div className="flex items-center gap-3">
                        <Medallion number={component.number} size="sm" />
                        <div className="min-w-0">
                          <p className="font-bold text-text leading-tight">{c.title}</p>
                          <p className="text-[11px] text-gold-dark font-medium">{c.subtitle}</p>
                        </div>
                      </div>
                      <p className="mt-2.5 text-xs text-text-secondary flex items-center gap-1">
                        {component.planet ? <><span className="text-base leading-none text-gold">{PLANET_GLYPHS[component.planet]}</span> Ruled by {component.planet}</> : <>Year {result.target_year}</>}
                        {component.compound_number != null && <span className="ml-auto font-mono text-[10px] bg-ivory px-1.5 rounded">{component.compound_number}</span>}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
            {(result.synthesis?.resonances?.length || result.synthesis?.tensions?.length || result.synthesis?.year_focus) ? (
              <div className="grid grid-cols-1 md:grid-cols-3 border-t border-gold/20 bg-white/50">
                {result.synthesis?.year_focus && (
                  <div className="p-5 md:border-r border-gold/20">
                    <p className="text-xs font-bold uppercase tracking-wide text-gold-dark flex items-center gap-1.5 mb-2"><Compass className="w-3.5 h-3.5" />Focus of {result.target_year}</p>
                    <p className="text-sm text-text leading-relaxed">{result.synthesis.year_focus.text}</p>
                  </div>
                )}
                <div className="p-5 md:border-r border-gold/20">
                  <p className="text-xs font-bold uppercase tracking-wide text-success flex items-center gap-1.5 mb-2"><Link2 className="w-3.5 h-3.5" />Resonances</p>
                  <ul className="space-y-2">{result.synthesis?.resonances?.length ? result.synthesis.resonances.map((r, i) => <li key={i} className="text-sm text-text leading-relaxed">{r.text}</li>) : <li className="text-sm text-text-secondary italic">No cross-number resonance is supported by the records.</li>}</ul>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-error flex items-center gap-1.5 mb-2"><ArrowLeftRight className="w-3.5 h-3.5" />Tensions</p>
                  <ul className="space-y-2">{result.synthesis?.tensions?.length ? result.synthesis.tensions.map((t, i) => <li key={i} className="text-sm text-text leading-relaxed">{t.text}</li>) : <li className="text-sm text-text-secondary italic">No tension between your numbers is supported by the records.</li>}</ul>
                </div>
              </div>
            ) : null}
          </div>

          {/* Component detail */}
          {calc && reading && (
            <div className="bg-card rounded-2xl border border-border card-shadow overflow-hidden">
              <div className="flex overflow-x-auto border-b border-border">
                {COMPONENTS.map((c) => (
                  <button key={c.key} onClick={() => setActive(c.key)}
                    className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${active === c.key ? "border-gold text-gold-dark bg-gold/5" : "border-transparent text-text-secondary hover:text-text"}`}>
                    {c.title} {result.components[c.key].number}
                  </button>
                ))}
              </div>
              <div className="p-5 sm:p-7 space-y-6">
                <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
                  <Medallion number={calc.number} />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gold-dark font-semibold">{activeMeta.title} · {activeMeta.subtitle}</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-text mt-1">{reading.headline || `${activeMeta.title} ${calc.number}`}</h3>
                    <p className="text-xs text-text-secondary mt-1">{activeMeta.layer}</p>
                  </div>
                </div>

                {reading.generation_status !== "generated" ? (
                  <p className="text-sm text-text-secondary bg-ivory rounded-xl p-4">
                    {reading.generation_status === "no_source_records" ? "The knowledge base has no source-backed record for this number yet, so nothing is invented." : "The written interpretation is unavailable right now; the calculation and source records below are still valid."}
                  </p>
                ) : (
                  <>
                    {reading.summary && <p className="text-[15px] text-text leading-relaxed bg-ivory/70 border-l-4 border-gold rounded-r-xl p-4">{reading.summary}</p>}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      <div><h4 className="text-sm font-bold text-success mb-2.5 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />Strengths</h4><CitedList items={reading.strengths} tone="strength" /></div>
                      <div><h4 className="text-sm font-bold text-error mb-2.5 flex items-center gap-1.5"><TriangleAlert className="w-4 h-4" />Challenges</h4><CitedList items={reading.challenges} tone="challenge" /></div>
                      <div><h4 className="text-sm font-bold text-gold-dark mb-2.5 flex items-center gap-1.5"><Sparkles className="w-4 h-4" />Key themes</h4><CitedList items={reading.key_themes} tone="theme" /></div>
                    </div>
                  </>
                )}

                {/* How this reading was derived */}
                <div className="rounded-2xl bg-navy text-white p-5 sm:p-6 relative overflow-hidden">
                  <div className="absolute inset-0 star-field opacity-40" />
                  <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gold text-xs font-bold uppercase tracking-[0.18em] mb-3 flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" />How this was calculated</p>
                      <ol className="space-y-2">
                        {calc.steps.map((step, i) => (
                          <li key={i} className="flex gap-3 text-sm"><span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span><span className="text-white/85 font-mono text-[13px]">{step}</span></li>
                        ))}
                      </ol>
                      {active === "namank" && calc.letter_values && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {calc.letter_values.map((item, i) => (
                            <div key={`${item.letter}-${i}`} className="w-9 rounded-lg bg-white/10 border border-white/10 py-1.5 text-center">
                              <div className="font-semibold text-sm">{item.letter}</div><div className="text-[11px] text-gold">{item.value}</div>
                            </div>
                          ))}
                          <div className="rounded-lg bg-gold/20 border border-gold/40 px-3 py-1.5 text-center"><div className="text-[10px] text-white/70">Total</div><div className="font-bold text-gold">{calc.compound_number}</div></div>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-gold text-xs font-bold uppercase tracking-[0.18em] mb-3">Why this reading</p>
                      {reading.explanation?.why_this_reading && <p className="text-sm text-white/85 leading-relaxed">{reading.explanation.why_this_reading}</p>}
                      {layerTotal > 0 && layerCounts && (
                        <div className="mt-4">
                          <p className="text-[11px] text-white/60 mb-1.5">Evidence used ({layerTotal} source records)</p>
                          <div className="flex h-2.5 rounded-full overflow-hidden bg-white/10">
                            {(Object.keys(LAYER_LABELS) as EvidenceLayer[]).map((layer) => layerCounts[layer] > 0 && (
                              <div key={layer} style={{ width: `${(layerCounts[layer] / layerTotal) * 100}%`, background: LAYER_LABELS[layer].color }} />
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                            {(Object.keys(LAYER_LABELS) as EvidenceLayer[]).map((layer) => layerCounts[layer] > 0 && (
                              <span key={layer} className="text-[11px] text-white/70 flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: LAYER_LABELS[layer].color }} />{LAYER_LABELS[layer].label} · {layerCounts[layer]}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {reading.explanation?.evidence_notes?.length > 0 && (
                        <ul className="mt-4 space-y-1.5">
                          {reading.explanation.evidence_notes.map((note, i) => <li key={i} className="text-xs text-white/75 border-l border-gold/50 pl-2.5">{note.text}</li>)}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <CalculationGate description="See every source record retrieved for each number, its evidence layer (component-specific, compound birth day, general or context), and the citations behind each statement above.">
            {COMPONENTS.map((c) => {
              const list = result.interpretations[c.key] ?? [];
              const cited = new Set(result.generated_interpretations[c.key]?.supporting_record_ids ?? []);
              return (
                <div key={c.key}>
                  <SectionTitle title={`${c.title} ${result.components[c.key].number}`} subtitle={`${list.length} records retrieved · ${cited.size} cited in the reading`} />
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {list.map((record) => (
                      <div key={record.record_id} className={`rounded-xl border p-3 bg-card ${cited.has(record.record_id) ? "border-gold/50" : "border-border opacity-80"}`}>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-navy/5 text-navy">{record.record_id}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ background: LAYER_LABELS[record.evidence_layer]?.color ?? "#999" }}>{LAYER_LABELS[record.evidence_layer]?.label}</span>
                          {cited.has(record.record_id) && <span className="text-[10px] text-gold-dark font-semibold">cited</span>}
                        </div>
                        <p className="text-sm font-semibold text-text">{record.trait}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{record.claim}</p>
                        {record.source_wording && <p className="text-[11px] italic text-text-secondary mt-1">“{record.source_wording}”</p>}
                        <p className="text-[10px] text-text-secondary/70 mt-1">{record.source_name} · {record.verification_status.replaceAll("_", " ")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {Object.keys(records).length === 0 && <p className="text-sm text-text-secondary">No records were retrieved.</p>}
          </CalculationGate>

          <Disclaimer text={result.disclaimer} />
        </section>
      )}
    </div>
  );
}
