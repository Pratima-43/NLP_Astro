"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useAuth, useUser } from "@/components/providers/AuthProvider";
import {
  GenerationNote, GoodToKnow, InShort, NextStepCard, PointList, SectionTitle, SourceItem,
} from "@/components/readings/Blocks";
import { AreaCards } from "@/components/readings/AreaCards";
import { PrintButton } from "@/components/readings/PrintButton";
import { ReadingHeader } from "@/components/readings/ReadingHeader";
import { StartPanel } from "@/components/readings/StartPanel";
import { WorkingPanel } from "@/components/readings/WorkingPanel";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { Notice } from "@/components/ui/Notice";
import { ReadAloud } from "@/components/ui/ReadAloud";
import { Spinner } from "@/components/ui/Spinner";
import { postJson } from "@/lib/api";
import { useLatest } from "@/lib/hooks";
import { formatDate, ordinal } from "@/lib/format";
import { sortIntoAreas } from "@/lib/areas";
import { step as stepOf } from "@/lib/journey";
import { NUMBER_INFO, NUMBER_ORDER, groupClaims } from "@/lib/readings";
import type { NumerologyComponent, NumerologyReport } from "@/types/readings";
import type { UserProfile } from "@/types/user";

const STEP = stepOf("numbers");
const STAGES = [
  "Adding up the day you were born",
  "Adding up your whole birth date",
  "Turning the letters of your name into numbers",
  "Finding what the books say about your numbers",
  "Writing it all in simple words",
];

const PLANET_WORDS: Record<string, string> = {
  Sun: "the Sun", Moon: "the Moon", Jupiter: "Jupiter", Rahu: "Rahu (a shadow planet)", Mercury: "Mercury",
  Venus: "Venus", Ketu: "Ketu (a shadow planet)", Saturn: "Saturn", Mars: "Mars",
};

function whyItApplies(layer: string, name: string, number: number): string {
  if (layer === "compound_birth_date") return "it is about your exact birth date";
  if (layer === "component_specific") return `it is about a ${name} of ${number}`;
  if (layer === "context_specific") return "it is about a specific topic";
  return `it is about the number ${number} in general`;
}

