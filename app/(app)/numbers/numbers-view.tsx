"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useAuth, useUser } from "@/components/providers/AuthProvider";
import {
  GenerationNote, GoodToKnow, InShort, NextStepCard, PointList, SectionTitle, SourceItem,
} from "@/components/readings/Blocks";
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
  "Writing your reading in plain words",
];

const PLANET_WORDS: Record<string, string> = {
  Sun: "the Sun", Moon: "the Moon", Jupiter: "Jupiter", Rahu: "Rahu (the Moon’s north node)", Mercury: "Mercury",
  Venus: "Venus", Ketu: "Ketu (the Moon’s south node)", Saturn: "Saturn", Mars: "Mars",
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
    || `Your birth-day number is ${c.moolank.number}, your life-path number is ${c.bhagyank.number}, and your name number is ${c.namank.number}. ${report.target_year} is a number ${c.personal_year.number} year for you. Below you can see what the books say about each one.`;

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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {NUMBER_ORDER.map((key) => {
            const calc = c[key];
            const info = NUMBER_INFO[key];
            return (
              <a key={key} href={`#${key}`} className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 hover:border-num">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-num-soft font-display text-4xl font-semibold text-num-ink" aria-hidden="true">
                  {calc.number}
                </span>
                <span className="flex flex-col">
                  <span className="text-lg font-semibold leading-snug">{info.name}</span>
                  <span className="text-base text-ink-2">{info.sanskrit}</span>
                </span>
                <span className="text-base text-ink-2">
                  {calc.planet ? `Linked with ${PLANET_WORDS[calc.planet] ?? calc.planet}` : `For ${report.target_year}`}
                </span>
                <span className="sr-only">Number {calc.number}</span>
              </a>
            );
          })}
        </div>
      </section>

      {synthesis?.year_focus?.text && (
        <section className="flex flex-col gap-2 rounded-3xl border-2 border-num bg-surface p-6">
          <h2 className="text-2xl font-semibold">Your year {report.target_year}</h2>
          <p className="text-lg leading-relaxed">{synthesis.year_focus.text}</p>
        </section>
      )}

      {(synthesis?.resonances?.length || synthesis?.tensions?.length) ? (
        <div className="grid gap-4 md:grid-cols-2">
          <PointList title="Where your numbers agree" kind="good" items={(synthesis.resonances ?? []).map((r) => r.text)} />
          <PointList title="Where they pull different ways" kind="care" items={(synthesis.tensions ?? []).map((t) => t.text)} />
        </div>
      ) : null}

      {NUMBER_ORDER.map((key) => <NumberSection key={key} component={key} report={report} />)}

      <Disclosure title="How we worked this out" subtitle="The sums step by step, and the books each meaning comes from">
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
    <section id={component} aria-labelledby={`${component}-title`} className="flex scroll-mt-28 flex-col gap-5 rounded-3xl border border-line bg-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-num font-display text-4xl font-semibold text-white" aria-hidden="true">
            {calc.number}
          </span>
          <div className="flex flex-col">
            <h2 id={`${component}-title`} className="text-2xl font-semibold">
              {info.name}: {calc.number}
            </h2>
            <p className="text-base text-ink-2">{info.sanskrit} · {component === "personal_year" ? `for ${report.target_year}` : info.about.split(". ")[0]}</p>
          </div>
        </div>
        <ReadAloud text={listenText} />
      </div>

      {component === "moolank" && calc.compound_number != null && calc.compound_number >= 10 && (
        <p className="rounded-2xl bg-paper px-4 py-3 text-lg">
          You were born on the <strong>{ordinal(calc.compound_number)}</strong>. The books also read {calc.compound_number} as a number of its own, so some meanings below are about that exact date.
        </p>
      )}

      {isWritten ? (
        <>
          {written.headline && <p className="font-display text-xl font-semibold">{written.headline}</p>}
          {written.summary && <p className="text-lg leading-relaxed">{written.summary}</p>}
          <div className="grid gap-4 lg:grid-cols-2">
            <PointList title="Good things" kind="good" items={written.strengths.map((s) => s.text)} />
            <PointList title="Be careful about" kind="care" items={written.challenges.map((s) => s.text)} />
          </div>
          {written.key_themes.length > 0 && (
            <ul className="flex flex-col gap-2">
              {written.key_themes.map((t) => (
                <li key={t.text} className="rounded-2xl bg-num-soft px-4 py-3 text-lg">
                  {t.title && <strong className="text-num-ink">{t.title}: </strong>}
                  {t.text}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : records.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <PointList title="Good things" kind="good" items={fallback.good} />
          <PointList title="Be careful about" kind="care" items={fallback.care} />
          <PointList title="Also linked with" kind="other" items={fallback.other} />
        </div>
      ) : (
        <p className="text-lg text-ink-2">The books in our library don’t describe this number yet, so we don’t make anything up.</p>
      )}
    </section>
  );
}

function NumberWorking({ component, report }: { component: NumerologyComponent; report: NumerologyReport }) {
  const calc = report.components[component];
  const info = NUMBER_INFO[component];
  const records = report.interpretations[component] ?? [];
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-semibold">{info.name} ({info.sanskrit}) = {calc.number}</h3>
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
          <summary className="flex min-h-12 items-center px-4 text-lg font-semibold">Show the {records.length} statements from the books</summary>
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
