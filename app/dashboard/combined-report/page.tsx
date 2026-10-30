"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileBarChart, GitCompareArrows, Link2, Lock, RefreshCw, Scale, Zap } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { apiFetch, postJson } from "@/lib/api";
import { CalculationGate, ContributionBar, ErrorBanner, LoadingStages, MODULE_META, PageHero, PrintButton, SectionTitle } from "@/components/readings/ReadingUI";
import type { CombinedReportResult, IntegrationStatus, ModuleKey, Relation } from "@/types/readings";

const RELATION: Record<Relation, { label: string; color: string; description: string }> = {
  agreement: { label: "Agreement", color: "#4A7C59", description: "The systems point the same way" },
  partial_overlap: { label: "Partial overlap", color: "#C6A15B", description: "They share some ground" },
  difference: { label: "Different aspects", color: "#5B6CC6", description: "They speak to different sides" },
  contradiction: { label: "Contradiction", color: "#C45B5B", description: "They pull in opposite directions" },
  single_source: { label: "Single source", color: "#9B9488", description: "Only one system speaks to this" },
};
const LINKS: Record<ModuleKey, string> = { numerology: "/dashboard/numerology", astrology: "/dashboard/astrology", palmistry: "/dashboard/palmistry" };

export default function CombinedReportPage() {
  const { premium } = useApp();
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [report, setReport] = useState<CombinedReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (premium.isActive) apiFetch<IntegrationStatus>("/integration/status").then(setStatus).catch((e) => setError(e instanceof Error ? e.message : ""));
  }, [premium.isActive]);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      setReport(await postJson<CombinedReportResult>("/integration/report", {}));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to build the combined report.");
    } finally {
      setLoading(false);
    }
  }

  if (!premium.isActive) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-card rounded-2xl border border-border p-8 text-center card-shadow">
          <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4"><Lock className="w-8 h-8 text-white" /></div>
          <h2 className="text-xl font-bold text-text mb-2">Unlock the Combined Report</h2>
          <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">See where Numerology, Vedic Astrology and Palmistry agree, overlap and disagree about you — theme by theme.</p>
          <p className="text-xs text-text-secondary mb-4">Use coupon <span className="font-mono font-bold text-gold">ASTROFREE</span> for free access</p>
          <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gold text-white font-medium hover:bg-gold-dark">Unlock Premium <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    );
  }

  const availableCount = status ? Object.values(status).filter((s) => s.available).length : 0;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
      <PageHero icon={FileBarChart} eyebrow="Cross-system analysis" title="Your Combined Reading"
        subtitle="Claims from your three readings are aligned by theme, then compared for agreement, overlap, difference and contradiction.">
        <div className="flex flex-wrap gap-2">
        {report && !loading && <PrintButton label="Download PDF" tone="dark" />}
        <button onClick={generate} disabled={loading || availableCount === 0} className="no-print shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl gold-gradient text-white font-semibold shadow-lg disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />{report ? "Regenerate" : "Generate report"}
        </button>
        </div>
      </PageHero>

      {status && (
        <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(MODULE_META) as ModuleKey[]).map((m) => {
            const Meta = MODULE_META[m];
            const s = status[m];
            return (
              <Link key={m} href={LINKS[m]} className={`rounded-xl border p-4 flex items-center gap-3 transition-all hover:card-shadow-hover ${s.available ? "bg-card border-border" : "border-dashed border-border bg-ivory"}`}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${Meta.color}1A` }}><Meta.icon className="w-5 h-5" style={{ color: Meta.color }} /></div>
                <div><p className="text-sm font-semibold text-text">{Meta.label}</p><p className="text-xs text-text-secondary">{s.available ? `${s.claims} comparable claims` : "Not generated yet →"}</p></div>
              </Link>
            );
          })}
        </div>
      )}
      {!status && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="h-[74px] rounded-xl border border-border bg-card animate-pulse" />)}
        </div>
      )}
      <ErrorBanner message={error} />
      {status && !report && !loading && (
        <div className="rounded-2xl border border-dashed border-gold/40 bg-gradient-to-br from-[#FFFDF8] to-[#F6EEDD] p-8 text-center">
          <div className="w-14 h-14 rounded-2xl gold-gradient mx-auto flex items-center justify-center shadow-lg shadow-gold/30 mb-4"><GitCompareArrows className="w-6 h-6 text-white" /></div>
          <h3 className="text-lg font-bold text-text">{availableCount === 0 ? "Start with one reading" : `Ready to compare ${availableCount} of 3 readings`}</h3>
          <p className="text-sm text-text-secondary max-w-lg mx-auto mt-1.5">
            {availableCount === 0
              ? "The combined report compares what your numerology, birth chart and palm say about you. Generate at least one of them first, then come back here."
              : "Your report groups every claim by theme (career, relationships, mind, vitality, timing) and shows where the systems agree, overlap or disagree, plus how much each one contributed."}
          </p>
          {availableCount > 0 && availableCount < 3 && <p className="text-xs text-gold-dark mt-3">Tip: add the missing reading{availableCount === 2 ? "" : "s"} above for a fuller comparison.</p>}
        </div>
      )}
      {loading && <LoadingStages stages={["Gathering claims from your three readings", "Aligning claims by theme", "Comparing the systems theme by theme", "Writing your combined reading"]} />}

      {report && !loading && report.generation_status === "generated" && (
        <section className="space-y-6 animate-fade-in">
          <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-[#FFFDF8] to-[#F3EBDD] p-6 sm:p-8 card-shadow">
            <h2 className="text-2xl sm:text-3xl font-bold text-text leading-tight">{report.headline}</h2>
            <p className="mt-3 text-text-secondary leading-relaxed">{report.overview}</p>
            <div className="mt-6 max-w-2xl"><p className="text-xs font-bold uppercase tracking-wide text-text-secondary mb-2">Overall contribution</p><ContributionBar contributions={report.overall_contributions} /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-success/25 bg-success/5 p-5">
              <p className="text-sm font-bold text-success flex items-center gap-1.5 mb-3"><Link2 className="w-4 h-4" />Strongest agreements</p>
              <ul className="space-y-2">{report.strongest_agreements.map((a, i) => <li key={i} className="text-sm text-text leading-relaxed">{a.text}</li>)}</ul>
            </div>
            <div className="rounded-2xl border border-error/25 bg-error/5 p-5">
              <p className="text-sm font-bold text-error flex items-center gap-1.5 mb-3"><Zap className="w-4 h-4" />Notable tensions</p>
              <ul className="space-y-2">{report.notable_tensions.map((a, i) => <li key={i} className="text-sm text-text leading-relaxed">{a.text}</li>)}</ul>
            </div>
          </div>

          <div className="space-y-3">
            <SectionTitle icon={GitCompareArrows} title="Theme by theme" subtitle="Each theme shows how the systems relate and how much each contributed." />
            <div className="flex flex-wrap gap-3">{(Object.keys(RELATION) as Relation[]).map((r) => <span key={r} className="text-[11px] text-text-secondary flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: RELATION[r].color }} />{RELATION[r].label}: {RELATION[r].description}</span>)}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.themes.map((t) => (
                <article key={t.theme} className="bg-card rounded-xl border border-border p-5 card-shadow" style={{ borderTop: `3px solid ${RELATION[t.relation].color}` }}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-bold text-text">{t.label}</h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white" style={{ background: RELATION[t.relation].color }}>{RELATION[t.relation].label}</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{t.synthesis}</p>
                  <div className="mt-3"><ContributionBar contributions={t.contributions} compact /></div>
                  <div className="mt-1.5 flex gap-3">{t.contributions.filter((c) => c.percent > 0).map((c) => <span key={c.module} className="text-[11px] text-text-secondary">{MODULE_META[c.module].label} {c.percent}%</span>)}</div>
                </article>
              ))}
            </div>
          </div>

          <CalculationGate title="How this report was built" description="See the method, how contribution percentages are computed, and every claim that was cited with the calculation it came from.">
            <p className="text-sm text-text-secondary leading-relaxed flex gap-2"><Scale className="w-4 h-4 text-gold shrink-0 mt-0.5" />{report.method}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(MODULE_META) as ModuleKey[]).map((m) => (
                <div key={m}>
                  <p className="text-xs font-bold mb-1.5" style={{ color: MODULE_META[m].color }}>{MODULE_META[m].label}</p>
                  <ul className="space-y-1.5">
                    {Object.entries(report.claims).filter(([, c]) => c.module === m).map(([id, c]) => (
                      <li key={id} className="text-[11px] rounded-lg border border-border bg-card p-2">
                        <span className="font-semibold text-text">{c.trait}</span> <span className="text-text-secondary">— {c.claim}</span>
                        <span className="block text-[10px] text-navy/70 mt-0.5">{c.basis} · weight {c.weight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CalculationGate>
        </section>
      )}

      {report && !loading && report.generation_status !== "generated" && (
        <p className="text-sm text-text-secondary bg-ivory rounded-xl p-4">
          {report.generation_status === "no_readings" ? "Generate at least one reading first, then build the combined report." : "The report could not be written just now. Please try again in a minute."}
        </p>
      )}
    </div>
  );
}
