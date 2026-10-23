"use client";

import Link from "next/link";
import { Star, Hash, Hand, FileBarChart, MessageCircle, Sparkles, ArrowRight, Sun, Compass, Crown } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function DashboardHome() {
  const { user, premium } = useApp();
  const firstName = user?.name?.split(" ")[0] || "User";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome Card */}
      <div className="navy-gradient rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 star-field opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#C6A15B]" />
            <span className="text-[#C6A15B] text-sm font-medium">{greeting}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {firstName}</h1>
          <p className="text-white/70 max-w-lg">Explore today&apos;s guidance through astrology, numerology, and palmistry.</p>
          <Link href="/dashboard/astrology"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg bg-[#C6A15B] text-white text-sm font-medium hover:bg-[#9E7938] transition-colors">
            Explore Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Today's Overview */}
      <div>
        <h2 className="text-lg font-semibold text-[#252525] mb-3">Today&apos;s Overview</h2>
        <p className="text-xs text-[#77736B] mb-3">Sample insights for demonstration</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#E8DFCF] p-5 card-shadow hover:card-shadow-hover transition-all">
            <div className="w-10 h-10 rounded-lg bg-[#C6A15B]/10 flex items-center justify-center mb-3">
              <Sun className="w-5 h-5 text-[#C6A15B]" />
            </div>
            <h3 className="font-semibold text-[#252525] text-sm mb-1">Astrological Insight</h3>
            <p className="text-xs text-[#77736B]">Venus is in a favorable position today, enhancing creativity and social connections.</p>
            <div className="mt-3 text-xs font-medium text-[#C6A15B]">Daily Theme: Reflection & Growth</div>
          </div>
          <div className="bg-white rounded-xl border border-[#E8DFCF] p-5 card-shadow hover:card-shadow-hover transition-all">
            <div className="w-10 h-10 rounded-lg bg-[#C6A15B]/10 flex items-center justify-center mb-3">
              <Hash className="w-5 h-5 text-[#C6A15B]" />
            </div>
            <h3 className="font-semibold text-[#252525] text-sm mb-1">Lucky Number</h3>
            <div className="text-3xl font-bold text-[#C6A15B] my-1">7</div>
            <p className="text-xs text-[#77736B]">Lucky Color: <span className="text-[#C6A15B] font-medium">Gold</span></p>
            <p className="text-xs text-[#77736B] mt-1">Take time to plan important decisions.</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E8DFCF] p-5 card-shadow hover:card-shadow-hover transition-all">
            <div className="w-10 h-10 rounded-lg bg-[#C6A15B]/10 flex items-center justify-center mb-3">
              <Compass className="w-5 h-5 text-[#C6A15B]" />
            </div>
            <h3 className="font-semibold text-[#252525] text-sm mb-1">Personal Guidance</h3>
            <p className="text-xs text-[#77736B]">Focus on building meaningful relationships today. Your intuition is especially strong.</p>
            <div className="mt-3 text-xs font-medium text-[#C6A15B]">Focus: Relationships & Creativity</div>
          </div>
        </div>
      </div>

      {/* Core Features */}
      <div>
        <h2 className="text-lg font-semibold text-[#252525] mb-3">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Star, title: "Vedic Astrology", href: "/dashboard/astrology", desc: "Birth charts, planetary positions, dashas, and horoscopes.", insight: "Your Sun in Leo brings natural leadership qualities. Venus Dasha period favors creative pursuits." },
            { icon: Hash, title: "Numerology", href: "/dashboard/numerology", desc: "Life path, destiny, soul urge, and personal year numbers.", insight: "Life Path 7 — The Seeker. Your analytical mind drives a deep quest for truth and wisdom." },
            { icon: Hand, title: "Palmistry", href: "/dashboard/palmistry", desc: "Palm line analysis, mounts, hand shape, and finger insights.", insight: "Your deep Heart Line suggests rich emotional depth and strong capacity for meaningful connections." },
          ].map((f) => (
            <Link key={f.href} href={f.href}
              className="bg-white rounded-xl border border-[#E8DFCF] p-5 card-shadow hover:card-shadow-hover hover:-translate-y-0.5 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-4 group-hover:bg-[#C6A15B]/20 transition-colors">
                <f.icon className="w-6 h-6 text-[#C6A15B]" />
              </div>
              <h3 className="font-semibold text-[#252525] mb-1">{f.title}</h3>
              <p className="text-xs text-[#77736B] mb-3">{f.desc}</p>
              <p className="text-xs text-[#252525] italic border-l-2 border-[#C6A15B] pl-3">&ldquo;{f.insight}&rdquo;</p>
              <div className="flex items-center gap-1 mt-4 text-sm font-medium text-[#C6A15B] group-hover:gap-2 transition-all">
                Explore <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Combined Report + Chatbot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/combined-report"
          className="bg-white rounded-xl border border-[#E8DFCF] p-5 card-shadow hover:card-shadow-hover transition-all group relative">
          {!premium.isActive && (
            <span className="absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded-full bg-[#C6A15B]/15 text-[#C6A15B] font-semibold flex items-center gap-1">
              <Crown className="w-3 h-3" /> PRO
            </span>
          )}
          <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-4">
            <FileBarChart className="w-6 h-6 text-[#C6A15B]" />
          </div>
          <h3 className="font-semibold text-[#252525] mb-1">Combined Report</h3>
          <p className="text-xs text-[#77736B] mb-3">Where all three systems converge — find agreements, complementary insights, and honest disagreements.</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {["Career", "Relationships", "Personal Growth", "Well-being"].map((c) => (
              <span key={c} className="text-[10px] px-2 py-1 rounded-full bg-[#FAF7F0] text-[#77736B] border border-[#E8DFCF]">{c}</span>
            ))}
          </div>
          <p className="text-xs text-[#252525] italic">&ldquo;All three systems emphasize patience, planning, and persistence in your career path.&rdquo;</p>
          <div className="flex items-center gap-1 mt-4 text-sm font-medium text-[#C6A15B]">
            View Full Report <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link href="/dashboard/chatbot"
          className="bg-white rounded-xl border border-[#E8DFCF] p-5 card-shadow hover:card-shadow-hover transition-all group relative">
          {!premium.isActive && (
            <span className="absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded-full bg-[#C6A15B]/15 text-[#C6A15B] font-semibold flex items-center gap-1">
              <Crown className="w-3 h-3" /> PRO
            </span>
          )}
          <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/10 flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-[#C6A15B]" />
          </div>
          <h3 className="font-semibold text-[#252525] mb-1">AI Cosmic Guide</h3>
          <p className="text-xs text-[#77736B] mb-3">Ask questions about your readings and get AI-powered guidance combining all three systems.</p>
          <div className="space-y-1.5 mb-3">
            {["What should I focus on this week?", "What do my numbers and birth chart suggest about my career?", "How do my three readings complement one another?"].map((q) => (
              <div key={q} className="text-[11px] px-3 py-1.5 rounded-lg bg-[#FAF7F0] text-[#77736B] border border-[#E8DFCF]">{q}</div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm font-medium text-[#C6A15B]">
            Start Chatting <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
