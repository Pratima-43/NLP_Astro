"use client";

import { useState, useRef } from "react";
import { Hand, Heart, Brain, Activity, TrendingUp, Upload, Eye, Sparkles, Briefcase, User, X, Compass } from "lucide-react";
import { mockPalmistryResult } from "@/data/palmistry";
import { useApp } from "@/context/AppContext";

const TABS = ["Overview", "Palm Upload", "Heart Line", "Head Line", "Life Line", "Fate Line", "Mounts", "Hand Shape", "Fingers", "Career", "Personal", "Full Report"];

function LineDetail({ line }: { line: typeof mockPalmistryResult.heartLine }) {
  return (
    <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 max-w-2xl space-y-4">
      <h3 className="text-lg font-semibold text-[#252525]">{line.name}</h3>
      <p className="text-sm text-[#77736B]">{line.description}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-[#FAF7F0] rounded-lg"><p className="text-xs text-[#77736B]">Length</p><p className="font-semibold text-[#C6A15B]">{line.length}</p></div>
        <div className="p-3 bg-[#FAF7F0] rounded-lg"><p className="text-xs text-[#77736B]">Depth</p><p className="font-semibold text-[#C6A15B]">{line.depth}</p></div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-[#252525] mb-2">Characteristics</h4>
        <div className="flex flex-wrap gap-1.5">{line.characteristics.map((c) => (
          <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-[#C6A15B]/10 text-[#C6A15B]">{c}</span>
        ))}</div>
      </div>
      <div className="border-l-3 border-[#C6A15B] pl-4">
        <h4 className="text-sm font-medium text-[#252525] mb-1">Interpretation</h4>
        <p className="text-sm text-[#77736B] leading-relaxed">{line.interpretation}</p>
      </div>
    </div>
  );
}

export default function PalmistryPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const { palmImageUrl, setPalmImageUrl } = useApp();
  const [dominantHand, setDominantHand] = useState<"left" | "right">("right");
  const fileRef = useRef<HTMLInputElement>(null);
  const d = mockPalmistryResult;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPalmImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
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
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: d.heartLine.name, char: d.heartLine.length + ", " + d.heartLine.depth, icon: Heart },
              { name: d.headLine.name, char: d.headLine.length + ", " + d.headLine.depth, icon: Brain },
              { name: d.lifeLine.name, char: d.lifeLine.length + ", " + d.lifeLine.depth, icon: Activity },
              { name: d.fateLine.name, char: d.fateLine.length + ", " + d.fateLine.depth, icon: TrendingUp },
            ].map((l) => (
              <div key={l.name} className="bg-white rounded-xl border border-[#E8DFCF] p-4 card-shadow">
                <l.icon className="w-5 h-5 text-[#C6A15B] mb-2" />
                <p className="font-semibold text-[#252525] text-sm">{l.name}</p>
                <p className="text-xs text-[#C6A15B]">{l.char}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-[#E8DFCF] p-4">
            <div className="flex items-center gap-3 mb-2">
              <Hand className="w-5 h-5 text-[#C6A15B]" />
              <h3 className="font-semibold text-[#252525]">Hand Shape: {d.handShape.type}</h3>
            </div>
            <p className="text-sm text-[#77736B]">{d.handShape.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {d.handShape.traits.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[#C6A15B]/10 text-[#C6A15B]">{t}</span>
              ))}
            </div>
          </div>
          <p className="text-xs text-[#77736B] text-center">Demo palmistry analysis using sample data.</p>
        </div>
      )}

      {activeTab === "Palm Upload" && (
        <div className="max-w-3xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload Area */}
            <div>
              <h3 className="font-semibold text-[#252525] mb-3">Your Palm Image</h3>
              {palmImageUrl ? (
                <div className="relative">
                  <img src={palmImageUrl} alt="Palm" className="w-full h-64 object-cover rounded-xl border border-[#E8DFCF]" />
                  <button onClick={() => setPalmImageUrl(null)}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50">
                    <X className="w-4 h-4 text-[#C45B5B]" />
                  </button>
                  <button onClick={() => fileRef.current?.click()}
                    className="mt-2 w-full py-2 text-sm font-medium text-[#C6A15B] border border-[#C6A15B] rounded-lg hover:bg-[#C6A15B]/5 transition-colors">
                    Replace Image
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#E8DFCF] rounded-xl cursor-pointer hover:border-[#C6A15B] hover:bg-[#C6A15B]/5 transition-all">
                  <Upload className="w-10 h-10 text-[#C6A15B] mb-2" />
                  <span className="text-sm font-medium text-[#252525]">Upload palm image</span>
                  <span className="text-xs text-[#77736B]">Click or drag and drop</span>
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" ref={fileRef} />
                </label>
              )}
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" ref={fileRef} />
              <div className="mt-3">
                <p className="text-sm font-medium text-[#252525] mb-2">Dominant Hand</p>
                <div className="flex gap-2">
                  {(["left", "right"] as const).map((h) => (
                    <button key={h} onClick={() => setDominantHand(h)}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                        dominantHand === h ? "border-[#C6A15B] bg-[#C6A15B]/10 text-[#C6A15B]" : "border-[#E8DFCF] text-[#77736B]"
                      }`}>{h}</button>
                  ))}
                </div>
              </div>
            </div>
            {/* Sample Annotated Palm */}
            <div>
              <h3 className="font-semibold text-[#252525] mb-3">Sample Palm Lines Diagram</h3>
              <div className="bg-white rounded-xl border border-[#E8DFCF] p-4">
                <svg viewBox="0 0 300 400" className="w-full max-w-[300px] mx-auto">
                  {/* Hand outline */}
                  <path d="M100,380 Q60,300 50,220 Q40,160 70,120 Q80,100 85,70 Q90,40 100,30 Q110,20 115,50 L120,100 Q125,80 130,50 Q135,20 145,15 Q155,10 158,45 L160,100 Q165,70 170,40 Q175,15 185,12 Q195,10 198,40 L200,100 Q205,75 210,55 Q215,35 225,35 Q235,35 235,60 L230,100 Q240,110 250,160 Q260,220 240,300 Q230,340 200,380 Z" fill="#FAF7F0" stroke="#E8DFCF" strokeWidth="2" />
                  {/* Heart Line (red) */}
                  <path d="M70,200 Q120,180 160,185 Q200,190 240,175" fill="none" stroke="#E74C3C" strokeWidth="2.5" strokeLinecap="round" />
                  <text x="245" y="175" fill="#E74C3C" fontSize="10" fontWeight="bold">Heart</text>
                  {/* Head Line (blue) */}
                  <path d="M75,230 Q120,225 160,230 Q200,235 220,220" fill="none" stroke="#3498DB" strokeWidth="2.5" strokeLinecap="round" />
                  <text x="225" y="222" fill="#3498DB" fontSize="10" fontWeight="bold">Head</text>
                  {/* Life Line (green) */}
                  <path d="M110,140 Q90,200 80,260 Q70,320 90,360" fill="none" stroke="#2ECC71" strokeWidth="2.5" strokeLinecap="round" />
                  <text x="45" y="265" fill="#2ECC71" fontSize="10" fontWeight="bold">Life</text>
                  {/* Fate Line (purple) */}
                  <path d="M155,350 Q155,300 158,250 Q160,200 155,160" fill="none" stroke="#9B59B6" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 3" />
                  <text x="162" y="260" fill="#9B59B6" fontSize="10" fontWeight="bold">Fate</text>
                  {/* Mount labels */}
                  <text x="100" y="130" fill="#C6A15B" fontSize="8" textAnchor="middle">Jupiter</text>
                  <text x="145" y="125" fill="#C6A15B" fontSize="8" textAnchor="middle">Saturn</text>
                  <text x="185" y="125" fill="#C6A15B" fontSize="8" textAnchor="middle">Apollo</text>
                  <text x="222" y="130" fill="#C6A15B" fontSize="8" textAnchor="middle">Mercury</text>
                  <text x="90" y="310" fill="#C6A15B" fontSize="8" textAnchor="middle">Venus</text>
                  <text x="210" y="310" fill="#C6A15B" fontSize="8" textAnchor="middle">Moon</text>
                </svg>
                <p className="text-[10px] text-[#77736B] text-center mt-2">Sample schematic — not derived from uploaded image</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-[#77736B] bg-[#FAF7F0] p-3 rounded-lg">In the future, AI analysis will detect palm lines automatically. Currently, this is a demonstration with sample data.</p>
        </div>
      )}

      {activeTab === "Heart Line" && <LineDetail line={d.heartLine} />}
      {activeTab === "Head Line" && <LineDetail line={d.headLine} />}
      {activeTab === "Life Line" && <LineDetail line={d.lifeLine} />}
      {activeTab === "Fate Line" && <LineDetail line={d.fateLine} />}

      {activeTab === "Mounts" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {d.mounts.map((m) => (
            <div key={m.name} className="bg-white rounded-xl border border-[#E8DFCF] p-4 card-shadow">
              <h4 className="font-semibold text-[#C6A15B] mb-1">{m.name}</h4>
              <p className="text-xs text-[#77736B] mb-2">Location: {m.location}</p>
              <p className="text-xs text-[#252525] font-medium mb-1">{m.significance}</p>
              <p className="text-sm text-[#77736B]">{m.reading}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Hand Shape" && (
        <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-[#C6A15B]/10 flex items-center justify-center">
              <Hand className="w-7 h-7 text-[#C6A15B]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#252525]">{d.handShape.type}</h3>
              <p className="text-sm text-[#77736B]">Element: {d.handShape.element}</p>
            </div>
          </div>
          <p className="text-sm text-[#77736B] mb-3">{d.handShape.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {d.handShape.traits.map((t) => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-[#C6A15B]/10 text-[#C6A15B]">{t}</span>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Fingers" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          {d.fingerAnalysis.map((f) => (
            <div key={f.finger} className="bg-white rounded-xl border border-[#E8DFCF] p-4 card-shadow">
              <h4 className="font-semibold text-[#252525] mb-1">{f.finger} Finger</h4>
              <p className="text-xs text-[#C6A15B] font-medium mb-2">{f.trait}</p>
              <p className="text-sm text-[#77736B]">{f.reading}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Career" && (
        <div className="max-w-2xl space-y-3">
          <h3 className="font-semibold text-[#252525] flex items-center gap-2"><Briefcase className="w-5 h-5 text-[#C6A15B]" /> Career Tendencies</h3>
          {d.careerTendencies.map((c, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E8DFCF] p-4 border-l-4 border-l-[#C6A15B]">
              <p className="text-sm text-[#77736B]">{c}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Personal" && (
        <div className="max-w-2xl space-y-3">
          <h3 className="font-semibold text-[#252525] flex items-center gap-2"><User className="w-5 h-5 text-[#C6A15B]" /> Personal Tendencies</h3>
          {d.personalTendencies.map((p, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E8DFCF] p-4 border-l-4 border-l-[#C6A15B]">
              <p className="text-sm text-[#77736B]">{p}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Full Report" && (
        <div className="bg-white rounded-xl border border-[#E8DFCF] p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-[#252525] mb-3">Complete Palmistry Report</h3>
          <p className="text-sm text-[#77736B] leading-relaxed whitespace-pre-line">{d.generalReport}</p>
        </div>
      )}
    </div>
  );
}
