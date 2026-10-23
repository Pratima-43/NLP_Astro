"use client";

import { useState } from "react";
import Link from "next/link";
import { FileBarChart, Star, Hash, Hand, Check, AlertTriangle, Sparkles, Download, Lock, Crown, ArrowRight, Heart, Briefcase, Compass, TrendingUp } from "lucide-react";
import { mockCombinedReport } from "@/data/combinedReport";
import { useApp } from "@/context/AppContext";

const SECTIONS = ["Overview", "Profile", "Astrology", "Numerology", "Palmistry", "Agreements", "Complementary", "Conflicts", "Career", "Relationships", "Growth", "Guidance", "Summary"];

const SOURCE_COLORS: Record<string, string> = {
  astrology: "bg-purple-100 text-purple-700",
  numerology: "bg-blue-100 text-blue-700",
  palmistry: "bg-green-100 text-green-700",
};

function SourceBadge({ source }: { source: string }) {
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${SOURCE_COLORS[source] || "bg-gray-100 text-gray-600"}`}>{source}</span>;
}

export default function CombinedReportPage() {
  const { premium } = useApp();
  const [activeSection, setActiveSection] = useState("Overview");
  const d = mockCombinedReport;

  const handleDownload = () => {
    const lines = [
      "═══════════════════════════════════════════",
      "     AstroVerse — Combined Report",
      "     Generated: " + new Date().toLocaleDateString(),
      "═══════════════════════════════════════════",
      "", "OVERVIEW", "─".repeat(40), d.overview,
      "", "PROFILE SUMMARY", "─".repeat(40), d.profileSummary,
      "", "ASTROLOGY FINDINGS", "─".repeat(40), ...d.astrologyFindings.map((f) => "• " + f),
      "", "NUMEROLOGY FINDINGS", "─".repeat(40), ...d.numerologyFindings.map((f) => "• " + f),
      "", "PALMISTRY FINDINGS", "─".repeat(40), ...d.palmistryFindings.map((f) => "• " + f),
      "", "CROSS-SYSTEM AGREEMENTS", "─".repeat(40), ...d.agreements.map((a) => `\n[${a.sources.join(", ")}] ${a.title}\n${a.content}`),
      "", "COMPLEMENTARY FINDINGS", "─".repeat(40), ...d.complementary.map((c) => `\n[${c.sources.join(", ")}] ${c.title}\n${c.content}`),
      "", "CONFLICTING FINDINGS", "─".repeat(40), ...d.conflicts.map((c) => `\n[${c.sources.join(", ")}] ${c.title}\n${c.content}`),
      "", "CAREER OVERVIEW", "─".repeat(40), d.careerOverview.content,
      "", "RELATIONSHIPS", "─".repeat(40), d.relationshipOverview.content,
      "", "PERSONAL GROWTH", "─".repeat(40), d.personalGrowth.content,
      "", "GENERAL GUIDANCE", "─".repeat(40), d.generalGuidance.content,
      "", "SUMMARY", "─".repeat(40), d.summary,
      "", "═══════════════════════════════════════════",
      "  This is a sample report from AstroVerse",
      "  © 2024 AstroVerse. All rights reserved.",
      "═══════════════════════════════════════════",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "AstroVerse_Combined_Report.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  // Premium gate
  if (!premium.isActive) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="relative">
          {/* Lock overlay */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="bg-white rounded-2xl border border-[#E8DFCF] p-8 shadow-xl max-w-md text-center">
              <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#252525] mb-2">Unlock Your Complete Combined Report</h2>
              <p className="text-sm text-[#77736B] mb-4">See where Astrology, Numerology, and Palmistry converge. Discover agreements, complementary insights, and honest disagreements across all three systems.</p>
              <p className="text-2xl font-bold text-[#C6A15B] mb-1">$99 / year</p>
              <p className="text-xs text-[#77736B] mb-4">Use coupon <span className="font-mono font-bold text-[#C6A15B]">ASTROFREE</span> for free access</p>
              <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C6A15B] text-white font-medium hover:bg-[#9E7938] transition-colors">
                Unlock Premium <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          {/* Blurred preview */}
          <div className="filter blur-sm pointer-events-none opacity-60">
            <div className="space-y-4 p-4">
              <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 h-40" />
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-[#E8DFCF] p-4 h-24" />
                <div className="bg-white rounded-xl border border-[#E8DFCF] p-4 h-24" />
                <div className="bg-white rounded-xl border border-[#E8DFCF] p-4 h-24" />
              </div>
              <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 h-60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Section Nav */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="lg:sticky lg:top-24">
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0">
              {SECTIONS.map((s) => (
                <button key={s} onClick={() => setActiveSection(s)}
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all text-left ${
                    activeSection === s ? "bg-[#C6A15B]/10 text-[#C6A15B]" : "text-[#77736B] hover:text-[#252525] hover:bg-white"
                  }`}>{s}</button>
              ))}
            </div>
            <button onClick={handleDownload}
              className="hidden lg:flex items-center gap-2 w-full mt-4 px-4 py-2.5 rounded-lg bg-[#C6A15B] text-white text-sm font-medium hover:bg-[#9E7938] transition-colors">
              <Download className="w-4 h-4" /> Download Report
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {activeSection === "Overview" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[#E8DFCF] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FileBarChart className="w-6 h-6 text-[#C6A15B]" />
                  <h2 className="text-xl font-bold text-[#252525]">Combined Report</h2>
                </div>
                <div className="flex gap-2 mb-4">
                  <SourceBadge source="astrology" />
                  <SourceBadge source="numerology" />
                  <SourceBadge source="palmistry" />
                </div>
                <p className="text-sm text-[#77736B] leading-relaxed">{d.overview}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-[#E8DFCF] p-4 text-center">
                  <Check className="w-5 h-5 text-[#4A7C59] mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#C6A15B]">{d.agreements.length}</p>
                  <p className="text-xs text-[#77736B]">Agreements</p>
                </div>
                <div className="bg-white rounded-xl border border-[#E8DFCF] p-4 text-center">
                  <Sparkles className="w-5 h-5 text-[#C6A15B] mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#C6A15B]">{d.complementary.length}</p>
                  <p className="text-xs text-[#77736B]">Complementary</p>
                </div>
                <div className="bg-white rounded-xl border border-[#E8DFCF] p-4 text-center">
                  <AlertTriangle className="w-5 h-5 text-[#D4A843] mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#C6A15B]">{d.conflicts.length}</p>
                  <p className="text-xs text-[#77736B]">Conflicts</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "Profile" && (
            <div className="bg-white rounded-xl border border-[#E8DFCF] p-6">
              <h3 className="font-semibold text-[#252525] mb-3">Profile Summary</h3>
              <p className="text-sm text-[#77736B] leading-relaxed">{d.profileSummary}</p>
            </div>
          )}

          {["Astrology", "Numerology", "Palmistry"].map((system) => {
            if (activeSection !== system) return null;
            const findings = system === "Astrology" ? d.astrologyFindings : system === "Numerology" ? d.numerologyFindings : d.palmistryFindings;
            const icon = system === "Astrology" ? Star : system === "Numerology" ? Hash : Hand;
            const Icon = icon;
            return (
              <div key={system} className="bg-white rounded-xl border border-[#E8DFCF] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-5 h-5 text-[#C6A15B]" />
                  <h3 className="font-semibold text-[#252525]">{system} Findings</h3>
                  <SourceBadge source={system.toLowerCase()} />
                </div>
                <ul className="space-y-2">
                  {findings.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#77736B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B] mt-2 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {activeSection === "Agreements" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#252525] flex items-center gap-2"><Check className="w-5 h-5 text-[#4A7C59]" /> Cross-System Agreements</h3>
              {d.agreements.map((a, i) => (
                <div key={i} className="bg-white rounded-xl border border-[#E8DFCF] p-5 border-l-4 border-l-[#4A7C59]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#4A7C59]/10 text-[#4A7C59] font-medium">Agreement</span>
                    {a.sources.map((s) => <SourceBadge key={s} source={s} />)}
                  </div>
                  <h4 className="font-semibold text-[#C6A15B] mb-1">{a.title}</h4>
                  <p className="text-sm text-[#77736B]">{a.content}</p>
                </div>
              ))}
            </div>
          )}

          {activeSection === "Complementary" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#252525] flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#C6A15B]" /> Complementary Findings</h3>
              {d.complementary.map((c, i) => (
                <div key={i} className="bg-white rounded-xl border border-[#E8DFCF] p-5 border-l-4 border-l-[#C6A15B]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#C6A15B]/10 text-[#C6A15B] font-medium">Complementary</span>
                    {c.sources.map((s) => <SourceBadge key={s} source={s} />)}
                  </div>
                  <h4 className="font-semibold text-[#C6A15B] mb-1">{c.title}</h4>
                  <p className="text-sm text-[#77736B]">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {activeSection === "Conflicts" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#252525] flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-[#D4A843]" /> Conflicting Findings</h3>
              <p className="text-xs text-[#77736B]">Disagreements between systems are natural and informative. They highlight areas of nuance in your profile.</p>
              {d.conflicts.map((c, i) => (
                <div key={i} className="bg-white rounded-xl border border-[#E8DFCF] p-5 border-l-4 border-l-[#D4A843]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4A843]/10 text-[#D4A843] font-medium">Conflicting</span>
                    {c.sources.map((s) => <SourceBadge key={s} source={s} />)}
                  </div>
                  <h4 className="font-semibold text-[#D4A843] mb-1">{c.title}</h4>
                  <p className="text-sm text-[#77736B]">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {(["Career", "Relationships", "Growth", "Guidance"] as const).map((section) => {
            if (activeSection !== section) return null;
            const data = section === "Career" ? d.careerOverview : section === "Relationships" ? d.relationshipOverview : section === "Growth" ? d.personalGrowth : d.generalGuidance;
            const Icon = section === "Career" ? Briefcase : section === "Relationships" ? Heart : section === "Growth" ? TrendingUp : Compass;
            return (
              <div key={section} className="bg-white rounded-xl border border-[#E8DFCF] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5 text-[#C6A15B]" />
                  <h3 className="font-semibold text-[#252525]">{data.title}</h3>
                </div>
                <div className="flex gap-2 mb-3">
                  {data.sources.map((s) => <SourceBadge key={s} source={s} />)}
                </div>
                <p className="text-sm text-[#77736B] leading-relaxed">{data.content}</p>
              </div>
            );
          })}

          {activeSection === "Summary" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-[#E8DFCF] p-6">
                <h3 className="font-semibold text-[#252525] mb-3">Report Summary</h3>
                <p className="text-sm text-[#77736B] leading-relaxed">{d.summary}</p>
              </div>
              <button onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C6A15B] text-white font-medium hover:bg-[#9E7938] transition-colors">
                <Download className="w-4 h-4" /> Download Full Report (.txt)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
