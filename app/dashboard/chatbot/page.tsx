"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Bot, Calculator, ChevronDown, GitCompareArrows, Lock, MessageCircle, Plus, Send, Sparkles, User,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { apiFetch, postJson } from "@/lib/api";
import { ContributionBar, MODULE_META } from "@/components/readings/ReadingUI";
import type { ChatAnswer, IntegrationStatus, ModuleKey, Relation } from "@/types/readings";

type Turn = { role: "user"; content: string } | { role: "assistant"; content: string; payload: ChatAnswer | null };
type SessionSummary = { session_id: number; title: string; created_at: string; messages: Array<{ role: string; content: string; payload: ChatAnswer | null }> };

const STARTERS = [
  "What does my career look like this year?",
  "What are my greatest strengths?",
  "What do my readings say about love and relationships?",
  "Where do my three readings agree, and where do they disagree?",
];

const RELATION_STYLE: Record<Relation, { label: string; className: string }> = {
  agreement: { label: "Agreement", className: "bg-success/10 text-success border-success/25" },
  partial_overlap: { label: "Partial overlap", className: "bg-gold/10 text-gold-dark border-gold/30" },
  difference: { label: "Different aspects", className: "bg-[#5B6CC6]/10 text-[#3F4FA3] border-[#5B6CC6]/25" },
  contradiction: { label: "Contradiction", className: "bg-error/10 text-error border-error/25" },
  single_source: { label: "Single source", className: "bg-border/60 text-text-secondary border-border" },
};

const MODULE_LINKS: Record<ModuleKey, string> = { numerology: "/dashboard/numerology", astrology: "/dashboard/astrology", palmistry: "/dashboard/palmistry" };

