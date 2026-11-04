"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Lock } from "lucide-react";
import { OrbitLoader } from "@/components/layout/AccountGates";
import { useAuth, useUser } from "@/components/providers/AuthProvider";
import { CosmicProfile, type ProfileData } from "@/components/readings/CosmicProfile";
import { ButtonLink } from "@/components/ui/Button";
import { getLatest } from "@/lib/api";
import { MONTHS, firstName, formatDate, formatTime, shortPlace } from "@/lib/format";
import { JOURNEY, TONE, type JourneyStep, type StepKey } from "@/lib/journey";
import { HAND_SHAPES } from "@/lib/readings";
import type { AstrologyReading, NumerologyReport, PalmReading } from "@/types/readings";

type Saved = { numbers: NumerologyReport | null; stars: AstrologyReading | null; hand: PalmReading | null };
type StepState = "done" | "todo" | "locked" | "needs-place" | "needs-reading";

const STATE_TEXT: Record<StepState, string> = {
  done: "Ready",
  todo: "Not made yet",
  locked: "Premium",
  "needs-place": "Needs your birth place",
  "needs-reading": "Make a reading first",
};

function actionFor(step: JourneyStep, state: StepState): { href: string; label: string } {
  switch (state) {
    case "done":
      return { href: step.href, label: "Open" };
    case "locked":
      return { href: "/premium", label: "Unlock" };
    case "needs-place":
      return { href: "/me", label: "Add birth place" };
    case "needs-reading":
      return { href: "/numbers", label: "Start step 1" };
    default:
      return { href: step.href, label: step.key === "hand" ? "Add a photo" : "Make it" };
  }
}

