"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import { BirthDateField, birthDateProblem, composeDate } from "@/components/forms/BirthDateField";
import { BirthTimeField, birthTimeProblem, partsFromTime, timeFromParts, type TimeParts } from "@/components/forms/BirthTimeField";
import { HandChoice } from "@/components/forms/HandChoice";
import { PlaceField } from "@/components/forms/PlaceField";
import { useUser, useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { INPUT_CLASS } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { firstName, formatDate, formatTime, shortPlace } from "@/lib/format";

type StepKey = "name" | "birthday" | "time" | "place" | "hand" | "check";
const QUESTIONS: StepKey[] = ["name", "birthday", "time", "place", "hand"];

export function SetupWizard() {
  const user = useUser();
  const { saveProfile } = useAuth();
  const router = useRouter();
  const heading = useRef<HTMLHeadingElement>(null);

  const [step, setStep] = useState<StepKey>("name");
  const [returnToCheck, setReturnToCheck] = useState(false);
  const [name, setName] = useState(user.name);
  const [dateParts, setDateParts] = useState(() => {
    const [y, m, d] = user.dateOfBirth ? user.dateOfBirth.split("-") : ["", "", ""];
    return { day: d ? String(Number(d)) : "", month: m ? String(Number(m)) : "", year: y ?? "" };
  });
  const [time, setTime] = useState<TimeParts>(() => partsFromTime(user.timeOfBirth, user.timeOfBirthUnknown));
  const [place, setPlace] = useState(user.placeOfBirth);
  const [hand, setHand] = useState<"left" | "right" | "">(user.onboarded ? user.dominantHand : "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dateOfBirth = composeDate(dateParts.day, dateParts.month, dateParts.year);
  const timeOfBirth = timeFromParts(time);
  const index = QUESTIONS.indexOf(step);

  function go(next: StepKey) {
    setError(null);
    setStep(next);
    // Move focus to the new question so screen readers announce it.
    requestAnimationFrame(() => heading.current?.focus());
  }

  function problemFor(current: StepKey): string | null {
    switch (current) {
      case "name":
        return name.trim() ? null : "Please type your name.";
      case "birthday":
        return birthDateProblem(dateParts.day, dateParts.month, dateParts.year);
      case "time":
        return birthTimeProblem(time);
      case "place":
        return place.trim() ? null : "Please search for your birth place and tap it.";
      case "hand":
        return hand ? null : "Please tap the hand you write with.";
      default:
        return null;
    }
  }

  function next(event: FormEvent) {
    event.preventDefault();
    const problem = problemFor(step);
    if (problem) {
      setError(problem);
      return;
    }
    if (returnToCheck) {
      setReturnToCheck(false);
      go("check");
      return;
    }
    go(QUESTIONS[index + 1] ?? "check");
  }

  function back() {
    if (step === "check") go("hand");
    else if (index > 0) go(QUESTIONS[index - 1]);
  }

  function edit(target: StepKey) {
    setReturnToCheck(true);
    go(target);
  }

  async function finish() {
    setSaving(true);
    const result = await saveProfile({
      name: name.trim(),
      dateOfBirth,
      timeOfBirth,
      timeOfBirthUnknown: time.unknown,
      placeOfBirth: place.trim(),
      dominantHand: hand || "right",
      onboarded: true,
    });
    setSaving(false);
    if (result.ok) router.replace("/home");
    else setError(result.error);
  }

  const questionView: Record<Exclude<StepKey, "check">, { title: string; hint: ReactNode; body: ReactNode }> = {
    name: {
      title: "What is your full name?",
      hint: "Spell it the way you usually write it. Your name number comes from these letters.",
      body: (
        <input
          aria-label="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className={INPUT_CLASS}
          placeholder="e.g. Priya Sharma"
        />
      ),
    },
    birthday: {
      title: "When is your birthday?",
      hint: "The day, month and year you were born.",
      body: <BirthDateField initial={dateOfBirth} onChange={setDateParts} />,
    },
    time: {
      title: "What time were you born?",
      hint: "It is often on the birth certificate. Not sure? That’s fine, just press the button below.",
      body: <BirthTimeField initial={time} onChange={setTime} />,
    },
    place: {
      title: "Where were you born?",
      hint: "Type the town or city, press Search, then tap the right one.",
      body: <PlaceField initial={place} onChange={setPlace} />,
    },
    hand: {
      title: "Which hand do you write with?",
      hint: "We read this hand first in your palm reading. You can change it later.",
      body: <HandChoice value={hand} onChange={setHand} label="The hand you write with" />,
    },
  };

  if (step === "check") {
    const rows: Array<{ key: StepKey; label: string; value: string }> = [
      { key: "name", label: "Name", value: name.trim() },
      { key: "birthday", label: "Birthday", value: formatDate(dateOfBirth) },
      { key: "time", label: "Birth time", value: time.unknown ? "I don’t know" : formatTime(timeOfBirth) },
      { key: "place", label: "Birth place", value: shortPlace(place) },
      { key: "hand", label: "Writing hand", value: hand === "left" ? "Left hand" : "Right hand" },
    ];
    return (
      <div className="flex flex-col gap-7 rise-in">
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold text-good">All questions answered</p>
          <h1 ref={heading} tabIndex={-1} className="text-3xl font-semibold outline-none sm:text-4xl">
            Is this right, {firstName(name)}?
          </h1>
          <p className="text-lg text-ink-2">Check your answers. Tap “Change” to fix anything.</p>
        </div>
        <dl className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface">
          {rows.map((row) => (
            <div key={row.key} className="flex items-center gap-4 px-5 py-4">
              <div className="flex min-w-0 flex-1 flex-col">
                <dt className="text-base text-ink-2">{row.label}</dt>
                <dd className="text-xl font-semibold">{row.value}</dd>
              </div>
              <Button variant="secondary" onClick={() => edit(row.key)} icon={<Pencil className="h-4 w-4" aria-hidden="true" />}>
                Change<span className="sr-only"> {row.label.toLowerCase()}</span>
              </Button>
            </div>
          ))}
        </dl>
        {error && <Notice tone="error">{error}</Notice>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button variant="secondary" size="lg" onClick={back} icon={<ArrowLeft className="h-5 w-5" aria-hidden="true" />}>Back</Button>
          <Button size="lg" onClick={finish} busy={saving} busyText="Saving…">
            Yes, that’s right
          </Button>
        </div>
      </div>
    );
  }

  const view = questionView[step];
  return (
    <form onSubmit={next} noValidate className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <p className="text-lg font-semibold text-ink-2">
          Question {index + 1} of {QUESTIONS.length}
        </p>
        <div className="flex gap-1.5" aria-hidden="true">
          {QUESTIONS.map((q, i) => (
            <span key={q} className={`h-2 flex-1 rounded-full ${i <= index ? "bg-ink" : "bg-line"}`} />
          ))}
        </div>
      </div>
      <div key={step} className="flex flex-col gap-5 rise-in">
        <div className="flex flex-col gap-2">
          <h1 ref={heading} tabIndex={-1} className="text-3xl font-semibold outline-none sm:text-4xl">{view.title}</h1>
          <p className="text-lg text-ink-2">{view.hint}</p>
        </div>
        {view.body}
        {error && <Notice tone="error">{error}</Notice>}
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {index > 0 ? (
          <Button variant="secondary" size="lg" onClick={back} icon={<ArrowLeft className="h-5 w-5" aria-hidden="true" />}>Back</Button>
        ) : <span />}
        <Button type="submit" size="lg">
          {returnToCheck ? "Done" : "Next"}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
