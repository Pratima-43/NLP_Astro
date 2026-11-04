"use client";

import { useState } from "react";
import { Activity, Briefcase, Coins, GraduationCap, Heart, Palette, RotateCcw, Sparkles, UserRound } from "lucide-react";
import { useAuth, useUser } from "@/components/providers/AuthProvider";
import {
  GenerationNote, GoodToKnow, InShort, NextStepCard, PointList, PredictionList, SectionTitle, SourceItem, TopicCards,
} from "@/components/readings/Blocks";
import { PrintButton } from "@/components/readings/PrintButton";
import { ReadingHeader } from "@/components/readings/ReadingHeader";
import { StartPanel } from "@/components/readings/StartPanel";
import { BirthChart, ChartLegend, LifeAreas, PeriodTimeline, PlanetTable } from "@/components/readings/StarsParts";
import { WorkingPanel } from "@/components/readings/WorkingPanel";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { Notice } from "@/components/ui/Notice";
import { Spinner } from "@/components/ui/Spinner";
import { postJson } from "@/lib/api";
import { useLatest } from "@/lib/hooks";
import { formatDate, formatMonthYear, formatTime, shortPlace } from "@/lib/format";
import { step as stepOf } from "@/lib/journey";
import { CHART_WORDS, groupClaims, uniqueEvidence } from "@/lib/readings";
import type { AstrologyReading } from "@/types/readings";
import type { UserProfile } from "@/types/user";

const STEP = stepOf("stars");
const STAGES = [
  "Finding your birth place on the map",
  "Working out where every planet was",
  "Finding your rising sign and the 12 houses",
  "Checking special patterns and your life periods",
  "Finding what the classical books say",
  "Writing your reading in plain words",
];
const SECTION_ICONS = { personality: UserRound, career: Briefcase, relationships: Heart, finance: Coins, health: Activity, spirituality: Sparkles, education: GraduationCap, creativity: Palette };

