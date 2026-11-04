"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { BookOpen, MessageCircle, Plus, SendHorizontal } from "lucide-react";
import { PremiumGate } from "@/components/premium/Unlock";
import { useAuth, useUser } from "@/components/providers/AuthProvider";
import { ReadingHeader } from "@/components/readings/ReadingHeader";
import { ShareBar } from "@/components/readings/ShareBar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { IconBadge } from "@/components/ui/IconBadge";
import { Notice } from "@/components/ui/Notice";
import { ReadAloud } from "@/components/ui/ReadAloud";
import { apiFetch, postJson } from "@/lib/api";
import { firstName, formatDate } from "@/lib/format";
import { JOURNEY, step as stepOf } from "@/lib/journey";
import { RELATION_WORDS } from "@/lib/readings";
import type { ChatAnswer, IntegrationStatus } from "@/types/readings";

const STEP = stepOf("ask");
const SUGGESTIONS = [
  "What is my nature like?",
  "What does this year hold for me?",
  "What about my work and career?",
  "What about love and relationships?",
  "What are my biggest strengths?",
  "Where do my three readings agree?",
];

/** The server's technical message when the AI is switched off, in plain words. */
function friendly(content: string, payload: ChatAnswer | null): string {
  return payload?.generation_status === "llm_not_configured"
    ? "The AI guide is switched off on this site right now, so I can’t write an answer. Your three readings are all still there for you to read."
    : content;
}

type Turn = { role: "user"; content: string } | { role: "assistant"; content: string; payload: ChatAnswer | null };
type Conversation = {
  session_id: number;
  title: string;
  created_at: string;
  messages: Array<{ role: string; content: string; payload: ChatAnswer | null }>;
};

export function AskView() {
  const { isPremium } = useAuth();
  return (
    <div className="flex flex-col gap-8">
      <ReadingHeader step={STEP}>
        {isPremium && (
          <ButtonLink href="/story" variant="secondary" icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}>See my full story</ButtonLink>
        )}
      </ReadingHeader>
      <PremiumGate title="Ask a Question">{isPremium && <Chat />}</PremiumGate>
    </div>
  );
}

