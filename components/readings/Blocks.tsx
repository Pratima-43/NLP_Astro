import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, CircleCheck, Clock, Info, Lock, Quote, Sparkles, TriangleAlert } from "lucide-react";
import { ReadAloud } from "@/components/ui/ReadAloud";
import { buttonClass } from "@/components/ui/Button";
import { IconBadge } from "@/components/ui/IconBadge";
import { Notice } from "@/components/ui/Notice";
import { CONFIDENCE_WORDS, generationMessage } from "@/lib/readings";
import { TONE, nextStep, type StepKey, type Tone } from "@/lib/journey";
import type { Prediction, ReadingSection } from "@/types/readings";

export function SectionTitle({ title, subtitle, id }: { title: string; subtitle?: ReactNode; id?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 id={id} className="text-2xl font-semibold sm:text-3xl">{title}</h2>
      {subtitle && <p className="text-lg text-ink-2">{subtitle}</p>}
    </div>
  );
}

/** The headline and short summary, in large type, with a Listen button. */
export function InShort({ headline, text, tone, label = "In short" }: { headline: string; text: string; tone: Tone; label?: string }) {
  return (
    <section className={`flex flex-col gap-4 rounded-3xl p-6 sm:p-8 ${TONE[tone].soft}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={`flex items-center gap-2 text-lg font-semibold ${TONE[tone].ink}`}>
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          {label}
        </p>
        <ReadAloud text={`${headline}. ${text}`} label="Listen to this" />
      </div>
      <h2 className="text-2xl font-semibold text-ink sm:text-3xl">{headline}</h2>
      {text && <p className="text-xl leading-relaxed text-ink">{text}</p>}
    </section>
  );
}

const LIST_STYLE = {
  good: { icon: CircleCheck, color: "text-good", soft: "bg-good-soft" },
  care: { icon: TriangleAlert, color: "text-care", soft: "bg-care-soft" },
  other: { icon: Info, color: "text-ink-2", soft: "bg-paper" },
} as const;

/** A titled list of short sentences: good things, things to watch, or other notes. */
export function PointList({ title, kind, items }: { title: string; kind: keyof typeof LIST_STYLE; items: string[] }) {
  if (!items.length) return null;
  const { icon: Icon, color, soft } = LIST_STYLE[kind];
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-6">
      <h3 className="flex items-center gap-3 text-xl font-semibold">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${soft} ${color}`} aria-hidden="true">
          <Icon className="h-6 w-6" />
        </span>
        {title}
      </h3>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-lg leading-relaxed">
            <Icon className={`mt-1 h-5 w-5 shrink-0 ${color}`} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "What’s ahead": cautious traditional predictions, with timing and how sure. */
export function PredictionList({ predictions, tone }: { predictions: Prediction[]; tone: Tone }) {
  if (!predictions.length) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {predictions.map((p, i) => {
        const sure = CONFIDENCE_WORDS[p.confidence] ?? CONFIDENCE_WORDS.low;
        return (
          <article key={i} className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-base font-semibold ${TONE[tone].soft} ${TONE[tone].ink}`}>{p.area || "Life"}</span>
              {p.timing && (
                <span className="flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-base font-semibold text-ink">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {p.timing}
                </span>
              )}
            </div>
            <p className="text-lg leading-relaxed">{p.text}</p>
            <p className="text-base text-ink-2">
              <span className="font-semibold text-ink">{sure.label}.</span> {p.reasoning || sure.note}
            </p>
          </article>
        );
      })}
    </div>
  );
}

/** Reading sections (personality, career, love…), each with its own icon. */
export function TopicCards({ sections, icons, tone }: { sections: ReadingSection[]; icons: Record<string, typeof BookOpen>; tone: Tone }) {
  if (!sections.length) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sections.map((s) => {
        const Icon = icons[s.key] ?? BookOpen;
        return (
          <article key={`${s.key}-${s.title}`} className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-6">
            <div className="flex items-center gap-3">
              <IconBadge icon={Icon} tone={tone} size="sm" />
              <h3 className="text-xl font-semibold">{s.title}</h3>
            </div>
            <p className="text-lg leading-relaxed">{s.text}</p>
          </article>
        );
      })}
    </div>
  );
}

/** One traditional statement with where it comes from and why it applies to you. */
export function SourceItem({ claim, source, reasons, extra }: { claim: string; source: string | null; reasons?: string[]; extra?: ReactNode }) {
  return (
    <li className="flex flex-col gap-1.5 rounded-2xl bg-paper p-4">
      <p className="flex gap-2 text-lg">
        <Quote className="mt-1 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
        <span>{claim}</span>
      </p>
      {reasons && reasons.length > 0 && (
        <p className="text-base text-ink-2"><span className="font-semibold text-ink">Why it applies: </span>{reasons.join("; ")}</p>
      )}
      {source && <p className="text-base text-ink-3">Source: {source}</p>}
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
        <button type="button" onClick={onRetry} className={buttonClass("secondary", "md")}>Try the written summary again</button>
      ) : undefined}
    >
      {message.text}
    </Notice>
  );
}

/** Plain-words reminder of what these readings are. */
export function GoodToKnow({ text }: { text?: string }) {
  return (
    <aside className="flex gap-3 rounded-2xl border border-line bg-surface p-5 text-base text-ink-2">
      <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p>
        <span className="font-semibold text-ink">Good to know: </span>
        {text ?? "This is a traditional reading, for reflection and fun. It is not science, and it is not advice about health, money or the law."}
      </p>
    </aside>
  );
}

/** The next stop on the path, so every page ends with one clear thing to do. */
export function NextStepCard({ after, isPremium }: { after: StepKey; isPremium: boolean }) {
  const next = nextStep(after);
  if (!next) return null;
  const locked = next.premium && !isPremium;
  return (
    <section className="no-print flex flex-col gap-4 rounded-3xl bg-ink p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10" aria-hidden="true">
          <next.icon className="h-7 w-7" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-white/75">Next step</p>
          <h2 className="text-2xl font-semibold">{next.title}</h2>
          <p className="text-lg text-white/80">{next.what}</p>
        </div>
      </div>
      <Link
        href={locked ? "/premium" : next.href}
        className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-lg font-semibold text-ink hover:bg-white/90"
      >
        {locked && <Lock className="h-5 w-5" aria-hidden="true" />}
        {locked ? "Unlock with a code" : `Go to ${next.short}`}
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </Link>
    </section>
  );
}