function AnswerCard({ payload, onAsk }: { payload: ChatAnswer; onAsk: (q: string) => void }) {
  const [showWorking, setShowWorking] = useState(false);
  const generated = payload.generation_status === "generated";
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {payload.answer.split(/\n\n+/).map((para, i) => <p key={i} className="text-[15px] leading-relaxed text-text">{para}</p>)}
      </div>

      {payload.key_points.length > 0 && (
        <ul className="space-y-1.5">
          {payload.key_points.map((k, i) => {
            const modules = Array.from(new Set(k.claim_ids.map((id) => payload.claims[id]?.module).filter(Boolean))) as ModuleKey[];
            return (
              <li key={i} className="flex gap-2 text-sm text-text">
                <Sparkles className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span className="flex-1">{k.text}</span>
                <span className="flex gap-1 shrink-0">{modules.map((m) => <span key={m} className="w-2 h-2 rounded-full mt-1.5" style={{ background: MODULE_META[m].color }} title={MODULE_META[m].label} />)}</span>
              </li>
            );
          })}
        </ul>
      )}

      {payload.cross_system.length > 0 && (
        <div className="rounded-xl border border-border bg-ivory/60 p-3.5 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-navy flex items-center gap-1.5"><GitCompareArrows className="w-3.5 h-3.5" />How the systems compare</p>
          {payload.cross_system.map((r, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2 sm:items-start">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 self-start ${RELATION_STYLE[r.relation].className}`}>{RELATION_STYLE[r.relation].label}</span>
              <p className="text-sm text-text-secondary">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {generated && (
        <div className="rounded-xl border border-border p-3.5 bg-card">
          <p className="text-xs font-bold uppercase tracking-wide text-text-secondary mb-2.5">Contribution to this answer</p>
          <ContributionBar contributions={payload.contributions} />
          {payload.module_insights.length > 0 && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
              {payload.module_insights.map((m) => {
                const Meta = MODULE_META[m.module];
                return (
                  <div key={m.module} className={`rounded-lg p-2.5 ${Meta.soft}`}>
                    <p className="text-[11px] font-bold flex items-center gap-1"><Meta.icon className="w-3.5 h-3.5" />{Meta.label}</p>
                    <p className="text-xs mt-1 text-text">{m.summary}</p>
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={() => setShowWorking(!showWorking)} className="mt-3 text-xs font-medium text-gold-dark hover:text-gold inline-flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5" />How was this calculated?<ChevronDown className={`w-3.5 h-3.5 transition-transform ${showWorking ? "rotate-180" : ""}`} />
          </button>
          {showWorking && (
            <div className="mt-2 space-y-3 animate-fade-in">
              <p className="text-xs text-text-secondary leading-relaxed">
                Your question was matched to the themes <strong>{payload.themes.length ? payload.themes.join(", ") : "general (all themes)"}</strong>. The most relevant claims from each of your saved readings were given to the model, which had to cite them. A system&apos;s share is the summed evidence weight of its cited claims divided by the total cited weight — so it reflects how much of the answer actually rests on that system, not how much text it produced.
              </p>
              {(["numerology", "astrology", "palmistry"] as ModuleKey[]).map((module) => {
                const cited = Object.entries(payload.claims).filter(([, c]) => c.module === module);
                if (!cited.length) return null;
                return (
                  <div key={module}>
                    <p className="text-[11px] font-bold mb-1" style={{ color: MODULE_META[module].color }}>{MODULE_META[module].label}</p>
                    <ul className="space-y-1">
                      {cited.map(([id, c]) => (
                        <li key={id} className="text-[11px] text-text-secondary rounded-md bg-ivory border border-border px-2 py-1.5">
                          <span className="font-semibold text-text">{c.trait}</span> — {c.claim} <span className="block text-[10px] mt-0.5 text-navy/70">Basis: {c.basis} · weight {c.weight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {payload.follow_up_questions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {payload.follow_up_questions.map((q) => (
            <button key={q} onClick={() => onAsk(q)} className="text-xs px-3 py-1.5 rounded-full border border-gold/40 text-gold-dark bg-gold/5 hover:bg-gold/15 text-left">{q}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatbotPage() {
  const { premium } = useApp();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!premium.isActive) return;
    apiFetch<IntegrationStatus>("/integration/status").then(setStatus).catch((e) => setError(e instanceof Error ? e.message : ""));
    apiFetch<SessionSummary[]>("/integration/chat/history").then(setSessions).catch(() => undefined);
  }, [premium.isActive]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [turns, sending]);

  function openSession(s: SessionSummary) {
    setSessionId(s.session_id);
    setTurns(s.messages.map((m) => m.role === "user" ? { role: "user", content: m.content } : { role: "assistant", content: m.content, payload: m.payload }));
  }

  function newChat() {
    setSessionId(null);
    setTurns([]);
  }

  async function ask(question: string) {
    const text = question.trim();
    if (!text || sending) return;
    setInput("");
    setError("");
    setTurns((t) => [...t, { role: "user", content: text }]);
    setSending(true);
    try {
      const answer = await postJson<ChatAnswer>("/integration/chat", { message: text, session_id: sessionId });
      setSessionId(answer.session_id);
      setTurns((t) => [...t, { role: "assistant", content: answer.answer, payload: answer }]);
      apiFetch<SessionSummary[]>("/integration/chat/history").then(setSessions).catch(() => undefined);
    } catch (err) {
      setTurns((t) => [...t, { role: "assistant", content: err instanceof Error ? err.message : "Something went wrong.", payload: null }]);
    } finally {
      setSending(false);
    }
  }

  if (!premium.isActive) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-card rounded-2xl border border-border p-8 text-center card-shadow">
          <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4"><Lock className="w-8 h-8 text-white" /></div>
          <h2 className="text-xl font-bold text-text mb-2">Unlock the AstroVerse Guide</h2>
          <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">Ask anything and get one answer drawn from your Numerology, Vedic Astrology and Palmistry readings, with a breakdown of how much each system contributed.</p>
          <p className="text-xs text-text-secondary mb-4">Use coupon <span className="font-mono font-bold text-gold">ASTROFREE</span> for free access</p>
          <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gold text-white font-medium hover:bg-gold-dark transition-colors">Unlock Premium <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    );
  }

  const missing = status ? (Object.keys(status) as ModuleKey[]).filter((m) => !status[m].available) : [];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5 h-[calc(100vh-8rem)]">
      <aside className="hidden lg:flex flex-col bg-card rounded-2xl border border-border p-3 card-shadow min-h-0">
        <button onClick={newChat} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl gold-gradient text-white text-sm font-semibold"><Plus className="w-4 h-4" />New conversation</button>
        <p className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold mt-4 mb-2 px-1">History</p>
        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {sessions.length === 0 && <p className="text-xs text-text-secondary px-1">No conversations yet.</p>}
          {sessions.map((s) => (
            <button key={s.session_id} onClick={() => openSession(s)} className={`w-full text-left text-xs px-2.5 py-2 rounded-lg truncate ${sessionId === s.session_id ? "bg-gold/10 text-gold-dark font-semibold" : "text-text-secondary hover:bg-ivory"}`}>
              <MessageCircle className="w-3.5 h-3.5 inline mr-1.5" />{s.title}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex flex-col bg-card rounded-2xl border border-border card-shadow min-h-0 overflow-hidden">
        <header className="px-5 py-3.5 border-b border-border flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl navy-gradient flex items-center justify-center"><Bot className="w-5 h-5 text-gold" /></div>
            <div><p className="font-bold text-text leading-tight">AstroVerse Guide</p><p className="text-[11px] text-text-secondary">Answers from your own three readings</p></div>
          </div>
          <div className="flex gap-1.5">
            {(Object.keys(MODULE_META) as ModuleKey[]).map((m) => {
              const ok = status?.[m]?.available;
              return <Link key={m} href={MODULE_LINKS[m]} className={`text-[11px] px-2.5 py-1 rounded-full border ${ok ? MODULE_META[m].soft + " border-transparent" : "border-dashed border-border text-text-secondary"}`}>{MODULE_META[m].label}{ok ? ` · ${status?.[m].claims}` : " · missing"}</Link>;
            })}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
          {error && <p className="text-xs text-error">{error}</p>}
          {turns.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mb-4 shadow-lg shadow-gold/30"><Sparkles className="w-8 h-8 text-white" /></div>
              <h2 className="text-xl font-bold text-text">Ask your three readings anything</h2>
              <p className="text-sm text-text-secondary mt-1 max-w-md">Every answer combines your Numerology, Vedic Astrology and Palmistry results, and shows how much each one contributed.</p>
              {missing.length > 0 && (
                <p className="mt-3 text-xs text-gold-dark bg-gold/10 rounded-lg px-3 py-2">Generate your {missing.map((m) => MODULE_META[m].label).join(" and ")} reading{missing.length > 1 ? "s" : ""} for a fuller answer.</p>
              )}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                {STARTERS.map((q) => <button key={q} onClick={() => ask(q)} className="text-sm text-left px-4 py-3 rounded-xl border border-border hover:border-gold/50 hover:bg-gold/5 text-text">{q}</button>)}
              </div>
            </div>
          )}
          {turns.map((turn, i) => turn.role === "user" ? (
            <div key={i} className="flex justify-end gap-2.5">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-navy text-white px-4 py-2.5 text-sm">{turn.content}</div>
              <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-gold-dark" /></div>
            </div>
          ) : (
            <div key={i} className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full navy-gradient flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-gold" /></div>
              <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm border border-border bg-gradient-to-br from-white to-ivory/60 p-4">
                {turn.payload ? <AnswerCard payload={turn.payload} onAsk={ask} /> : <p className="text-sm text-error">{turn.content}</p>}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex gap-2.5 items-center text-sm text-text-secondary">
              <div className="w-8 h-8 rounded-full navy-gradient flex items-center justify-center"><Bot className="w-4 h-4 text-gold" /></div>
              <span className="flex gap-1">{[0, 1, 2].map((d) => <span key={d} className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: `${d * 150}ms` }} />)}</span>
              Consulting your numbers, chart and palm…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={(e: FormEvent) => { e.preventDefault(); ask(input); }} className="p-3 border-t border-border flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={1000} placeholder="Ask about career, love, this year, your strengths…" className="flex-1 px-4 py-3 rounded-xl border border-border focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-sm" />
          <button type="submit" disabled={!input.trim() || sending} className="px-4 rounded-xl gold-gradient text-white disabled:opacity-50" aria-label="Send"><Send className="w-4 h-4" /></button>
        </form>
      </div>
    </div>
  );
}