function Chat() {
  const user = useUser();
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let alive = true;
    apiFetch<IntegrationStatus>("/integration/status").then((s) => {
      if (alive) setStatus(s);
    }).catch(() => undefined);
    apiFetch<Conversation[]>("/integration/chat/history").then((h) => {
      if (alive) setConversations(h);
    }).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (turns.length) end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, sending]);

  const hasReadings = status ? Object.values(status).some((m) => m.available) : true;

  async function ask(text: string) {
    const clean = text.trim();
    if (!clean || sending) return;
    setQuestion("");
    setTurns((t) => [...t, { role: "user", content: clean }]);
    setSending(true);
    try {
      const answer = await postJson<ChatAnswer>("/integration/chat", { message: clean, session_id: sessionId });
      setSessionId(answer.session_id);
      setTurns((t) => [...t, { role: "assistant", content: friendly(answer.answer, answer), payload: answer }]);
      apiFetch<Conversation[]>("/integration/chat/history").then(setConversations).catch(() => undefined);
    } catch (e) {
      setTurns((t) => [...t, { role: "assistant", content: e instanceof Error ? e.message : "Something went wrong. Please try again.", payload: null }]);
    } finally {
      setSending(false);
      box.current?.focus();
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void ask(question);
    }
  }

  function open(conversation: Conversation) {
    setSessionId(conversation.session_id);
    setTurns(conversation.messages.map((m) => (m.role === "user"
      ? { role: "user" as const, content: m.content }
      : { role: "assistant" as const, content: friendly(m.content, m.payload), payload: m.payload })));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startOver() {
    setSessionId(null);
    setTurns([]);
    box.current?.focus();
  }

  return (
    <div className="flex flex-col gap-6">
      {!hasReadings && (
        <Notice tone="warning" title="Make a reading first" action={
          <div className="flex flex-wrap gap-2">
            {JOURNEY.filter((s) => s.module).map((s) => <ButtonLink key={s.key} href={s.href} variant="secondary">{s.title}</ButtonLink>)}
          </div>
        }>
          I answer only from your own readings, and you don’t have any yet.
        </Notice>
      )}

      <section aria-label="Conversation" className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-4 sm:p-6" aria-live="polite">
        {turns.length === 0 ? (
          <div className="flex flex-col gap-5">
            <div className="flex gap-3">
              <IconBadge icon={MessageCircle} tone="ask" size="sm" />
              <div className="flex flex-col gap-2 rounded-3xl rounded-tl-md bg-ask-soft p-5">
                <p className="text-xl font-semibold">Hi {firstName(user.name)}! What would you like to know?</p>
                <p className="text-lg">Ask in your own words. I answer only from your readings, and I show which reading each part comes from.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-lg font-semibold">Not sure what to ask? Try one:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => void ask(s)} disabled={sending || !hasReadings}
                    className="min-h-12 rounded-full border-2 border-line-2 bg-surface px-4 text-left text-base font-semibold hover:border-ink disabled:opacity-50">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          turns.map((turn, i) => turn.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-tr-md bg-ink px-5 py-3 text-lg text-white">{turn.content}</p>
            </div>
          ) : (
            <Answer key={i} content={turn.content} payload={turn.payload} onAsk={(q) => void ask(q)} disabled={sending} />
          ))
        )}
        {sending && (
          <div className="flex items-center gap-3" role="status">
            <IconBadge icon={MessageCircle} tone="ask" size="sm" />
            <span className="flex items-center gap-2 rounded-3xl bg-ask-soft px-5 py-3 text-lg">
              Thinking
              <span className="pulse-dot h-2 w-2 rounded-full bg-ask" />
              <span className="pulse-dot h-2 w-2 rounded-full bg-ask [animation-delay:0.2s]" />
              <span className="pulse-dot h-2 w-2 rounded-full bg-ask [animation-delay:0.4s]" />
            </span>
          </div>
        )}
        <div ref={end} />
      </section>

      <form onSubmit={submit} className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 flex flex-col gap-2 rounded-3xl border border-line bg-surface p-3 shadow-lg md:bottom-4">
        <label htmlFor="question" className="px-2 text-base font-semibold text-ink-2">Type your question</label>
        <div className="flex items-end gap-2">
          <textarea
            id="question"
            ref={box}
            rows={2}
            maxLength={1000}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="e.g. What does my palm say about my career?"
            className="min-h-14 flex-1 resize-none rounded-2xl border-2 border-line-2 bg-surface px-4 py-3 text-lg text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none"
          />
          <Button type="submit" size="lg" disabled={!question.trim() || sending} icon={<SendHorizontal className="h-5 w-5" aria-hidden="true" />}>
            Ask
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-3">
        {turns.length > 0 && <Button variant="secondary" onClick={startOver} icon={<Plus className="h-5 w-5" aria-hidden="true" />}>Start a new conversation</Button>}
      </div>

      {conversations.length > 0 && (
        <details className="rounded-2xl border border-line bg-surface">
          <summary className="flex min-h-16 items-center px-5 text-lg font-semibold">Earlier conversations ({conversations.length})</summary>
          <ul className="flex flex-col gap-2 border-t border-line p-4">
            {conversations.map((c) => (
              <li key={c.session_id}>
                <button type="button" onClick={() => open(c)}
                  className={`flex min-h-14 w-full flex-col items-start rounded-xl px-4 py-2 text-left hover:bg-paper ${c.session_id === sessionId ? "bg-ask-soft" : ""}`}>
                  <span className="text-lg font-semibold">{c.title}</span>
                  <span className="text-base text-ink-2">{formatDate(c.created_at)} · {Math.ceil(c.messages.length / 2)} question{c.messages.length > 2 ? "s" : ""}</span>
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="text-base text-ink-2">
        Answers are traditional interpretations for reflection, not advice. Want everything in one place? <Link href="/story" className="font-semibold text-ink underline">Read your full story</Link>.
      </p>
    </div>
  );
}

function Answer({ content, payload, onAsk, disabled }: { content: string; payload: ChatAnswer | null; onAsk: (q: string) => void; disabled: boolean }) {
  const paragraphs = content.split(/\n{2,}/).filter((p) => p.trim());
  return (
    <div className="flex gap-3">
      <IconBadge icon={MessageCircle} tone="ask" size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-3xl rounded-tl-md bg-ask-soft p-5">
        {paragraphs.map((p, i) => <p key={i} className="text-lg leading-relaxed">{p}</p>)}
        <ReadAloud text={content} className="self-start" />
        {payload && payload.key_points.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold text-ask-ink">Main points</p>
            <ul className="flex flex-col gap-2">
              {payload.key_points.map((k, i) => <li key={i} className="text-lg">• {k.text}</li>)}
            </ul>
          </div>
        )}
        {payload && payload.cross_system.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold text-ask-ink">How your readings compare</p>
            <ul className="flex flex-col gap-2">
              {payload.cross_system.map((r, i) => {
                const relation = RELATION_WORDS[r.relation] ?? RELATION_WORDS.difference;
                return (
                  <li key={i} className="flex flex-col gap-1 rounded-2xl bg-surface p-3 sm:flex-row sm:items-start sm:gap-3">
                    <span className={`shrink-0 self-start rounded-full px-3 py-0.5 text-base font-semibold ${relation.tone}`}>{relation.label}</span>
                    <span className="text-lg">{r.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {payload && <div className="rounded-2xl bg-surface p-4"><ShareBar contributions={payload.contributions} label="Where this answer came from" /></div>}
        {payload && payload.follow_up_questions.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold text-ask-ink">You could ask next</p>
            <div className="flex flex-wrap gap-2">
              {payload.follow_up_questions.map((q) => (
                <button key={q} type="button" disabled={disabled} onClick={() => onAsk(q)}
                  className="min-h-12 rounded-full border-2 border-ask/30 bg-surface px-4 text-left text-base font-semibold hover:border-ask disabled:opacity-50">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
