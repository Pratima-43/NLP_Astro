"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarClock, Check, Lightbulb, RotateCcw, Sparkles } from "lucide-react";
import { PremiumGate } from "@/components/premium/Unlock";
import { useAuth } from "@/components/providers/AuthProvider";
import { GenerationNote, GoodToKnow, InShort, NextStepCard, PointList, SectionTitle } from "@/components/readings/Blocks";
import { PrintButton } from "@/components/readings/PrintButton";
import { ReadingHeader } from "@/components/readings/ReadingHeader";
import { ShareBar } from "@/components/readings/ShareBar";
import { WorkingPanel } from "@/components/readings/WorkingPanel";
import { Button } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { IconBadge } from "@/components/ui/IconBadge";
import { Notice } from "@/components/ui/Notice";
import { Spinner } from "@/components/ui/Spinner";
import { apiFetch, postJson } from "@/lib/api";
import { useLatest } from "@/lib/hooks";
import { JOURNEY, MODULE_STEP, TONE, step as stepOf } from "@/lib/journey";
import { RELATION_WORDS } from "@/lib/readings";
import type { CombinedReportResult, IntegrationStatus, ModuleKey } from "@/types/readings";

const STEP = stepOf("story");
const STAGES = [
  "Gathering your three readings",
  "Lining them up, topic by topic",
  "Finding where they agree and where they differ",
  "Explaining your key facts in plain words",
  "Writing your full story",
];
const MODULES: ModuleKey[] = ["numerology", "astrology", "palmistry"];

export function StoryView() {
  const { isPremium } = useAuth();
  return (
    <div className="flex flex-col gap-8">
      <ReadingHeader step={STEP} />
      <PremiumGate title="Your Full Story">{isPremium && <StoryContent />}</PremiumGate>
    </div>
  );
}