export function StarsView() {
  const user = useUser();
  const { isPremium } = useAuth();
  const [saved, setSaved] = useLatest<AstrologyReading>("/astrology/latest");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const reading = saved.status === "ready" ? saved.data : null;
  const timeKnown = !user.timeOfBirthUnknown && Boolean(user.timeOfBirth);

  async function make() {
    setError("");
    setWorking(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const fresh = await postJson<AstrologyReading>("/astrology/chart", {
        full_name: user.name,
        date_of_birth: user.dateOfBirth,
        time_of_birth: timeKnown ? user.timeOfBirth : null,
        place_name: user.placeOfBirth,
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
        {reading && !working && (
          <>
            <PrintButton />
            <Button variant="secondary" onClick={make} icon={<RotateCcw className="h-5 w-5" aria-hidden="true" />}>Make it again</Button>
          </>
        )}
      </ReadingHeader>

      {error && (
        <Notice tone="error" title="We couldn’t make your reading" action={/place|find|look/i.test(error) ? <ButtonLink href="/me" variant="secondary">Check my birth place</ButtonLink> : undefined}>
          {error}
        </Notice>
      )}

      {working ? (
        <WorkingPanel stages={STAGES} tone={STEP.tone} />
      ) : saved.status === "loading" ? (
        <p className="flex items-center gap-3 text-lg text-ink-2" role="status"><Spinner />Opening your reading…</p>
      ) : saved.status === "error" ? (
        <Notice tone="error" title="We couldn’t open your reading">{saved.message}</Notice>
      ) : !reading ? (
        <StartPanel
          step={STEP}
          onStart={make}
          disabled={!user.placeOfBirth || !user.dateOfBirth}
          details={[
            { label: "Your name", value: user.name },
            { label: "Your birthday", value: formatDate(user.dateOfBirth) },
            { label: "Birth time", value: timeKnown ? formatTime(user.timeOfBirth) : "Not known (we’ll use midday)" },
            { label: "Birth place", value: shortPlace(user.placeOfBirth) || "Not given yet" },
          ]}
        >
          {!user.placeOfBirth && (
            <Notice tone="warning" title="We need your birth place" action={<ButtonLink href="/me">Add my birth place</ButtonLink>}>
              The planets are worked out for the exact place you were born.
            </Notice>
          )}
          {!timeKnown && user.placeOfBirth && (
            <Notice tone="info">Without a birth time we can’t work out your rising sign or houses, so those parts are left out. Everything else still works.</Notice>
          )}
        </StartPanel>
      ) : (
        <StarsResult reading={reading} user={user} onRemake={make} />
      )}

      {reading && !working && <NextStepCard after="stars" isPremium={isPremium} />}
    </div>
  );
}

function StarsResult({ reading, user, onRemake }: { reading: AstrologyReading; user: UserProfile; onRemake: () => void }) {
  const { chart, interpretation } = reading;
  const timeUnknown = reading.birth_time_unknown;
  const moon = chart.planets.Moon;
  const period = chart.dasha.current_period;
  const written = interpretation.generation_status === "generated";
  const [chartDate, chartTime] = chart.birth.local_datetime.split("T");
  const userTimeKnown = !user.timeOfBirthUnknown && Boolean(user.timeOfBirth);
  const stale = chartDate !== user.dateOfBirth || timeUnknown === userTimeKnown || (userTimeKnown && chartTime?.slice(0, 5) !== user.timeOfBirth);

  const headline = interpretation.headline || (timeUnknown
    ? `A ${chart.moon_sign} Moon born under ${moon.nakshatra.name}`
    : `${chart.lagna.sign} rising, with the Moon in ${chart.moon_sign}`);
  const overview = interpretation.overview || [
    !timeUnknown && `Your rising sign is ${chart.lagna.sign}.`,
    `Your Moon sign is ${chart.moon_sign} and your birth star is ${moon.nakshatra.name}.`,
    period && `You are now in a ${period.mahadasha} period, which lasts until ${formatMonthYear(period.mahadasha_end)}.`,
  ].filter(Boolean).join(" ");

  const facts = [
    !timeUnknown && { ...CHART_WORDS.lagna, value: chart.lagna.sign, extra: `${chart.lagna.sign_sanskrit}, ruled by ${chart.lagna.lord}` },
    { ...CHART_WORDS.moon, value: chart.moon_sign, extra: `${moon.sign_sanskrit}` },
    { ...CHART_WORDS.nakshatra, value: moon.nakshatra.name, extra: `Quarter ${moon.nakshatra.pada}, ruled by ${moon.nakshatra.lord}` },
    { ...CHART_WORDS.sun, value: chart.sun_sign, extra: "In the star-based (sidereal) zodiac" },
  ].filter(Boolean) as Array<{ name: string; sanskrit: string; about: string; value: string; extra: string }>;

  const sadeSati = chart.transits.sade_sati;
  const groups = groupClaims(uniqueEvidence(reading.evidence));

  return (
    <div className="flex flex-col gap-10">
      {stale && (
        <Notice tone="warning" title="Your birth details have changed since this reading" action={<Button onClick={onRemake}>Make it again with my new details</Button>}>
          This chart is for {formatDate(chartDate)}{timeUnknown ? " (time not known)" : ` at ${formatTime(chartTime)}`}{reading.place_name ? ` in ${shortPlace(reading.place_name)}` : ""}.
        </Notice>
      )}
      <GenerationNote status={interpretation.generation_status} onRetry={onRemake} />

      <InShort headline={headline} text={overview} tone="star" />

      <section aria-labelledby="chart-facts" className="flex flex-col gap-5">
        <SectionTitle id="chart-facts" title="Your chart at a glance" />
        <div className={`grid gap-3 sm:grid-cols-2 ${facts.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {facts.map((f) => (
            <div key={f.name} className="flex flex-col gap-2 rounded-3xl border border-line bg-surface p-5">
              <span className="text-base font-semibold text-star">{f.name} <span className="font-normal text-ink-2">({f.sanskrit})</span></span>
              <span className="font-display text-3xl font-semibold">{f.value}</span>
              <span className="text-base text-ink-2">{f.extra}</span>
              <span className="text-base text-ink-2">{f.about}</span>
            </div>
          ))}
        </div>
      </section>

      {period && (
        <section className="flex flex-col gap-3 rounded-3xl border-2 border-star bg-surface p-6">
          <h2 className="text-2xl font-semibold">What’s happening now</h2>
          <p className="text-lg leading-relaxed">
            You are in a <strong>{period.mahadasha} period</strong> until {formatMonthYear(period.mahadasha_end)}. Inside it, a shorter{" "}
            <strong>{period.antardasha} period</strong> runs from {formatMonthYear(period.antardasha_start)} to {formatMonthYear(period.antardasha_end)}.
            In this tradition, each planet takes a turn to shape a part of your life.
          </p>
          {interpretation.current_period?.text && <p className="text-lg leading-relaxed">{interpretation.current_period.text}</p>}
          <p className="text-lg text-ink-2">
            {sadeSati.active
              ? `Saturn is passing over your Moon sign right now (Sade Sati, ${sadeSati.phase}). The books see this as a demanding time that builds maturity.`
              : "Saturn’s long passage over your Moon sign (Sade Sati) is not happening now."}
          </p>
        </section>
      )}

      {written && (interpretation.predictions?.length ?? 0) > 0 && (
        <section aria-labelledby="ahead" className="flex flex-col gap-5">
          <SectionTitle id="ahead" title="What’s ahead" subtitle="Careful, traditional pointers. Dates come only from your life periods." />
          <PredictionList predictions={interpretation.predictions ?? []} tone="star" />
        </section>
      )}

      {written && (interpretation.sections?.length ?? 0) > 0 && (
        <section aria-labelledby="topics" className="flex flex-col gap-5">
          <SectionTitle id="topics" title="Your reading, topic by topic" />
          <TopicCards sections={interpretation.sections ?? []} icons={SECTION_ICONS} tone="star" />
        </section>
      )}

      {!written && (
        <section aria-labelledby="books" className="flex flex-col gap-5">
          <SectionTitle id="books" title="What the classical books say about your chart" />
          <div className="grid gap-4 lg:grid-cols-2">
            <PointList title="Good things" kind="good" items={groups.good} />
            <PointList title="Be careful about" kind="care" items={groups.care} />
            <PointList title="Also in your chart" kind="other" items={groups.other} />
          </div>
        </section>
      )}

      {!timeUnknown && (
        <section aria-labelledby="areas" className="flex flex-col gap-5">
          <SectionTitle id="areas" title="Areas of your life" subtitle="How much your chart supports each area, from the planets linked to it." />
          <LifeAreas domains={chart.domains} />
        </section>
      )}

      {chart.yogas.length > 0 && (
        <section aria-labelledby="yogas" className="flex flex-col gap-5">
          <SectionTitle id="yogas" title="Special patterns in your chart" subtitle="A yoga is a pattern of planets that the old books link to a particular result." />
          <ul className="grid gap-3 md:grid-cols-2">
            {chart.yogas.map((y) => (
              <li key={`${y.key}-${y.condition}`} className="flex flex-col gap-1 rounded-2xl border border-line bg-surface p-4">
                <span className="text-lg font-semibold">{y.name}</span>
                <span className="text-base text-ink-2">{y.condition}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Disclosure title="How we worked this out" subtitle="Your chart drawing, every planet, your life periods and the books we used">
        <div className="flex flex-col gap-8">
          <div className="grid items-start gap-6 lg:grid-cols-[22rem_1fr]">
            <BirthChart chart={chart} />
            <div className="flex flex-col gap-3 text-lg">
              <ChartLegend />
              <p className="text-base text-ink-2">
                Worked out for {formatDate(chartDate)}{timeUnknown ? " at midday (birth time not known)" : ` at ${formatTime(chartTime)}`}, {chart.birth.timezone} time,
                at {chart.birth.latitude}°, {chart.birth.longitude}°{reading.place_name ? ` (${shortPlace(reading.place_name)})` : ""}.
                Star-based zodiac with the Lahiri setting ({chart.birth.ayanamsa_lahiri}°), Julian Day {chart.birth.julian_day_ut}.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-semibold">Every planet</h3>
            <PlanetTable planets={chart.planets} timeUnknown={timeUnknown} />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-semibold">Your life periods (Vimshottari dasha)</h3>
            <PeriodTimeline chart={chart} />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-semibold">The statements from the books ({uniqueEvidence(reading.evidence).length})</h3>
            <ul className="flex flex-col gap-2">
              {uniqueEvidence(reading.evidence).map((e) => (
                <SourceItem key={e.claim} claim={e.claim} source={e.source_name} reasons={e.reasons} />
              ))}
            </ul>
          </div>
        </div>
      </Disclosure>

      <GoodToKnow />
    </div>
  );
}
