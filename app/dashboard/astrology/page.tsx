"use client";

import { useState } from "react";
import { Star, Sun, Moon, Compass, Clock, TrendingUp, Heart, Briefcase, Activity, Sparkles } from "lucide-react";
import { mockAstrologyResult } from "@/data/astrology";

const TABS = ["Overview", "Birth Chart", "Zodiac", "Planets", "Houses", "Nakshatra", "Dasha", "Horoscope", "Career", "Relationships", "General"];

export default function AstrologyPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [horoscopePeriod, setHoroscopePeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const d = mockAstrologyResult;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Sub-nav */}
      <div className="flex overflow-x-auto gap-1 mb-6 pb-2 border-b border-[#E8DFCF] scrollbar-hide">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg transition-all ${
              activeTab === tab ? "text-[#C6A15B] border-b-2 border-[#C6A15B] bg-white" : "text-[#77736B] hover:text-[#252525]"
            }`}>{tab}</button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Sun Sign", value: d.sunSign, icon: Sun },
              { label: "Moon Sign", value: d.moonSign, icon: Moon },
              { label: "Ascendant", value: d.ascendant, icon: Compass },
              { label: "Nakshatra", value: d.nakshatra.name, icon: Star },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl border border-[#E8DFCF] p-4 card-shadow">
                <item.icon className="w-5 h-5 text-[#C6A15B] mb-2" />
                <p className="text-xs text-[#77736B]">{item.label}</p>
                <p className="text-lg font-semibold text-[#C6A15B]">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-[#E8DFCF] p-5">
            <h3 className="font-semibold text-[#252525] mb-3">Key Highlights</h3>
            <div className="space-y-2">
              {d.generalInsights.map((g, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <Sparkles className="w-4 h-4 text-[#C6A15B] mt-0.5 flex-shrink-0" />
                  <div><span className="font-medium text-[#252525]">{g.title}:</span> <span className="text-[#77736B]">{g.description}</span></div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-[#77736B] text-center">This is a demo with sample astrology data. Validated calculations will be integrated later.</p>
        </div>
      )}

      {/* Birth Chart */}
      {activeTab === "Birth Chart" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 flex flex-col items-center">
            <h3 className="font-semibold text-[#252525] mb-1">Vedic Birth Chart (Kundli)</h3>
            <p className="text-xs text-[#77736B] mb-4">Sample Birth Chart — For Demonstration Only</p>
            <svg viewBox="0 0 400 400" className="w-full max-w-[400px] h-auto">
              {/* Outer square */}
              <rect x="10" y="10" width="380" height="380" fill="#171B2D" stroke="#C6A15B" strokeWidth="2" rx="4" />
              {/* Diamond lines */}
              <line x1="200" y1="10" x2="10" y2="200" stroke="#C6A15B" strokeWidth="1.5" />
              <line x1="200" y1="10" x2="390" y2="200" stroke="#C6A15B" strokeWidth="1.5" />
              <line x1="10" y1="200" x2="200" y2="390" stroke="#C6A15B" strokeWidth="1.5" />
              <line x1="390" y1="200" x2="200" y2="390" stroke="#C6A15B" strokeWidth="1.5" />
              {/* Cross lines */}
              <line x1="200" y1="10" x2="200" y2="390" stroke="#C6A15B" strokeWidth="1" opacity="0.5" />
              <line x1="10" y1="200" x2="390" y2="200" stroke="#C6A15B" strokeWidth="1" opacity="0.5" />
              {/* House labels */}
              {[
                { n: "1", x: 200, y: 115, planets: "Su" },
                { n: "2", x: 105, y: 65, planets: "Ju,Ke" },
                { n: "3", x: 55, y: 115, planets: "Sa(R)" },
                { n: "4", x: 55, y: 200, planets: "" },
                { n: "5", x: 55, y: 285, planets: "" },
                { n: "6", x: 105, y: 335, planets: "Ma" },
                { n: "7", x: 200, y: 285, planets: "" },
                { n: "8", x: 295, y: 335, planets: "Ra" },
                { n: "9", x: 345, y: 285, planets: "Mo" },
                { n: "10", x: 345, y: 200, planets: "" },
                { n: "11", x: 345, y: 115, planets: "Me" },
                { n: "12", x: 295, y: 65, planets: "Ve" },
              ].map((h) => (
                <g key={h.n}>
                  <text x={h.x} y={h.y} textAnchor="middle" fill="#C6A15B" fontSize="11" fontWeight="bold">{h.n}</text>
                  {h.planets && <text x={h.x} y={h.y + 16} textAnchor="middle" fill="white" fontSize="10">{h.planets}</text>}
                </g>
              ))}
              <text x="200" y="205" textAnchor="middle" fill="#C6A15B" fontSize="12" fontWeight="bold">Rashi</text>
            </svg>
            <div className="flex flex-wrap gap-2 mt-4 text-xs text-[#77736B]">
              {["Su=Sun", "Mo=Moon", "Ma=Mars", "Me=Mercury", "Ju=Jupiter", "Ve=Venus", "Sa=Saturn", "Ra=Rahu", "Ke=Ketu", "(R)=Retrograde"].map((l) => (
                <span key={l} className="px-2 py-0.5 bg-[#FAF7F0] rounded border border-[#E8DFCF]">{l}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Zodiac */}
      {activeTab === "Zodiac" && (
        <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#C6A15B]/10 flex items-center justify-center text-3xl">{d.zodiacSign.symbol}</div>
            <div>
              <h3 className="text-xl font-bold text-[#252525]">{d.zodiacSign.name}</h3>
              <p className="text-sm text-[#77736B]">{d.zodiacSign.dateRange}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 bg-[#FAF7F0] rounded-lg"><p className="text-xs text-[#77736B]">Element</p><p className="font-semibold text-[#C6A15B]">{d.zodiacSign.element}</p></div>
            <div className="p-3 bg-[#FAF7F0] rounded-lg"><p className="text-xs text-[#77736B]">Ruling Planet</p><p className="font-semibold text-[#C6A15B]">{d.zodiacSign.rulingPlanet}</p></div>
            <div className="p-3 bg-[#FAF7F0] rounded-lg"><p className="text-xs text-[#77736B]">Quality</p><p className="font-semibold text-[#C6A15B]">Fixed</p></div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {d.zodiacSign.traits.map((t) => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-[#C6A15B]/10 text-[#C6A15B] font-medium">{t}</span>
            ))}
          </div>
          <p className="text-sm text-[#77736B] leading-relaxed">
            Leo, the fifth sign of the zodiac, is ruled by the Sun, the center of our solar system. People born under this sign are natural leaders, exuding warmth, confidence, and creativity. They possess a magnetic personality that draws others to them, and they thrive in positions where they can inspire and guide others. With their fixed fire nature, Leos are determined and loyal, often going to great lengths for those they care about.
          </p>
        </div>
      )}

      {/* Planets */}
      {activeTab === "Planets" && (
        <div className="bg-white rounded-xl border border-[#E8DFCF] overflow-hidden">
          <div className="p-4 border-b border-[#E8DFCF]">
            <h3 className="font-semibold text-[#252525]">Planetary Positions</h3>
            <p className="text-xs text-[#77736B]">Position of planets at the time of birth</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#C6A15B]/10">
                <th className="text-left px-4 py-3 text-[#9E7938] font-semibold">Planet</th>
                <th className="text-left px-4 py-3 text-[#9E7938] font-semibold">Sign</th>
                <th className="text-left px-4 py-3 text-[#9E7938] font-semibold">House</th>
                <th className="text-left px-4 py-3 text-[#9E7938] font-semibold">Degree</th>
                <th className="text-left px-4 py-3 text-[#9E7938] font-semibold">Retrograde</th>
              </tr></thead>
              <tbody>
                {d.planetPositions.map((p, i) => (
                  <tr key={p.planet} className={i % 2 === 0 ? "bg-white" : "bg-[#FAF7F0]"}>
                    <td className="px-4 py-3 font-medium text-[#252525]">{p.planet}</td>
                    <td className="px-4 py-3 text-[#77736B]">{p.sign}</td>
                    <td className="px-4 py-3"><span className="text-[#C6A15B] font-semibold">{p.house}</span></td>
                    <td className="px-4 py-3 text-[#77736B]">{p.degree}</td>
                    <td className="px-4 py-3">{p.retrograde ?
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C45B5B]/10 text-[#C45B5B] font-semibold">R</span> :
                      <span className="text-[#77736B]">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Houses */}
      {activeTab === "Houses" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {d.houses.map((h) => (
            <div key={h.number} className="bg-white rounded-xl border border-[#E8DFCF] p-4 card-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#C6A15B]/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-[#C6A15B]">{h.number}</span>
                </div>
                <div><p className="font-semibold text-[#252525] text-sm">{h.sign}</p><p className="text-xs text-[#77736B]">{h.significance}</p></div>
              </div>
              {h.planets.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {h.planets.map((p) => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-[#C6A15B]/10 text-[#C6A15B] font-medium">{p}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Nakshatra */}
      {activeTab === "Nakshatra" && (
        <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-[#C6A15B]/10 flex items-center justify-center">
              <Star className="w-7 h-7 text-[#C6A15B]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#252525]">{d.nakshatra.name}</h3>
              <p className="text-sm text-[#77736B]">Birth Nakshatra (Lunar Mansion)</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 bg-[#FAF7F0] rounded-lg"><p className="text-xs text-[#77736B]">Lord</p><p className="font-semibold text-[#C6A15B]">{d.nakshatra.lord}</p></div>
            <div className="p-3 bg-[#FAF7F0] rounded-lg"><p className="text-xs text-[#77736B]">Pada</p><p className="font-semibold text-[#C6A15B]">{d.nakshatra.pada}</p></div>
            <div className="p-3 bg-[#FAF7F0] rounded-lg"><p className="text-xs text-[#77736B]">Deity</p><p className="font-semibold text-[#C6A15B]">{d.nakshatra.deity}</p></div>
          </div>
          <p className="text-sm text-[#77736B] leading-relaxed">{d.nakshatra.description}</p>
        </div>
      )}

      {/* Dasha */}
      {activeTab === "Dasha" && (
        <div className="max-w-2xl space-y-0">
          <h3 className="font-semibold text-[#252525] mb-4">Vimshottari Dasha Timeline</h3>
          <div className="relative pl-8 border-l-2 border-[#E8DFCF] space-y-4">
            {d.dashaOverview.map((dp) => (
              <div key={dp.planet} className="relative">
                <div className={`absolute -left-[25px] w-4 h-4 rounded-full border-2 ${dp.isActive ? "bg-[#C6A15B] border-[#C6A15B] animate-pulse-gold" : "bg-white border-[#E8DFCF]"}`} />
                <div className={`bg-white rounded-xl border p-4 card-shadow ${dp.isActive ? "border-[#C6A15B]" : "border-[#E8DFCF]"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-[#252525]">{dp.planet} Dasha</h4>
                    {dp.isActive && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C6A15B]/15 text-[#C6A15B] font-semibold">Active</span>}
                  </div>
                  <p className="text-xs text-[#77736B] mb-1">{dp.startDate} — {dp.endDate}</p>
                  <p className="text-sm text-[#77736B]">{dp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Horoscope */}
      {activeTab === "Horoscope" && (
        <div className="max-w-2xl space-y-4">
          <div className="flex gap-2 mb-4">
            {(["daily", "weekly", "monthly"] as const).map((p) => (
              <button key={p} onClick={() => setHoroscopePeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  horoscopePeriod === p ? "bg-[#C6A15B] text-white" : "bg-white border border-[#E8DFCF] text-[#77736B] hover:border-[#C6A15B]"
                }`}>{p}</button>
            ))}
          </div>
          {(() => {
            const h = d.horoscope[horoscopePeriod];
            return (
              <div className="bg-white rounded-xl border border-[#E8DFCF] p-6">
                <h3 className="font-semibold text-[#252525] mb-1 capitalize">{horoscopePeriod} Horoscope — {h.sign}</h3>
                <div className="flex gap-3 mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-[#C6A15B]/10 text-[#C6A15B]">Lucky #{h.luckyNumber}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#C6A15B]/10 text-[#C6A15B]">{h.luckyColor}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#C6A15B]/10 text-[#C6A15B]">{"★".repeat(h.rating)}{"☆".repeat(5 - h.rating)}</span>
                </div>
                <p className="text-sm text-[#77736B] leading-relaxed">{h.prediction}</p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Career */}
      {activeTab === "Career" && (
        <div className="max-w-2xl space-y-3">
          <h3 className="font-semibold text-[#252525] flex items-center gap-2"><Briefcase className="w-5 h-5 text-[#C6A15B]" /> Career Insights</h3>
          {d.careerInsights.map((c, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E8DFCF] p-4 border-l-4 border-l-[#C6A15B]">
              <h4 className="font-semibold text-[#252525] text-sm mb-1">{c.title}</h4>
              <p className="text-sm text-[#77736B]">{c.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Relationships */}
      {activeTab === "Relationships" && (
        <div className="max-w-2xl space-y-3">
          <h3 className="font-semibold text-[#252525] flex items-center gap-2"><Heart className="w-5 h-5 text-[#C6A15B]" /> Relationship Insights</h3>
          {d.relationshipInsights.map((r, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E8DFCF] p-4 border-l-4 border-l-[#C6A15B]">
              <h4 className="font-semibold text-[#252525] text-sm mb-1">{r.title}</h4>
              <p className="text-sm text-[#77736B]">{r.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* General */}
      {activeTab === "General" && (
        <div className="max-w-2xl space-y-3">
          <h3 className="font-semibold text-[#252525] flex items-center gap-2"><Activity className="w-5 h-5 text-[#C6A15B]" /> General Insights</h3>
          {d.generalInsights.map((g, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E8DFCF] p-4 border-l-4 border-l-[#C6A15B]">
              <h4 className="font-semibold text-[#252525] text-sm mb-1">{g.title}</h4>
              <p className="text-sm text-[#77736B]">{g.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
