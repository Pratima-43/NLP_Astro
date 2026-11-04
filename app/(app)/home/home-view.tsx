"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, CircleCheck, Lock, MapPin, Pencil } from "lucide-react";
import { useAuth, useUser } from "@/components/providers/AuthProvider";
import { ButtonLink } from "@/components/ui/Button";
import { IconBadge } from "@/components/ui/IconBadge";
import { Notice } from "@/components/ui/Notice";
import { Spinner } from "@/components/ui/Spinner";
import { apiFetch } from "@/lib/api";
import { firstName, formatDate, formatTime, shortPlace } from "@/lib/format";
import { JOURNEY, TONE, type JourneyStep, type StepKey } from "@/lib/journey";
import type { IntegrationStatus } from "@/types/readings";

type StepState = "loading" | "done" | "todo" | "locked" | "needs-place" | "needs-reading";

const STATE_PILL: Record<Exclude<StepState, "loading">, { text: string; className: string; icon?: typeof Check }> = {
  done: { text: "Ready", className: "bg-good-soft text-[#14532d]", icon: CircleCheck },
  todo: { text: "Not made yet", className: "bg-paper text-ink-2" },
  locked: { text: "Premium", className: "bg-story-soft text-story-ink", icon: Lock },
  "needs-place": { text: "Needs your birth place", className: "bg-care-soft text-[#7c2d12]", icon: MapPin },
  "needs-reading": { text: "Make a reading first", className: "bg-paper text-ink-2" },
};

function actionFor(step: JourneyStep, state: StepState): { href: string; label: string } {
  switch (state) {
    case "done":
      return { href: step.href, label: step.premium ? "Open" : "See my reading" };
    case "locked":
      return { href: "/premium", label: "Unlock" };
    case "needs-place":
      return { href: "/me", label: "Add birth place" };
    case "needs-reading":
      return { href: "/numbers", label: "Start with Step 1" };
    default:
      return { href: step.href, label: step.key === "hand" ? "Add a palm photo" : "Make it now" };
  }
}

