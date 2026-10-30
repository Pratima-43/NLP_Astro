"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AlertCircle, BookOpen, Calculator, ChevronDown, Clock, Eye, FileDown, Hash, Hand, Quote, ShieldCheck, Sparkles, Star, Target,
} from "lucide-react";
import type { Confidence, Contribution, EvidenceItem, ModuleKey, Prediction } from "@/types/readings";

export const MODULE_META: Record<ModuleKey, { label: string; color: string; soft: string; icon: typeof Star }> = {
  numerology: { label: "Numerology", color: "#C6A15B", soft: "bg-[#C6A15B]/10 text-[#9E7938]", icon: Hash },
  astrology: { label: "Vedic Astrology", color: "#5B6CC6", soft: "bg-[#5B6CC6]/10 text-[#3F4FA3]", icon: Star },
  palmistry: { label: "Palmistry", color: "#4A9C7A", soft: "bg-[#4A9C7A]/10 text-[#2F7458]", icon: Hand },
};

export function PageHero({ icon: Icon, eyebrow, title, subtitle, children }: {
  icon: typeof Star; eyebrow: string; title: string; subtitle: string; children?: ReactNode;
}) {
  return (
    <div className="navy-gradient rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 star-field opacity-60" />
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shrink-0 shadow-lg shadow-black/20">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-gold text-xs font-semibold uppercase tracking-[0.18em] mb-1">{eyebrow}</p>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{title}</h1>
            <p className="text-white/70 text-sm mt-1.5 max-w-2xl">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex gap-2 rounded-xl border border-error/30 bg-error/5 p-3.5 text-sm text-[#9B3636]">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

/** Rotating progress messages; real work happens server-side so this only reassures. */
export function LoadingStages({ stages }: { stages: string[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => Math.min(i + 1, stages.length - 1)), 2600);
    return () => clearInterval(id);
  }, [stages.length]);
  return (
    <div className="bg-card rounded-2xl border border-border p-8 flex flex-col items-center text-center card-shadow">
      <div className="relative w-16 h-16 mb-5">
        <div className="absolute inset-0 rounded-full border-2 border-gold/20" />
        <div className="absolute inset-0 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-gold animate-pulse" />
      </div>
      <p className="font-semibold text-text">{stages[index]}</p>
      <div className="flex gap-1.5 mt-4">
        {stages.map((_, i) => (
          <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= index ? "w-6 bg-gold" : "w-1.5 bg-border"}`} />
        ))}
      </div>
      <p className="text-xs text-text-secondary mt-4 max-w-sm">The first reading for a new combination can take up to a minute while the language model writes it; later readings are cached.</p>
    </div>
  );
}

export function SectionTitle({ icon: Icon, title, subtitle, action }: { icon?: typeof Star; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-text flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-gold" />}{title}
        </h2>
        {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const CONFIDENCE_STYLE: Record<Confidence, string> = {
  high: "bg-success/10 text-success border-success/20",
  medium: "bg-gold/10 text-gold-dark border-gold/25",
  low: "bg-text-secondary/10 text-text-secondary border-text-secondary/20",
};

export function ConfidenceBadge({ level }: { level: Confidence }) {
  const dots = level === "high" ? 3 : level === "medium" ? 2 : 1;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${CONFIDENCE_STYLE[level]}`}>
      <span className="flex gap-0.5">{[0, 1, 2].map((i) => <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < dots ? "bg-current" : "bg-current/25"}`} />)}</span>
      {level} confidence
    </span>
  );
}

export function PredictionCard({ prediction, evidence }: { prediction: Prediction; evidence?: Record<string, EvidenceItem> }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="bg-card rounded-xl border border-border p-5 card-shadow hover:card-shadow-hover transition-all flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gold-dark flex items-center gap-1.5"><Target className="w-3.5 h-3.5" />{prediction.area}</span>
        <ConfidenceBadge level={prediction.confidence} />
      </div>
      <p className="text-[15px] leading-relaxed text-text font-medium">{prediction.text}</p>
      {prediction.timing && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-navy bg-navy/5 rounded-lg px-2.5 py-1.5 self-start"><Clock className="w-3.5 h-3.5" />{prediction.timing}</p>
      )}
      <button onClick={() => setOpen(!open)} className="mt-4 pt-3 border-t border-border/70 text-xs font-medium text-gold-dark flex items-center gap-1 hover:text-gold self-start">
        Why this prediction? <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 space-y-2 animate-fade-in">
          <p className="text-sm text-text-secondary leading-relaxed">{prediction.reasoning}</p>
          {evidence && <EvidenceChips ids={prediction.evidence_ids} evidence={evidence} />}
        </div>
      )}
    </article>
  );
}

export function EvidenceChips({ ids, evidence }: { ids: string[]; evidence: Record<string, EvidenceItem> }) {
  // Several claims can share one chart/palm factor; show each factor once.
  const bases = Array.from(new Map(ids.filter((id) => evidence[id]).map((id) => [evidence[id].basis, evidence[id]])).values());
  return (
    <div className="flex flex-wrap gap-1.5">
      {bases.map((item) => (
        <span key={item.basis} title={item.claim} className="text-[11px] px-2 py-1 rounded-md bg-ivory border border-border text-text-secondary">
          {item.basis}
        </span>
      ))}
    </div>
  );
}

/** The detailed calculation is opt-in: readers first agree that it shows raw working. */
export function CalculationGate({ title = "Detailed calculation", description, children }: { title?: string; description: string; children: ReactNode }) {
  const [agreed, setAgreed] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-2xl border border-navy/15 bg-gradient-to-br from-white to-ivory overflow-hidden">
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy text-gold flex items-center justify-center shrink-0"><Calculator className="w-5 h-5" /></div>
          <div>
            <h2 className="font-bold text-text">{title}</h2>
            <p className="text-sm text-text-secondary mt-0.5 max-w-2xl">{description}</p>
          </div>
        </div>
        {!open && (
          <div className="flex flex-col gap-2 sm:items-end shrink-0">
            <label className="flex items-start gap-2 text-xs text-text-secondary cursor-pointer max-w-xs">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-[#C6A15B]" />
              I understand this shows the raw measurements, rules and source records behind my reading, and that these are traditional interpretations, not scientific findings.
            </label>
            <button disabled={!agreed} onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-navy-light transition-colors">
              <Eye className="w-4 h-4" /> Show the calculation
            </button>
          </div>
        )}
        {open && (
          <button onClick={() => setOpen(false)} className="text-sm text-gold-dark font-medium hover:text-gold">Hide</button>
        )}
      </div>
      {open && <div className="border-t border-border p-5 sm:p-6 space-y-6 animate-fade-in">{children}</div>}
    </section>
  );
}

const POLARITY_DOT: Record<string, string> = { positive: "bg-success", challenge: "bg-error", negative: "bg-error", neutral: "bg-gold" };

export function EvidenceTable({ evidence }: { evidence: EvidenceItem[] }) {
  return (
    <div className="space-y-2">
      {evidence.map((item) => (
        <div key={item.evidence_id} className="rounded-xl border border-border bg-card p-3.5">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-navy/5 text-navy">{item.evidence_id}</span>
            <span className={`w-2 h-2 rounded-full ${POLARITY_DOT[String(item.polarity)] ?? "bg-gold"}`} />
            <span className="text-sm font-semibold text-text">{item.trait}</span>
            <span className="text-[11px] text-text-secondary">· weight {item.weight}</span>
          </div>
          <p className="text-xs text-navy/80 mb-1"><span className="font-semibold">Triggered by:</span> {item.basis}</p>
          <p className="text-sm text-text-secondary">{item.claim}</p>
          {item.source_wording && (
            <blockquote className="mt-2 text-xs italic text-text-secondary border-l-2 border-gold/50 pl-2.5 flex gap-1.5">
              <Quote className="w-3 h-3 shrink-0 mt-0.5 text-gold" />“{item.source_wording}”
            </blockquote>
          )}
          <p className="mt-1.5 text-[11px] text-text-secondary/80 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {item.source_url ? <a href={item.source_url} target="_blank" rel="noreferrer" className="underline decoration-dotted hover:text-gold">{item.source_name}</a> : item.source_name}
            <span>· {item.verification_status.replaceAll("_", " ")}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

export function ContributionBar({ contributions, compact = false }: { contributions: Contribution[]; compact?: boolean }) {
  const total = contributions.reduce((sum, c) => sum + c.percent, 0);
  return (
    <div className="space-y-2">
      <div className={`flex w-full overflow-hidden rounded-full bg-border/60 ${compact ? "h-2" : "h-3"}`}>
        {total > 0 && contributions.filter((c) => c.percent > 0).map((c) => (
          <div key={c.module} style={{ width: `${c.percent}%`, background: MODULE_META[c.module].color }} className="h-full transition-all duration-700" title={`${MODULE_META[c.module].label}: ${c.percent}%`} />
        ))}
      </div>
      {!compact && (
        <div className="grid grid-cols-3 gap-2">
          {contributions.map((c) => {
            const Meta = MODULE_META[c.module];
            return (
              <div key={c.module} className="text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-text"><span className="w-2.5 h-2.5 rounded-full" style={{ background: Meta.color }} />{Meta.label}</div>
                <div className="text-lg font-bold" style={{ color: Meta.color }}>{c.percent}%</div>
                <div className="text-text-secondary">{c.cited_claims} of {c.available_claims} claims cited</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Disclaimer({ text }: { text: string }) {
  return (
    <p className="text-xs leading-relaxed text-text-secondary bg-ivory border border-border rounded-xl p-4 flex gap-2">
      <ShieldCheck className="w-4 h-4 shrink-0 text-gold" />{text}
    </p>
  );
}

export function ReadingSections({ sections, evidence, icons }: {
  sections: { key: string; title: string; text: string; evidence_ids: string[] }[];
  evidence: Record<string, EvidenceItem>;
  icons: Record<string, typeof Star>;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sections.map((section) => {
        const Icon = icons[section.key] ?? Sparkles;
        return (
          <article key={section.key + section.title} className="bg-card rounded-xl border border-border p-5 card-shadow">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center"><Icon className="w-4.5 h-4.5 text-gold" /></div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold">{section.key}</p>
                <h3 className="font-semibold text-text leading-tight">{section.title}</h3>
              </div>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{section.text}</p>
            <div className="mt-3"><EvidenceChips ids={section.evidence_ids.slice(0, 4)} evidence={evidence} /></div>
          </article>
        );
      })}
    </div>
  );
}

/** Opens the browser's print dialog; the print stylesheet strips navigation and forms so "Save as PDF" yields a clean report. */
export function PrintButton({ label = "Save as PDF", tone = "light" }: { label?: string; tone?: "light" | "dark" }) {
  return (
    <button type="button" onClick={() => window.print()}
      className={`no-print shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tone === "dark" ? "bg-white/10 text-white border border-white/20 hover:bg-white/20" : "bg-card border border-gold/40 text-gold-dark hover:bg-gold/10"}`}>
      <FileDown className="w-4 h-4" />{label}
    </button>
  );
}
