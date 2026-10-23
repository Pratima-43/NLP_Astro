"use client";

import { useState } from "react";
import { Hash, Star, Heart, Brain, User, Calendar, Sparkles, TrendingUp, Users, ArrowRight } from "lucide-react";
import { mockNumerologyResult } from "@/data/numerology";

const TABS = ["Overview", "Life Path", "Destiny", "Soul Urge", "Personality", "Birthday", "Personal Year", "Name Analysis", "Compatibility", "Lucky Numbers", "Full Report"];

function NumberCircle({ value, size = "lg" }: { value: number; size?: "sm" | "lg" }) {
  return (
    <div className={`rounded-full bg-gradient-to-br from-[#C6A15B] to-[#9E7938] flex items-center justify-center text-white font-bold ${
      size === "lg" ? "w-24 h-24 text-4xl" : "w-14 h-14 text-xl"
    }`}>{value}</div>
  );
}

function NumberDetailView({ num }: { num: typeof mockNumerologyResult.lifePathNumber }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-6">
        <NumberCircle value={num.value} />
        <div>
          <h3 className="text-2xl font-bold text-[#252525]">{num.meaning}</h3>
          <p className="text-sm text-[#77736B]">{num.type} Number</p>
        </div>
      </div>
      <p className="text-sm text-[#77736B] leading-relaxed">{num.description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#4A7C59]/5 rounded-xl p-4 border border-[#4A7C59]/20">
          <h4 className="font-semibold text-[#4A7C59] text-sm mb-2">Strengths</h4>
          <ul className="space-y-1">{num.strengths.map((s) => (
            <li key={s} className="text-sm text-[#77736B] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59]" />{s}</li>
          ))}</ul>
        </div>
        <div className="bg-[#C6A15B]/5 rounded-xl p-4 border border-[#C6A15B]/20">
          <h4 className="font-semibold text-[#9E7938] text-sm mb-2">Challenges</h4>
          <ul className="space-y-1">{num.challenges.map((c) => (
            <li key={c} className="text-sm text-[#77736B] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B]" />{c}</li>
          ))}</ul>
        </div>
      </div>
      {num.careerThemes && num.careerThemes.length > 0 && (
        <div>
          <h4 className="font-semibold text-[#252525] text-sm mb-2">Career Themes</h4>
          <div className="flex flex-wrap gap-2">{num.careerThemes.map((t) => (
            <span key={t} className="text-xs px-3 py-1 rounded-full bg-[#C6A15B]/10 text-[#C6A15B] font-medium">{t}</span>
          ))}</div>
        </div>
      )}
    </div>
  );
}