function greetingFor(hour: number): string {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeView() {
  const user = useUser();
  const { isPremium } = useAuth();
  const [saved, setSaved] = useState<Saved | null>(null);

  useEffect(() => {
    let alive = true;
    const quiet = <T,>(p: Promise<T | null>) => p.catch(() => null);
    Promise.all([
      quiet(getLatest<NumerologyReport>("/numerology/latest")),
      quiet(getLatest<AstrologyReading>("/astrology/latest")),
      quiet(getLatest<PalmReading>("/palmistry/latest")),
    ]).then(([numbers, stars, hand]) => {
      if (alive) setSaved({ numbers, stars, hand });
    });
    return () => {
      alive = false;
    };
  }, []);

  const made = { numbers: Boolean(saved?.numbers), stars: Boolean(saved?.stars), hand: Boolean(saved?.hand) };
  const count = Object.values(made).filter(Boolean).length;

  function stateOf(step: JourneyStep): StepState {
    if (step.key === "numbers" || step.key === "stars" || step.key === "hand") {
      if (made[step.key]) return "done";
      if (step.key === "stars" && !user.placeOfBirth) return "needs-place";
      return "todo";
    }
    if (!isPremium) return "locked";
    return count > 0 ? "done" : "needs-reading";
  }
  const states = Object.fromEntries(JOURNEY.map((s) => [s.key, stateOf(s)])) as Record<StepKey, StepState>;
  const next = saved ? (JOURNEY.find((s) => states[s.key] !== "done")?.key ?? null) : null;

  const now = new Date();
  const today = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const message =
    count === 0 ? "Your path starts below. Begin with your numbers — it takes about a minute."
      : count < 3 ? `${count} of your 3 readings are ready. Your next step is waiting below.`
        : "All three readings are ready. Now see how they fit together.";

  const profile: ProfileData = {
    name: user.name,
    subtitle: [
      user.dateOfBirth && `Born ${formatDate(user.dateOfBirth)}`,
      user.timeOfBirth && !user.timeOfBirthUnknown && formatTime(user.timeOfBirth),
      user.placeOfBirth && shortPlace(user.placeOfBirth).split(",")[0],
    ].filter(Boolean).join(" · "),
    numbers: saved?.numbers ? {
      moolank: saved.numbers.components.moolank.number,
      bhagyank: saved.numbers.components.bhagyank.number,
      namank: saved.numbers.components.namank.number,
      year: saved.numbers.components.personal_year.number,
    } : null,
    stars: saved?.stars ? {
      sun: saved.stars.chart.sun_sign,
      moon: saved.stars.chart.moon_sign,
      rising: saved.stars.birth_time_unknown ? null : saved.stars.chart.lagna.sign,
      birthStar: saved.stars.chart.planets.Moon.nakshatra.name,
    } : null,
    hand: saved?.hand ? {
      element: String(saved.hand.analysis.geometry.element),
      detail: `${HAND_SHAPES[String(saved.hand.analysis.geometry.element)] ?? ""}, read from your ${saved.hand.hand} hand.`.replace(/^./, (c) => c.toUpperCase()),
    } : null,
  };

  return (
    <div className="flex flex-col gap-16">
      <header className="flex flex-col gap-4 rise-in">
        <p className="eyebrow text-ink-3">{greetingFor(now.getHours())} · {today}</p>
        <h1 className="text-6xl sm:text-7xl">Hello, <em>{firstName(user.name)}</em>.</h1>
        <p className="max-w-2xl text-xl leading-relaxed text-ink-2">{saved ? message : "Gathering your readings…"}</p>
      </header>

      {saved ? (
        <CosmicProfile data={profile} />
      ) : (
        <div className="night flex min-h-72 items-center justify-center rounded-[2rem] text-moon" role="status">
          <OrbitLoader />
          <span className="sr-only">Loading your profile</span>
        </div>
      )}

      <section aria-labelledby="path-title" className="flex flex-col">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink/80 pb-5">
          <h2 id="path-title" className="text-5xl sm:text-6xl">Your path</h2>
          <p className="eyebrow text-ink-3">{saved ? `${count} of 3 readings ready` : "Checking…"}</p>
        </div>
        <ol>
          {JOURNEY.map((step, i) => {
            const state = states[step.key];
            const isNext = next === step.key;
            const action = actionFor(step, state);
            return (
              <li key={step.key} className={`grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-4 border-b border-line py-8 sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:gap-x-8 ${isNext ? "relative" : ""}`}>
                <span className={`font-display text-5xl leading-none sm:text-6xl ${isNext ? "text-ink" : state === "done" ? TONE[step.tone].text : "text-ink/25"}`} aria-hidden="true">
                  {state === "done" ? <Check className="h-11 w-11" strokeWidth={1.5} /> : `0${i + 1}`}
                </span>
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-3xl sm:text-4xl">
                      <span className="sr-only">Step {i + 1}: </span>
                      {step.title}
                    </h3>
                    {isNext && <span className="eyebrow rounded-full bg-ink px-3 py-1.5 text-moon">Next</span>}
                  </div>
                  <p className="text-lg leading-relaxed text-ink-2">{step.what}</p>
                  {saved && (
                    <p className={`eyebrow flex items-center gap-2 ${state === "done" ? "text-good" : state === "locked" ? "text-story" : "text-ink-3"}`}>
                      {state === "locked" && <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
                      {STATE_TEXT[state]}
                      {step.module && state !== "done" && <span className="normal-case tracking-normal text-ink-3">· You need {step.needs.toLowerCase()}</span>}
                    </p>
                  )}
                </div>
                {saved && (
                  <ButtonLink
                    href={action.href}
                    variant={isNext ? "primary" : "secondary"}
                    size="lg"
                    className="col-span-2 w-full sm:col-span-1 sm:w-auto"
                    iconAfter={<ArrowRight className="h-5 w-5" aria-hidden="true" />}
                  >
                    {action.label}
                    <span className="sr-only"> – {step.title}</span>
                  </ButtonLink>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg text-ink-2">
          Readings use: <span className="text-ink">{user.name}, {formatDate(user.dateOfBirth)}{user.timeOfBirthUnknown || !user.timeOfBirth ? " (time not known)" : `, ${formatTime(user.timeOfBirth)}`}{user.placeOfBirth ? `, ${shortPlace(user.placeOfBirth)}` : ""}</span>.
        </p>
        <Link href="/me" className="eyebrow flex min-h-11 items-center gap-2 text-ink underline underline-offset-4">Change my details</Link>
      </section>
    </div>
  );
}
