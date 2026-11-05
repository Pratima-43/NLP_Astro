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
import { BirthChart, ChartLegend, LifeAreas, PERIOD_WORDS, PeriodTimeline, PlanetTable, YOGA_WORDS } from "@/components/readings/StarsParts";
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
  "Working out where each planet was in the sky",
  "Finding your sign and your rising sign",
  "Looking at the times of your life",
  "Finding what the old books say",
  "Writing it all in simple words",
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
              We need to know where you were born to see the sky as it was.
            </Notice>
          )}
          {!timeKnown && user.placeOfBirth && (
            <Notice tone="info">Without a birth time we can’t find your rising sign, so we leave that part out. Everything else still works.</Notice>
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

  const headline = interpretation.headline || `Your sign is ${chart.moon_sign}`;
  const overview = interpretation.overview || [
    `Your sign is ${chart.moon_sign} and your birth star is ${moon.nakshatra.name}.`,
    !timeUnknown && `Your rising sign is ${chart.lagna.sign}.`,
    period && `Until ${formatMonthYear(period.mahadasha_end)} you are in your ${period.mahadasha} time. ${PERIOD_WORDS[period.mahadasha] ?? ""}`,
  ].filter(Boolean).join(" ");

  const facts = [
    { ...CHART_WORDS.moon, value: chart.moon_sign, proper: `${CHART_WORDS.moon.sanskrit}: ${moon.sign_sanskrit}` },
    !timeUnknown && { ...CHART_WORDS.lagna, value: chart.lagna.sign, proper: `${CHART_WORDS.lagna.sanskrit}: ${chart.lagna.sign_sanskrit}, ruled by ${chart.lagna.lord}` },
    { ...CHART_WORDS.nakshatra, value: moon.nakshatra.name, proper: `${CHART_WORDS.nakshatra.sanskrit}, pada ${moon.nakshatra.pada}, ruled by ${moon.nakshatra.lord}` },
    { ...CHART_WORDS.sun, value: chart.sun_sign, proper: `${CHART_WORDS.sun.sanskrit}, sidereal zodiac` },
  ].filter(Boolean) as Array<{ name: string; sanskrit: string; about: string; value: string; proper: string }>;

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

      {!timeUnknown && (
        <section aria-labelledby="areas" className="flex flex-col gap-5">
          <SectionTitle id="areas" title="Love, money, work and more" subtitle="How your chart looks for each part of your life." />
          <LifeAreas domains={chart.domains} />
        </section>
      )}

      <section aria-labelledby="chart-facts" className="flex flex-col gap-5">
        <SectionTitle id="chart-facts" title="Your signs" />
        <div className={`grid gap-x-10 sm:grid-cols-2 ${facts.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {facts.map((f) => (
            <div key={f.name} className="flex flex-col gap-2 border-b border-line py-7">
              <span className="eyebrow text-star">{f.name}</span>
              <span className="font-display text-6xl leading-none">{f.value}</span>
              <span className="text-base text-ink-2">{f.about}</span>
            </div>
          ))}
        </div>
      </section>

      {period && (
        <section className="flex flex-col gap-5 rounded-[2rem] bg-star-soft p-6 sm:p-10">
          <p className="eyebrow text-star">Right now</p>
          <h2 className="text-5xl">What’s happening now</h2>
          <p className="text-lg leading-relaxed">
            In Indian astrology, each planet takes a turn to shape your life for some years.
            Until {formatMonthYear(period.mahadasha_end)}, it is <strong>{period.mahadasha}’s turn</strong>. {PERIOD_WORDS[period.mahadasha]}{" "}
            Inside it, a shorter <strong>{period.antardasha} time</strong> runs from {formatMonthYear(period.antardasha_start)} to {formatMonthYear(period.antardasha_end)}.
          </p>
          {interpretation.current_period?.text && <p className="text-lg leading-relaxed">{interpretation.current_period.text}</p>}
          <p className="text-lg text-ink-2">
            {sadeSati.active
              ? "Saturn is passing over your sign right now. This lasts about seven and a half years. It can feel heavy, but hard work now helps you grow."
              : "Saturn’s hard seven-and-a-half-year time is not happening for you now."}
          </p>
        </section>
      )}

      {written && (interpretation.predictions?.length ?? 0) > 0 && (
        <section aria-labelledby="ahead" className="flex flex-col gap-5">
          <SectionTitle id="ahead" title="What’s coming up" subtitle="Gentle pointers, not promises. Dates come from the times of your life." />
          <PredictionList predictions={interpretation.predictions ?? []} tone="star" />
        </section>
      )}

      {written && (interpretation.sections?.length ?? 0) > 0 && (
        <section aria-labelledby="topics" className="flex flex-col gap-5">
          <SectionTitle id="topics" title="Your life, one part at a time" />
          <TopicCards sections={interpretation.sections ?? []} icons={SECTION_ICONS} tone="star" />
        </section>
      )}

      {!written && (
        <section aria-labelledby="books" className="flex flex-col gap-5">
          <SectionTitle id="books" title="What the old books say about you" />
          <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
            <PointList title="Your good side" kind="good" items={groups.good} />
            <PointList title="Watch out for" kind="care" items={groups.care} />
            <PointList title="Other things" kind="other" items={groups.other} />
          </div>
        </section>
      )}

      {chart.yogas.length > 0 && (
        <section aria-labelledby="yogas" className="flex flex-col gap-5">
          <SectionTitle id="yogas" title="Special mixes in your chart" subtitle="The old books say these mixes of planets bring certain results." />
          <ul className="grid gap-x-12 md:grid-cols-2">
            {chart.yogas.filter((y, i, all) => all.findIndex((o) => o.key === y.key) === i).map((y) => {
              const words = YOGA_WORDS[y.key];
              return (
                <li key={`${y.key}-${y.condition}`} className="flex flex-col gap-2 border-b border-line py-6">
                  <span className="font-display text-3xl">{words?.name ?? y.name}</span>
                  {words && <span className="text-lg">{words.meaning}</span>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Disclosure title="How did we get this?" subtitle="The chart drawing, every planet, the times of your life, and the books we used">
        <div className="flex flex-col gap-8">
          <div className="grid items-start gap-6 lg:grid-cols-[22rem_1fr]">
            <BirthChart chart={chart} />
            <div className="flex flex-col gap-3 text-lg">
              <ChartLegend />
              <p className="text-base text-ink-2">
                For experts: worked out for {formatDate(chartDate)}{timeUnknown ? " at midday (birth time not known)" : ` at ${formatTime(chartTime)}`}, {chart.birth.timezone} time,
                at {chart.birth.latitude}°, {chart.birth.longitude}°{reading.place_name ? ` (${shortPlace(reading.place_name)})` : ""}.
                Star-based zodiac with the Lahiri setting ({chart.birth.ayanamsa_lahiri}°), Julian Day {chart.birth.julian_day_ut}.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-3xl">Proper names</h3>
            <p className="text-base text-ink-2">The words an astrologer would use, if you want to look things up.</p>
            <dl className="grid gap-x-10 gap-y-2 text-base sm:grid-cols-2">
              {facts.map((f) => (
                <div key={f.name} className="flex flex-wrap gap-x-2 border-b border-line py-2"><dt className="font-semibold">{f.name}:</dt><dd className="text-ink-2">{f.proper}</dd></div>
              ))}
              {period && (
                <div className="flex flex-wrap gap-x-2 border-b border-line py-2"><dt className="font-semibold">Times of your life:</dt><dd className="text-ink-2">{period.mahadasha} mahadasha, {period.antardasha} antardasha</dd></div>
              )}
              <div className="flex flex-wrap gap-x-2 border-b border-line py-2"><dt className="font-semibold">Saturn’s hard time:</dt><dd className="text-ink-2">Sade Sati{sadeSati.active ? ` (now, ${sadeSati.phase})` : " (not now)"}</dd></div>
              {chart.yogas.map((y) => (
                <div key={`${y.key}-${y.condition}-p`} className="flex flex-wrap gap-x-2 border-b border-line py-2"><dt className="font-semibold">{YOGA_WORDS[y.key]?.name ?? y.name}:</dt><dd className="text-ink-2">{y.name}, {y.condition}</dd></div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-3xl">Every planet</h3>
            <PlanetTable planets={chart.planets} timeUnknown={timeUnknown} />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-3xl">The times of your life</h3>
            <p className="text-base text-ink-3">Proper name: Vimshottari dasha.</p>
            <PeriodTimeline chart={chart} />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-3xl">What the books say, line by line ({uniqueEvidence(reading.evidence).length})</h3>
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