export default function NumerologyPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [nameInput, setNameInput] = useState("Pratima");
  const d = mockNumerologyResult;

  const calcNameValue = (name: string) => {
    const map: Record<string, number> = {};
    "abcdefghijklmnopqrstuvwxyz".split("").forEach((c, i) => { map[c] = (i % 9) + 1; });
    let sum = name.toLowerCase().split("").reduce((acc, c) => acc + (map[c] || 0), 0);
    while (sum > 9 && sum !== 11 && sum !== 22) sum = sum.toString().split("").reduce((a, b) => a + parseInt(b), 0);
    return sum;
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex overflow-x-auto gap-1 mb-6 pb-2 border-b border-[#E8DFCF]">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
              activeTab === tab ? "text-[#C6A15B] border-b-2 border-[#C6A15B] bg-white" : "text-[#77736B] hover:text-[#252525]"
            }`}>{tab}</button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 flex items-center gap-6">
            <NumberCircle value={d.lifePathNumber.value} />
            <div>
              <p className="text-xs text-[#77736B]">Your Life Path Number</p>
              <h3 className="text-xl font-bold text-[#252525]">{d.lifePathNumber.meaning}</h3>
              <p className="text-sm text-[#77736B] mt-1 max-w-md">{d.lifePathNumber.description.slice(0, 150)}...</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[d.lifePathNumber, d.destinyNumber, d.soulUrgeNumber, d.personalityNumber, d.birthdayNumber, d.personalYearNumber].map((n) => (
              <button key={n.type} onClick={() => setActiveTab(n.type === "Life Path" ? "Life Path" : n.type === "Destiny" ? "Destiny" : n.type === "Soul Urge" ? "Soul Urge" : n.type === "Personality" ? "Personality" : n.type === "Birthday" ? "Birthday" : "Personal Year")}
                className="bg-white rounded-xl border border-[#E8DFCF] p-4 card-shadow hover:card-shadow-hover hover:border-[#C6A15B] transition-all text-center">
                <div className="text-3xl font-bold text-[#C6A15B] mb-1">{n.value}</div>
                <p className="text-xs font-medium text-[#252525]">{n.type}</p>
                <p className="text-[10px] text-[#77736B] mt-0.5">{n.meaning}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-[#77736B] text-center">Sample numerology data for demonstration purposes.</p>
        </div>
      )}

      {activeTab === "Life Path" && <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 max-w-2xl"><NumberDetailView num={d.lifePathNumber} /></div>}
      {activeTab === "Destiny" && <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 max-w-2xl"><NumberDetailView num={d.destinyNumber} /></div>}
      {activeTab === "Soul Urge" && <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 max-w-2xl"><NumberDetailView num={d.soulUrgeNumber} /></div>}
      {activeTab === "Personality" && <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 max-w-2xl"><NumberDetailView num={d.personalityNumber} /></div>}
      {activeTab === "Birthday" && <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 max-w-2xl"><NumberDetailView num={d.birthdayNumber} /></div>}
      {activeTab === "Personal Year" && <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 max-w-2xl"><NumberDetailView num={d.personalYearNumber} /></div>}

      {activeTab === "Name Analysis" && (
        <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 max-w-2xl space-y-4">
          <h3 className="text-lg font-semibold text-[#252525]">Name Numerology</h3>
          <div>
            <label className="block text-sm font-medium text-[#252525] mb-1">Enter a name</label>
            <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#E8DFCF] focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 outline-none text-[#252525]"
              placeholder="Type a name..." />
          </div>
          {nameInput && (
            <>
              <div className="flex items-center gap-4">
                <NumberCircle value={calcNameValue(nameInput)} size="sm" />
                <div>
                  <p className="text-sm text-[#77736B]">Name Value for &ldquo;{nameInput}&rdquo;</p>
                  <p className="font-semibold text-[#252525]">Number {calcNameValue(nameInput)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 p-3 bg-[#FAF7F0] rounded-lg">
                {nameInput.toUpperCase().split("").map((c, i) => {
                  const map: Record<string, number> = {};
                  "abcdefghijklmnopqrstuvwxyz".split("").forEach((ch, idx) => { map[ch] = (idx % 9) + 1; });
                  const val = map[c.toLowerCase()] || 0;
                  return (
                    <div key={i} className="flex flex-col items-center w-8">
                      <span className="text-sm font-bold text-[#252525]">{c}</span>
                      <span className="text-xs text-[#C6A15B]">{val || ""}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-[#77736B]">{d.nameNumerology.interpretation}</p>
              {/* Future: validated calculation from Harshita's team will replace this simple method */}
            </>
          )}
        </div>
      )}

      {activeTab === "Compatibility" && (
        <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 max-w-2xl space-y-4">
          <h3 className="text-lg font-semibold text-[#252525] flex items-center gap-2"><Users className="w-5 h-5 text-[#C6A15B]" /> Compatibility</h3>
          <p className="text-sm text-[#77736B]">{d.compatibility.description}</p>
          <div>
            <h4 className="text-sm font-medium text-[#4A7C59] mb-2">Compatible Numbers</h4>
            <div className="flex gap-2">{d.compatibility.compatibleNumbers.map((n) => (
              <div key={n} className="w-12 h-12 rounded-full bg-[#4A7C59]/10 flex items-center justify-center text-[#4A7C59] font-bold text-lg">{n}</div>
            ))}</div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#C6A15B] mb-2">Challenging Numbers</h4>
            <div className="flex gap-2">{d.compatibility.challengingNumbers.map((n) => (
              <div key={n} className="w-12 h-12 rounded-full bg-[#C6A15B]/10 flex items-center justify-center text-[#C6A15B] font-bold text-lg">{n}</div>
            ))}</div>
          </div>
        </div>
      )}

      {activeTab === "Lucky Numbers" && (
        <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-[#252525] mb-4">Your Lucky Numbers</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {d.luckyNumbers.map((n) => (
              <div key={n} className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center text-white text-2xl font-bold shadow-lg">{n}</div>
            ))}
          </div>
          <p className="text-sm text-[#77736B] mt-4 text-center">These numbers resonate with your Life Path Number 7 and carry positive energy for important decisions.</p>
        </div>
      )}

      {activeTab === "Full Report" && (
        <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-[#252525] mb-3">Complete Numerology Report</h3>
          <p className="text-sm text-[#77736B] leading-relaxed whitespace-pre-line">{d.generalReport}</p>
        </div>
      )}
    </div>
  );
}
