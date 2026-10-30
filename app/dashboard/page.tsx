"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Hash, Hand, FileBarChart, MessageCircle, Sparkles, ArrowRight, Compass, Crown, Clock, CheckCircle2, Circle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getLatest } from "@/lib/api";
import type { AstrologyReading, NumerologyReport, PalmReading } from "@/types/readings";

type Readings = { numerology: NumerologyReport | null; astrology: AstrologyReading | null; palmistry: PalmReading | null };

export default function DashboardHome() {
  const { user, premium } = useApp();
  const firstName = user?.name?.split(" ")[0] || "User";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const [readings, setReadings] = useState<Readings>({ numerology: null, astrology: null, palmistry: null });
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    Promise.all([
      getLatest<NumerologyReport>("/numerology/latest"),
      getLatest<AstrologyReading>("/astrology/latest"),
      getLatest<PalmReading>("/palmistry/latest"),
    ]).then(([numerology, astrology, palmistry]) => setReadings({ numerology, astrology, palmistry }))
      .catch(() => setOffline(true));
  }, []);

  const { numerology, astrology, palmistry } = readings;
  const done = [numerology, astrology, palmistry].filter(Boolean).length;
  const nextStep = !numerology ? "/dashboard/numerology" : !astrology ? "/dashboard/astrology" : !palmistry ? "/dashboard/palmistry" : "/dashboard/chatbot";
  const period = astrology?.chart.dasha.current_period;

  const features = [
    { icon: Hash, title: "Numerology", href: "/dashboard/numerology", desc: "Moolank, Bhagyank, Namank and Personal Year from the research guide.",
      insight: numerology ? numerology.synthesis?.headline || `Moolank ${numerology.components.moolank.number} · Bhagyank ${numerology.components.bhagyank.number}` : null },
    { icon: Star, title: "Vedic Astrology", href: "/dashboard/astrology", desc: "Sidereal birth chart, yogas, Vimshottari dashas and transits.",
      insight: astrology ? astrology.interpretation.headline || `${astrology.chart.lagna.sign} ascendant · Moon in ${astrology.chart.moon_sign}` : null },
    { icon: Hand, title: "Palmistry", href: "/dashboard/palmistry", desc: "Detected palm lines, mounts and hand shape, read through Cheiro.",
      insight: palmistry ? palmistry.interpretation.headline || `${palmistry.analysis.geometry.element} hand` : null },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome Card */}
      <div className="navy-gradient rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 star-field opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-gold" />
              <span className="text-gold text-sm font-medium">{greeting}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {firstName}</h1>
            <p className="text-white/70 max-w-lg">
              {done === 3 ? "All three readings are ready. Ask the Guide anything, or open your combined report." : `You have completed ${done} of 3 readings. Each one adds evidence to your combined guidance.`}
            </p>
            <Link href={nextStep} className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg bg-gold text-white text-sm font-medium hover:bg-gold-dark transition-colors">
              {done === 3 ? "Ask the Guide" : "Continue"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3">
            {([["Numerology", numerology], ["Astrology", astrology], ["Palmistry", palmistry]] as const).map(([label, value]) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-white/80">
                {value ? <CheckCircle2 className="w-4 h-4 text-gold" /> : <Circle className="w-4 h-4 text-white/40" />}{label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {offline && <p className="text-sm text-error bg-error/5 border border-error/20 rounded-xl p-3">The AstroVerse API is not reachable, so your saved readings cannot be shown. Start the backend on port 8000.</p>}

      {/* Snapshot from the user's own readings */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-3">Your snapshot</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5 card-shadow">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-3"><Hash className="w-5 h-5 text-gold" /></div>
            <h3 className="font-semibold text-text text-sm mb-1">Personal Year {numerology ? numerology.target_year : ""}</h3>
            {numerology ? (
              <>
                <div className="text-3xl font-bold text-gold my-1">{numerology.components.personal_year.number}</div>
                <p className="text-xs text-text-secondary">{numerology.synthesis?.year_focus?.text || numerology.interpretations.personal_year.map((r) => r.trait).join(", ")}</p>
              </>
            ) : <p className="text-xs text-text-secondary">Calculate your numbers to see the themes of your year. <Link href="/dashboard/numerology" className="text-gold-dark font-medium">Start →</Link></p>}
          </div>
          <div className="bg-card rounded-xl border border-border p-5 card-shadow">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-3"><Clock className="w-5 h-5 text-gold" /></div>
            <h3 className="font-semibold text-text text-sm mb-1">Running planetary period</h3>
            {period ? (
              <>
                <div className="text-xl font-bold text-text my-1">{period.mahadasha} – {period.antardasha}</div>
                <p className="text-xs text-text-secondary">Sub-period until {period.antardasha_end}; {period.mahadasha} Mahadasha until {period.mahadasha_end}.</p>
                {astrology?.chart.transits.sade_sati.active && <p className="text-xs text-error mt-1">Sade Sati is active ({astrology.chart.transits.sade_sati.phase}).</p>}
              </>
            ) : <p className="text-xs text-text-secondary">Cast your birth chart to see your Vimshottari period. <Link href="/dashboard/astrology" className="text-gold-dark font-medium">Start →</Link></p>}
          </div>
          <div className="bg-card rounded-xl border border-border p-5 card-shadow">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-3"><Compass className="w-5 h-5 text-gold" /></div>
            <h3 className="font-semibold text-text text-sm mb-1">Your hand</h3>
            {palmistry ? (
              <>
                <div className="text-xl font-bold text-text my-1 capitalize">{palmistry.analysis.geometry.element} hand</div>
                <p className="text-xs text-text-secondary">
                  Lines detected: {Object.values(palmistry.analysis.lines).filter((l) => l.detected).map((l) => l.name.replace(" line", "")).join(", ") || "none clearly"}.
                </p>
              </>
            ) : <p className="text-xs text-text-secondary">Upload a palm photo to have your lines detected and read. <Link href="/dashboard/palmistry" className="text-gold-dark font-medium">Start →</Link></p>}
          </div>
        </div>
      </div>

      {/* Core Features */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-3">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <Link key={f.href} href={f.href} className="bg-card rounded-xl border border-border p-5 card-shadow hover:card-shadow-hover hover:-translate-y-0.5 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors"><f.icon className="w-6 h-6 text-gold" /></div>
              <h3 className="font-semibold text-text mb-1">{f.title}</h3>
              <p className="text-xs text-text-secondary mb-3">{f.desc}</p>
              {f.insight ? <p className="text-xs text-text italic border-l-2 border-gold pl-3">&ldquo;{f.insight}&rdquo;</p>
                : <p className="text-xs text-text-secondary border-l-2 border-border pl-3">Not generated yet</p>}
              <div className="flex items-center gap-1 mt-4 text-sm font-medium text-gold group-hover:gap-2 transition-all">{f.insight ? "Open" : "Generate"} <ArrowRight className="w-4 h-4" /></div>
            </Link>
          ))}
        </div>
      </div>

      {/* Combined Report + Chatbot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/combined-report" className="bg-card rounded-xl border border-border p-5 card-shadow hover:card-shadow-hover transition-all group relative">
          {!premium.isActive && <span className="absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold font-semibold flex items-center gap-1"><Crown className="w-3 h-3" /> PRO</span>}
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4"><FileBarChart className="w-6 h-6 text-gold" /></div>
          <h3 className="font-semibold text-text mb-1">Combined Report</h3>
          <p className="text-xs text-text-secondary mb-3">Where all three systems converge — agreements, partial overlaps, differences and contradictions, theme by theme.</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {["Career", "Relationships", "Mind", "Vitality", "Timing"].map((c) => <span key={c} className="text-[10px] px-2 py-1 rounded-full bg-ivory text-text-secondary border border-border">{c}</span>)}
          </div>
          <p className="text-xs text-text-secondary">{done === 0 ? "Needs at least one reading." : `Built from ${done} of 3 readings.`}</p>
          <div className="flex items-center gap-1 mt-4 text-sm font-medium text-gold">View Full Report <ArrowRight className="w-4 h-4" /></div>
        </Link>

        <Link href="/dashboard/chatbot" className="bg-card rounded-xl border border-border p-5 card-shadow hover:card-shadow-hover transition-all group relative">
          {!premium.isActive && <span className="absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold font-semibold flex items-center gap-1"><Crown className="w-3 h-3" /> PRO</span>}
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4"><MessageCircle className="w-6 h-6 text-gold" /></div>
          <h3 className="font-semibold text-text mb-1">AstroVerse Guide</h3>
          <p className="text-xs text-text-secondary mb-3">Ask anything and get one answer from all three readings, with each system&apos;s contribution shown.</p>
          <div className="space-y-1.5 mb-3">
            {["What does my career look like this year?", "Where do my three readings agree?", "What are my greatest strengths?"].map((q) => (
              <div key={q} className="text-[11px] px-3 py-1.5 rounded-lg bg-ivory text-text-secondary border border-border">{q}</div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm font-medium text-gold">Start Chatting <ArrowRight className="w-4 h-4" /></div>
        </Link>
      </div>
    </div>
  );
}