function StoryContent() {
  const { isPremium } = useAuth();
  const [saved, setSaved] = useLatest<CombinedReportResult>("/integration/report/latest");
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const report = saved.status === "ready" ? saved.data : null;

  useEffect(() => {
    let alive = true;
    apiFetch<IntegrationStatus>("/integration/status").then((s) => {
      if (alive) setStatus(s);
    }).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const readyCount = status ? MODULES.filter((m) => status[m].available).length : 0;

  async function make() {
    setError("");
    setWorking(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      setSaved(await postJson<CombinedReportResult>("/integration/report", {}));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again in a moment.");
    } finally {
      setWorking(false);
    }
  }

  // A reading made after this story isn't in it yet.
  const outdated = Boolean(report && status && MODULES.some((m) => status[m].available && status[m].reading_id !== report.source_ids?.[m]));

  return (
    <div className="flex flex-col gap-8">
      {error && <Notice tone="error" title="We couldn’t make your full story">{error}</Notice>}

      {working ? (
        <WorkingPanel stages={STAGES} tone="story" />
      ) : saved.status === "loading" ? (
        <p className="flex items-center gap-3 text-lg text-ink-2" role="status"><Spinner />Opening your full story…</p>
      ) : saved.status === "error" ? (
        <Notice tone="error" title="We couldn’t open your full story">{saved.message}</Notice>
      ) : !report || report.generation_status === "no_readings" ? (
        <section className="flex flex-col gap-6 rounded-[1.75rem] border border-line border-t-8 border-t-story bg-surface p-6 sm:p-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl">Put your readings together</h2>
            <p className="text-lg text-ink-2">The more readings you have, the fuller your story. You need at least one.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {JOURNEY.filter((s) => s.module).map((s) => {
              const ready = Boolean(status?.[s.module!].available);
              return (
                <li key={s.key} className="flex flex-col gap-3 rounded-2xl bg-paper p-4">
                  <div className="flex items-center gap-3">
                    <IconBadge icon={s.icon} tone={s.tone} size="sm" />
                    <span className="text-lg font-semibold">{s.short}</span>
                  </div>
                  {!status ? (
                    <span className="flex items-center gap-2 text-base text-ink-2"><Spinner className="h-4 w-4" />Checking…</span>
                  ) : ready ? (
                    <span className="flex items-center gap-2 text-base font-semibold text-good"><Check className="h-5 w-5" aria-hidden="true" />Ready</span>
                  ) : (
                    <Link href={s.href} className="flex items-center gap-1.5 text-base font-semibold text-ink underline underline-offset-4">
                      Make it first <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <Button size="lg" onClick={make} disabled={!status || readyCount === 0} className="self-start" icon={<Sparkles className="h-5 w-5" aria-hidden="true" />}>
            Make my full story
          </Button>
          <p className="text-base text-ink-2">It can take up to a minute. Your story is saved for next time.</p>
        </section>
      ) : (
        <StoryResult report={report} outdated={outdated} onRemake={make} />
      )}

      {report && report.generation_status !== "no_readings" && !working && <NextStepCard after="story" isPremium={isPremium} />}
    </div>
  );
}

function StoryResult({ report, outdated, onRemake }: { report: CombinedReportResult; outdated: boolean; onRemake: () => void }) {
  const written = report.generation_status === "generated";
  const facts = report.profile_facts;
  const meanings = report.fact_meanings ?? {};
  const headline = report.headline || "Your three readings, side by side";
  const overview = report.overview || "Below are the key facts from each of your readings, explained in plain words.";

  return (
    <div className="flex flex-col gap-10">
      <div className="no-print flex flex-wrap gap-2">
        <PrintButton />
        <Button variant="secondary" onClick={onRemake} icon={<RotateCcw className="h-5 w-5" aria-hidden="true" />}>Make it again</Button>
      </div>

      {outdated && (
        <Notice tone="info" title="You have a newer reading" action={<Button onClick={onRemake}>Update my full story</Button>}>
          One of your readings changed after this story was made. Update it to include everything.
        </Notice>
      )}
      <GenerationNote status={report.generation_status} onRetry={onRemake} />

      <InShort headline={headline} text={overview} tone="story" label="Your story in short" />

      {report.overall_contributions.some((c) => c.percent > 0) && (
        <section className="flex flex-col gap-4 border-y border-line py-6">
          <ShareBar contributions={report.overall_contributions} label="How much each reading added to your story" />
        </section>
      )}

      {(report.strongest_agreements.length > 0 || report.notable_tensions.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          <PointList title="Where your readings agree" kind="good" items={report.strongest_agreements.map((a) => a.text)} />
          <PointList title="Where they see you differently" kind="care" items={report.notable_tensions.map((t) => t.text)} />
        </div>
      )}

      {report.system_summaries && Object.keys(report.system_summaries).length > 0 && (
        <section aria-labelledby="each-reading" className="flex flex-col gap-5">
          <SectionTitle id="each-reading" title="What each reading says" />
          <div className="grid gap-4 lg:grid-cols-3">
            {MODULES.filter((m) => report.system_summaries?.[m]).map((m) => {
              const s = MODULE_STEP[m];
              return (
                <article key={m} className={`flex flex-col gap-3 rounded-[1.75rem] border border-line border-t-8 bg-surface p-6 ${TONE[s.tone].top}`}>
                  <div className="flex items-center gap-3">
                    <IconBadge icon={s.icon} tone={s.tone} size="sm" />
                    <h3 className="text-3xl">{s.short}</h3>
                  </div>
                  <p className="text-lg leading-relaxed">{report.system_summaries?.[m]}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {(report.timeline?.length ?? 0) > 0 && (
        <section aria-labelledby="timeline" className="flex flex-col gap-5">
          <SectionTitle id="timeline" title="What’s ahead" subtitle="Taken only from your life periods and your year number." />
          <ol className="flex flex-col gap-3">
            {report.timeline?.map((t, i) => (
              <li key={i} className="flex gap-4 rounded-[1.75rem] border border-line bg-surface p-5">
                <CalendarClock className="mt-1 h-6 w-6 shrink-0 text-story" aria-hidden="true" />
                <div className="flex flex-col gap-1">
                  <span className="text-base font-semibold text-story-ink">{t.period}</span>
                  <h3 className="text-3xl">{t.title}</h3>
                  <p className="text-lg leading-relaxed">{t.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {(report.guidance?.length ?? 0) > 0 && (
        <section aria-labelledby="tips" className="flex flex-col gap-4 rounded-[1.75rem] bg-story-soft p-6 sm:p-8">
          <h2 id="tips" className="flex items-center gap-3 text-4xl"><Lightbulb className="h-7 w-7 text-story" aria-hidden="true" />Things to think about</h2>
          <ul className="flex flex-col gap-3">
            {report.guidance?.map((g, i) => <li key={i} className="text-lg leading-relaxed">• {g.text}</li>)}
          </ul>
        </section>
      )}

      {report.themes.length > 0 && (
        <section aria-labelledby="themes" className="flex flex-col gap-5">
          <SectionTitle id="themes" title="Your story, topic by topic" />
          <div className="grid gap-4 lg:grid-cols-2">
            {report.themes.map((t) => {
              const relation = RELATION_WORDS[t.relation] ?? RELATION_WORDS.difference;
              return (
                <article key={t.theme} className="flex flex-col gap-4 rounded-[1.75rem] border border-line bg-surface p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-3xl">{t.label.replace("&", "and")}</h3>
                    <span className={`rounded-full px-3 py-1 text-base font-semibold ${relation.tone}`}>{relation.label}</span>
                  </div>
                  <p className="text-lg leading-relaxed">{t.synthesis}</p>
                  <ShareBar contributions={t.contributions} label="Who said this" />
                </article>
              );
            })}
          </div>
        </section>
      )}

      {facts && (
        <Disclosure title="Your key facts explained" subtitle="Every number, sign and line in your readings, and what it means" defaultOpen={!written}>
          <div className="flex flex-col gap-8">
            {MODULES.filter((m) => facts[m]?.length).map((m) => (
              <div key={m} className="flex flex-col gap-3">
                <h3 className={`text-xl font-semibold ${TONE[MODULE_STEP[m].tone].text}`}>{MODULE_STEP[m].title}</h3>
                <ul className="flex flex-col gap-3">
                  {facts[m].map((f) => (
                    <li key={f.key} className="flex flex-col gap-2 rounded-2xl bg-paper p-4">
                      <span className="text-base text-ink-2">{f.label}</span>
                      <span className="text-lg font-semibold">{f.value}</span>
                      <span className="text-base text-ink-2">{f.concept}</span>
                      {meanings[f.key]?.meaning && <span className="text-lg"><strong>For you: </strong>{meanings[f.key].meaning}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Disclosure>
      )}

      <Disclosure title="How we put it together" subtitle="The method, and every statement your story used">
        <div className="flex flex-col gap-4">
          <p className="text-lg">{report.method}</p>
          <ul className="flex flex-col gap-2">
            {Object.entries(report.claims).map(([id, c]) => (
              <li key={id} className="flex flex-col gap-1 rounded-2xl bg-paper p-4">
                <span className={`text-base font-semibold ${TONE[MODULE_STEP[c.module].tone].text}`}>{MODULE_STEP[c.module].short}</span>
                <span className="text-lg">{c.claim}</span>
                <span className="text-base text-ink-2">Why: {c.basis}</span>
              </li>
            ))}
          </ul>
        </div>
      </Disclosure>

      <GoodToKnow />
    </div>
  );
}