export function NumbersView() {
  const user = useUser();
  const { isPremium } = useAuth();
  const [saved, setSaved] = useLatest<NumerologyReport>("/numerology/latest");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const report = saved.status === "ready" ? saved.data : null;

  async function make() {
    setError("");
    setWorking(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const fresh = await postJson<NumerologyReport>("/numerology/calculate", {
        full_name: user.name,
        date_of_birth: user.dateOfBirth,
        target_year: new Date().getFullYear(),
      });
      setSaved(fresh);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again in a moment.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <ReadingHeader step={STEP}>
        {report && !working && (
          <>
            <PrintButton />
            <Button variant="secondary" onClick={make} icon={<RotateCcw className="h-5 w-5" aria-hidden="true" />}>Make it again</Button>
          </>
        )}
      </ReadingHeader>

      {error && <Notice tone="error" title="We couldn’t make your reading">{error}</Notice>}

      {working ? (
        <WorkingPanel stages={STAGES} tone={STEP.tone} />
      ) : saved.status === "loading" ? (
        <p className="flex items-center gap-3 text-lg text-ink-2" role="status"><Spinner />Opening your reading…</p>
      ) : saved.status === "error" ? (
        <Notice tone="error" title="We couldn’t open your reading">{saved.message}</Notice>
      ) : !report ? (
        user.dateOfBirth ? (
          <StartPanel
            step={STEP}
            onStart={make}
            details={[
              { label: "Your name", value: user.name },
              { label: "Your birthday", value: formatDate(user.dateOfBirth) },
            ]}
          />
        ) : (
          <Notice tone="warning" title="We need your birthday first" action={<ButtonLink href="/me">Add my birthday</ButtonLink>}>
            Your numbers come from your name and your birthday.
          </Notice>
        )
      ) : (
        <NumbersResult report={report} user={user} onRemake={make} />
      )}

      {report && !working && <NextStepCard after="numbers" isPremium={isPremium} />}
    </div>
  );
}

function NumbersResult({ report, user, onRemake }: { report: NumerologyReport; user: UserProfile; onRemake: () => void }) {
  const c = report.components;
  const generated = report.generated_interpretations;
  const synthesis = report.synthesis;
  const anyWritten = NUMBER_ORDER.some((k) => generated[k]?.generation_status === "generated");
  const stale = report.full_name !== user.name || report.date_of_birth !== user.dateOfBirth;

  const headline = synthesis?.headline || `Your numbers are ${c.moolank.number}, ${c.bhagyank.number}, ${c.namank.number} and ${c.personal_year.number}`;
  const overview = synthesis?.overview
    || `Your birthday number is ${c.moolank.number}. Your life number is ${c.bhagyank.number}. Your name number is ${c.namank.number}. And ${report.target_year} is a ${c.personal_year.number} year for you. Below, you can see what each one means.`;
  const areas = sortIntoAreas(NUMBER_ORDER.flatMap((k) => report.interpretations[k] ?? []));

  return (
    <div className="flex flex-col gap-10">
      {stale && (
        <Notice tone="warning" title="Your details have changed since this reading" action={<Button onClick={onRemake}>Make it again with my new details</Button>}>
          This reading is for {report.full_name}, born {formatDate(report.date_of_birth)}.
        </Notice>
      )}
      <GenerationNote status={anyWritten ? "generated" : generated.moolank?.generation_status} onRetry={onRemake} />

      <InShort headline={headline} text={overview} tone="num" />

      <section aria-labelledby="four-numbers" className="flex flex-col gap-5">
        <SectionTitle id="four-numbers" title="Your four numbers" subtitle="Tap a number to read about it." />
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {NUMBER_ORDER.map((key) => {
            const calc = c[key];
            const info = NUMBER_INFO[key];
            return (
              <a key={key} href={`#${key}`} className="group flex flex-col gap-3 border-b border-l border-line px-5 py-7 first:border-l-0 first:pl-0 max-lg:[&:nth-child(3)]:border-l-0 max-lg:[&:nth-child(3)]:pl-0">
                <span className="font-display text-[6.5rem] leading-[0.85] text-ink transition-colors group-hover:text-num" aria-hidden="true">
                  {calc.number}
                </span>
                <span className="text-xl font-semibold leading-snug">{info.name}</span>
                <span className="text-base text-ink-2">
                  {calc.planet ? `Its planet: ${PLANET_WORDS[calc.planet] ?? calc.planet}` : `For ${report.target_year}`}
                </span>
                <span className="sr-only">Number {calc.number}</span>
              </a>
            );
          })}
        </div>
      </section>

      {areas.length > 0 && (
        <section aria-labelledby="num-areas" className="flex flex-col gap-5">
          <SectionTitle id="num-areas" title="Love, money, work and more" subtitle="What your numbers say about each part of your life." />
          <AreaCards notes={areas} tone="num" />
        </section>
      )}

      {synthesis?.year_focus?.text && (
        <section className="grid gap-4 rounded-[2rem] bg-num-soft p-6 sm:p-10 md:grid-cols-[14rem_1fr] md:gap-10">
          <h2 className="text-5xl">Your year <em>{report.target_year}</em></h2>
          <p className="text-xl leading-relaxed">{synthesis.year_focus.text}</p>
        </section>
      )}

      {(synthesis?.resonances?.length || synthesis?.tensions?.length) ? (
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
          <PointList title="Where your numbers agree" kind="good" items={(synthesis.resonances ?? []).map((r) => r.text)} />
          <PointList title="Where they pull different ways" kind="care" items={(synthesis.tensions ?? []).map((t) => t.text)} />
        </div>
      ) : null}

      {NUMBER_ORDER.map((key) => <NumberSection key={key} component={key} report={report} />)}

      <Disclosure title="How did we get this?" subtitle="The sums, step by step, and the books each line comes from">
        <div className="flex flex-col gap-8">
          {NUMBER_ORDER.map((key) => <NumberWorking key={key} component={key} report={report} />)}
        </div>
      </Disclosure>

      <GoodToKnow />
    </div>
  );
}

function NumberSection({ component, report }: { component: NumerologyComponent; report: NumerologyReport }) {
  const calc = report.components[component];
  const info = NUMBER_INFO[component];
  const written = report.generated_interpretations[component];
  const isWritten = written?.generation_status === "generated" && (written.summary || written.strengths.length);
  const records = report.interpretations[component] ?? [];
  const fallback = groupClaims(records);
  const listenText = isWritten
    ? [written.headline, written.summary, ...written.strengths.map((s) => s.text)].filter(Boolean).join(". ")
    : [...fallback.good, ...fallback.care].join(". ");

  return (
    <section id={component} aria-labelledby={`${component}-title`} className="grid scroll-mt-28 gap-6 border-t border-ink/80 pt-8 md:grid-cols-[11rem_1fr] md:gap-10">
      <div className="flex flex-row items-end gap-4 md:flex-col md:items-start">
        <span className="font-display text-[8rem] leading-[0.8] text-num" aria-hidden="true">{calc.number}</span>
      </div>
      <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 id={`${component}-title`} className="text-4xl sm:text-5xl">
            {info.name} <span className="sr-only">{calc.number}</span>
          </h2>
          <p className="text-lg text-ink-2">{component === "personal_year" ? `What ${report.target_year} is about for you.` : info.about}</p>
        </div>
        <ReadAloud text={listenText} />
      </div>

      {component === "moolank" && calc.compound_number != null && calc.compound_number >= 10 && (
        <p className="rounded-2xl bg-num-soft px-5 py-4 text-lg">
          You were born on the <strong>{ordinal(calc.compound_number)}</strong>. The books have extra things to say about the number {calc.compound_number}, so some lines below are about that exact date.
        </p>
      )}

      {isWritten ? (
        <>
          {written.headline && <p className="font-display text-3xl leading-tight">{written.headline}</p>}
          {written.summary && <p className="text-xl leading-relaxed">{written.summary}</p>}
          <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
            <PointList title="Your good side" kind="good" items={written.strengths.map((s) => s.text)} />
            <PointList title="Watch out for" kind="care" items={written.challenges.map((s) => s.text)} />
          </div>
          {written.key_themes.length > 0 && (
            <ul className="flex flex-col gap-2">
              {written.key_themes.map((t) => (
                <li key={t.text} className="border-l-2 border-num py-1 pl-5 text-lg">
                  {t.title && <strong className="text-num-ink">{t.title}: </strong>}
                  {t.text}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : records.length ? (
        <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
          <PointList title="Your good side" kind="good" items={fallback.good} />
          <PointList title="Watch out for" kind="care" items={fallback.care} />
          <PointList title="Other things" kind="other" items={fallback.other} />
        </div>
      ) : (
        <p className="text-lg text-ink-2">Our books don’t say anything about this number yet, so we don’t make anything up.</p>
      )}
      </div>
    </section>
  );
}

function NumberWorking({ component, report }: { component: NumerologyComponent; report: NumerologyReport }) {
  const calc = report.components[component];
  const info = NUMBER_INFO[component];
  const records = report.interpretations[component] ?? [];
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-3xl">{info.name} ({info.sanskrit}) = {calc.number}</h3>
      <ol className="flex flex-col gap-2">
        {calc.steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-lg">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-num-soft text-base font-semibold text-num-ink" aria-hidden="true">{i + 1}</span>
            <span className="tabular-nums">{s}</span>
          </li>
        ))}
      </ol>
      {component === "namank" && calc.letter_values && (
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Letter values">
          {calc.letter_values.map((l, i) => (
            <span key={`${l.letter}-${i}`} className="flex w-11 flex-col items-center rounded-lg border border-line bg-paper py-1">
              <span className="text-lg font-semibold">{l.letter}</span>
              <span className="text-base text-num-ink">{l.value}</span>
            </span>
          ))}
          <span className="px-1 text-lg">= {calc.compound_number} → {calc.number}</span>
        </div>
      )}
      {records.length > 0 && (
        <details className="rounded-2xl border border-line">
          <summary className="flex min-h-12 items-center px-4 text-lg font-semibold">Show the {records.length} lines from the books</summary>
          <ul className="flex flex-col gap-2 p-3">
            {records.map((r) => (
              <SourceItem key={r.record_id} claim={r.claim} source={r.source_name} reasons={[whyItApplies(r.evidence_layer, info.name.toLowerCase(), calc.number)]} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
