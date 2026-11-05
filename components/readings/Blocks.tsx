import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Lock, Minus, Plus } from "lucide-react";
import { Starfield } from "@/components/brand/Celestial";
import { ReadAloud } from "@/components/ui/ReadAloud";
import { buttonClass } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { CONFIDENCE_WORDS, generationMessage } from "@/lib/readings";
import { hasPlainVersion, plainClaim } from "@/lib/plain";
import { TONE, nextStep, type StepKey, type Tone } from "@/lib/journey";
import type { Prediction, ReadingSection } from "@/types/readings";

/** Section heading: a small label, a big serif title and an optional line under it. */
export function SectionTitle({ title, subtitle, id, eyebrow }: { title: string; subtitle?: ReactNode; id?: string; eyebrow?: string }) {
  return (
    <div className="flex flex-col gap-3 border-b border-ink/80 pb-5">
      {eyebrow && <p className="eyebrow text-ink-3">{eyebrow}</p>}
      <h2 id={id} className="text-4xl sm:text-5xl">{title}</h2>
      {subtitle && <p className="max-w-3xl text-lg text-ink-2">{subtitle}</p>}
    </div>
  );
}

/** The headline and summary as a large editorial pull-quote, with a Listen button. */
export function InShort({ headline, text, tone, label = "In short" }: { headline: string; text: string; tone: Tone; label?: string }) {
  return (
    <section className="grid gap-6 md:grid-cols-[10rem_1fr] md:gap-10">
      <div className="flex flex-row items-center justify-between gap-4 md:flex-col md:items-start md:justify-start">
        <p className={`eyebrow ${TONE[tone].text}`}>{label}</p>
        <ReadAloud text={`${headline}. ${text}`} label="Listen" />
      </div>
      <div className="flex flex-col gap-6">
        <h2 className="text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">{headline}</h2>
        {text && <p className="max-w-3xl text-xl leading-relaxed text-ink sm:text-2xl sm:leading-relaxed">{text}</p>}
      </div>
    </section>
  );
}

const LIST_STYLE = {
  good: { icon: Plus, color: "text-good" },
  care: { icon: Minus, color: "text-care" },
  other: { icon: BookOpen, color: "text-ink-3" },
} as const;