export function HomeView() {
  const user = useUser();
  const { isPremium } = useAuth();
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    apiFetch<IntegrationStatus>("/integration/status")
      .then((s) => {
        if (alive) setStatus(s);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const made: Record<"numbers" | "stars" | "hand", boolean> = {
    numbers: Boolean(status?.numerology.available),
    stars: Boolean(status?.astrology.available),
    hand: Boolean(status?.palmistry.available),
  };
  const count = Object.values(made).filter(Boolean).length;

  function stateOf(step: JourneyStep): StepState {
    if (!status) return failed ? "todo" : "loading";
    if (step.key === "numbers" || step.key === "stars" || step.key === "hand") {
      if (made[step.key]) return "done";
      if (step.key === "stars" && !user.placeOfBirth) return "needs-place";
      return "todo";
    }
    if (!isPremium) return "locked";
    return count > 0 ? "done" : "needs-reading";
  }

  const states = Object.fromEntries(JOURNEY.map((s) => [s.key, stateOf(s)])) as Record<StepKey, StepState>;
  const recommended: StepKey | null = status
    ? (JOURNEY.find((s) => states[s.key] !== "done")?.key ?? null)
    : null;

  const greeting =
    count === 0 ? "Let’s make your first reading. Start with step 1 below."
      : count < 3 ? `You have ${count} of 3 readings. Keep going with the next step.`
        : "All three readings are ready. Now see how they fit together.";

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold sm:text-5xl">Hello, {firstName(user.name)}</h1>
        <p className="text-xl text-ink-2">{status ? greeting : "Here is your path. Follow the steps in order."}</p>
      </section>

      <section aria-label="Your readings so far" className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <p className="text-lg font-semibold">
          {status ? `${count} of 3 readings ready` : "Checking your readings…"}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {JOURNEY.filter((s) => s.module).map((s) => {
            const done = made[s.key as "numbers" | "stars" | "hand"];
            return (
              <div key={s.key} className="flex flex-col gap-2">
                <span className={`h-3 rounded-full ${done ? TONE[s.tone].solid : "bg-line"}`} aria-hidden="true" />
                <span className={`flex items-center gap-1.5 text-base ${done ? "font-semibold text-ink" : "text-ink-2"}`}>
                  {done && <Check className="h-4 w-4" aria-hidden="true" />}
                  {s.short}
                  <span className="sr-only">{done ? "(ready)" : "(not made yet)"}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {failed && (
        <Notice tone="warning" title="We couldn’t check your readings">
          Your steps are still below. If a reading doesn’t open, please try again in a moment.
        </Notice>
      )}

      <section aria-labelledby="path-title" className="flex flex-col gap-4">
        <h2 id="path-title" className="text-2xl font-semibold sm:text-3xl">Your path</h2>
        <ol className="flex flex-col">
          {JOURNEY.map((step, i) => {
            const state = states[step.key];
            const isNext = recommended === step.key;
            const last = i === JOURNEY.length - 1;
            const action = actionFor(step, state);
            const pill = state === "loading" ? null : STATE_PILL[state];
            return (
              <li key={step.key} className="flex gap-3 sm:gap-5">
                <div className="flex flex-col items-center" aria-hidden="true">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-lg font-semibold ${state === "done" ? "bg-good text-white" : isNext ? "bg-ink text-white" : "border-2 border-line-2 bg-surface text-ink-2"}`}
                  >
                    {state === "done" ? <Check className="h-6 w-6" /> : i + 1}
                  </span>
                  {!last && <span className="w-0.5 flex-1 bg-line-2" />}
                </div>
                <article className={`mb-4 flex min-w-0 flex-1 flex-col gap-4 rounded-3xl border bg-surface p-5 sm:flex-row sm:items-center sm:p-6 ${isNext ? "border-ink shadow-[0_0_0_2px_var(--color-ink)]" : "border-line"}`}>
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <IconBadge icon={step.icon} tone={step.tone} />
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold sm:text-2xl">
                          <span className="sr-only">Step {i + 1}: </span>
                          {step.title}
                        </h3>
                        {isNext && <span className="rounded-full bg-ink px-3 py-0.5 text-sm font-semibold text-white">Do this next</span>}
                      </div>
                      <p className="text-lg text-ink-2">{step.what}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {state === "loading" ? (
                          <span className="flex items-center gap-2 text-base text-ink-2"><Spinner className="h-4 w-4" />Checking…</span>
                        ) : pill && (
                          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold ${pill.className}`}>
                            {pill.icon && <pill.icon className="h-4 w-4" aria-hidden="true" />}
                            {pill.text}
                          </span>
                        )}
                        {step.module && state !== "done" && <span className="text-base text-ink-2">You need: {step.needs.toLowerCase()}</span>}
                      </div>
                    </div>
                  </div>
                  {state !== "loading" && (
                    <ButtonLink
                      href={action.href}
                      variant={isNext ? "primary" : "secondary"}
                      size="lg"
                      className="w-full shrink-0 sm:w-auto"
                      iconAfter={<ArrowRight className="h-5 w-5" aria-hidden="true" />}
                    >
                      {action.label}
                      <span className="sr-only"> – {step.title}</span>
                    </ButtonLink>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="details-title" className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 id="details-title" className="text-xl font-semibold">The details we use</h2>
          <p className="text-lg text-ink-2">
            {user.name}, born {formatDate(user.dateOfBirth)}
            {user.timeOfBirthUnknown || !user.timeOfBirth ? " (time not known)" : ` at ${formatTime(user.timeOfBirth)}`}
            {user.placeOfBirth ? ` in ${shortPlace(user.placeOfBirth)}` : ""}. Writes with the {user.dominantHand} hand.
          </p>
        </div>
        <Link href="/me" className="flex min-h-12 shrink-0 items-center gap-2 rounded-xl px-3 text-lg font-semibold text-ink underline-offset-4 hover:underline">
          <Pencil className="h-5 w-5" aria-hidden="true" />
          Change
        </Link>
      </section>
    </div>
  );
}