/** A list of short sentences under a hairline: your good side, things to watch out for, or other notes. */
export function PointList({ title, kind, items }: { title: string; kind: keyof typeof LIST_STYLE; items: string[] }) {
  if (!items.length) return null;
  const { icon: Icon, color } = LIST_STYLE[kind];
  return (
    <section className="flex flex-col">
      <div className="border-b border-ink/80 pb-3">
        <h3 className="text-3xl">{title}</h3>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item} className="flex gap-4 border-b border-line py-4 text-lg leading-relaxed">
            <Icon className={`mt-1.5 h-4 w-4 shrink-0 ${color}`} strokeWidth={2.2} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "What’s coming up": gentle pointers about the time ahead. */
export function PredictionList({ predictions, tone }: { predictions: Prediction[]; tone: Tone }) {
  if (!predictions.length) return null;
  return (
    <ol className="flex flex-col">
      {predictions.map((p, i) => {
        const sure = CONFIDENCE_WORDS[p.confidence] ?? CONFIDENCE_WORDS.low;
        return (
          <li key={i} className="grid gap-3 border-b border-line py-7 md:grid-cols-[14rem_1fr] md:gap-10">
            <div className="flex flex-col gap-2">
              <p className={`eyebrow capitalize ${TONE[tone].text}`}>{TOPIC_WORDS[p.area] ?? (p.area || "Life")}</p>
              {p.timing && <p className="font-display text-2xl leading-tight">{p.timing}</p>}
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xl leading-relaxed">{p.text}</p>
              <p className="text-base text-ink-2">
                <span className="eyebrow mr-2 text-ink">{sure.label}</span>
                {p.reasoning || sure.note}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Everyday names for the topics a reading can cover. */
const TOPIC_WORDS: Record<string, string> = {
  personality: "Who you are",
  career: "Work",
  relationships: "Love and people",
  love: "Love",
  health: "Health",
  wealth: "Money",
  finance: "Money",
  money: "Money",
  family: "Family",
  spirituality: "Inner life",
  education: "Learning",
  timing: "What’s coming up",
  strengths: "Your good side",
  challenges: "Watch out for",
  overview: "In short",
};

/** Reading sections (who you are, work, love…) as editorial columns. */
export function TopicCards({ sections, icons, tone }: { sections: ReadingSection[]; icons: Record<string, typeof BookOpen>; tone: Tone }) {
  if (!sections.length) return null;
  return (
    <div className="grid gap-x-12 md:grid-cols-2">
      {sections.map((s) => {
        const Icon = icons[s.key] ?? BookOpen;
        return (
          <article key={`${s.key}-${s.title}`} className="flex flex-col gap-3 border-b border-line py-8">
            <p className={`eyebrow flex items-center gap-2 capitalize ${TONE[tone].text}`}>
              <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              {TOPIC_WORDS[s.key] ?? (s.key ? s.key.replace(/_/g, " ") : "Reading")}
            </p>
            <h3 className="text-3xl">{s.title}</h3>
            <p className="text-lg leading-relaxed text-ink-2">{s.text}</p>
          </article>
        );
      })}
    </div>
  );
}

/** One line from the books, in plain words, with why it fits you and which book it comes from. */
export function SourceItem({ claim, source, reasons, extra }: { claim: string; source: string | null; reasons?: string[]; extra?: ReactNode }) {
  return (
    <li className="flex flex-col gap-2 border-b border-line py-5">
      <p className="font-display text-2xl leading-snug">{plainClaim(claim)}</p>
      {reasons && reasons.length > 0 && (
        <p className="text-base text-ink-2"><span className="eyebrow mr-2 text-ink">Why it fits you:</span>{reasons.join("; ")}</p>
      )}
      {hasPlainVersion(claim) && (
        <p className="text-base text-ink-3"><span className="eyebrow mr-2">The book says:</span>“{claim.trim()}”</p>
      )}
      {source && <p className="text-base text-ink-3"><span className="eyebrow mr-2">From:</span>{source}</p>}
      {extra}
    </li>
  );
}

export function GenerationNote({ status, onRetry }: { status: string | undefined; onRetry?: () => void }) {
  const message = generationMessage(status);
  if (!message) return null;
  return (
    <Notice
      tone={status === "generation_failed" ? "warning" : "info"}
      title={message.title}
      action={onRetry && status === "generation_failed" ? (
        <button type="button" onClick={onRetry} className={buttonClass("secondary", "md")}>Try the summary again</button>
      ) : undefined}
    >
      {message.text}
    </Notice>
  );
}

/** Plain-words reminder of what these readings are. */
export function GoodToKnow({ text }: { text?: string }) {
  return (
    <aside className="grid gap-2 border-t border-line pt-6 text-base text-ink-3 md:grid-cols-[10rem_1fr] md:gap-10">
      <p className="eyebrow">Good to know</p>
      <p>{text ?? "This reading comes from old traditions. Enjoy it and use it to think about your life. It is not science. It is not advice about health, money or the law."}</p>
    </aside>
  );
}

/** The next stop on the path, so every page ends with one clear thing to do. */
export function NextStepCard({ after, isPremium }: { after: StepKey; isPremium: boolean }) {
  const next = nextStep(after);
  if (!next) return null;
  const locked = next.premium && !isPremium;
  return (
    <section className="night no-print relative overflow-hidden rounded-[2rem]">
      <Starfield count={70} seed={13} className="absolute inset-0 h-full w-full opacity-70" />
      <div className="relative flex flex-col gap-8 p-6 sm:p-10 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <p className="eyebrow text-moon-2">Next step</p>
          <h2 className="text-5xl sm:text-6xl">{next.title}</h2>
          <p className="max-w-xl text-xl text-moon-2">{next.what}</p>
        </div>
        <Link href={locked ? "/premium" : next.href} className={buttonClass("light", "lg", "shrink-0")}>
          {locked && <Lock className="h-5 w-5" aria-hidden="true" />}
          <span>{locked ? "Unlock with a code" : `Go to ${next.short}`}</span>
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
