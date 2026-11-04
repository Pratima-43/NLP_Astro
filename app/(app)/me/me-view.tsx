"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Crown, LogOut, Trash2 } from "lucide-react";
import { BirthDateField, birthDateProblem, composeDate } from "@/components/forms/BirthDateField";
import { BirthTimeField, birthTimeProblem, partsFromTime, timeFromParts, type TimeParts } from "@/components/forms/BirthTimeField";
import { HandChoice } from "@/components/forms/HandChoice";
import { PlaceField } from "@/components/forms/PlaceField";
import { useAuth, useUser } from "@/components/providers/AuthProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PasswordField, TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { PasswordRules, passwordProblems } from "@/components/ui/PasswordRules";
import { TextSizeChoice } from "@/components/ui/TextSizeMenu";
import { formatDate } from "@/lib/format";

function Card({ title, subtitle, children, id }: { title: string; subtitle?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <h2 id={id} className="text-2xl font-semibold">{title}</h2>
        {subtitle && <p className="text-lg text-ink-2">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export function MeView() {
  const user = useUser();
  const { signOut, isPremium } = useAuth();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold">Me</h1>
        <p className="text-xl text-ink-2">Signed in as <strong className="text-ink">{user.email}</strong></p>
      </header>

      <DetailsCard />

      <Card id="comfort" title="Text size" subtitle="Make all the words bigger or smaller. This is saved on this device.">
        <TextSizeChoice />
      </Card>

      <Card id="premium" title="Premium">
        {isPremium ? (
          <p className="flex items-center gap-3 text-lg">
            <Crown className="h-6 w-6 text-story" aria-hidden="true" />
            <span>{user.premium.plan}{user.premium.expiresAt ? `, until ${formatDate(user.premium.expiresAt)}` : ""}.</span>
          </p>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg text-ink-2">Not on yet. Premium adds your Full Story and Ask a Question.</p>
            <ButtonLink href="/premium" iconAfter={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>Unlock Premium</ButtonLink>
          </div>
        )}
      </Card>

      <EmailCard />

      {user.hasPassword && <PasswordCard />}

      <Card id="signout" title="Sign out" subtitle="You can sign in again any time. Your readings are saved.">
        <Button variant="secondary" size="lg" onClick={signOut} className="self-start" icon={<LogOut className="h-5 w-5" aria-hidden="true" />}>Sign out</Button>
      </Card>

      <DeleteCard />

      <p className="text-center text-base text-ink-2">
        <Link href="/privacy" className="underline">Privacy</Link> · <Link href="/terms" className="underline">Terms</Link> · <Link href="/about" className="underline">About AstroVerse</Link>
      </p>
    </div>
  );
}

function DetailsCard() {
  const user = useUser();
  const { saveProfile } = useAuth();
  const [name, setName] = useState(user.name);
  const [dateParts, setDateParts] = useState(() => {
    const [y, m, d] = user.dateOfBirth ? user.dateOfBirth.split("-") : ["", "", ""];
    return { day: d ? String(Number(d)) : "", month: m ? String(Number(m)) : "", year: y ?? "" };
  });
  const [time, setTime] = useState<TimeParts>(() => partsFromTime(user.timeOfBirth, user.timeOfBirthUnknown));
  const [place, setPlace] = useState(user.placeOfBirth);
  const [hand, setHand] = useState<"left" | "right">(user.dominantHand);
  const [errors, setErrors] = useState<Partial<Record<"name" | "date" | "time" | "place" | "form", string>>>({});
  const [saved, setSaved] = useState<"none" | "same" | "birth">("none");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found: typeof errors = {};
    if (!name.trim()) found.name = "Please type your name.";
    const dateProblem = birthDateProblem(dateParts.day, dateParts.month, dateParts.year);
    if (dateProblem) found.date = dateProblem;
    const timeProblem = birthTimeProblem(time);
    if (timeProblem) found.time = timeProblem;
    if (!place.trim()) found.place = "Please search for your birth place and tap it.";
    setErrors(found);
    setSaved("none");
    if (Object.keys(found).length) return;

    const update = {
      name: name.trim(),
      dateOfBirth: composeDate(dateParts.day, dateParts.month, dateParts.year),
      timeOfBirth: timeFromParts(time),
      timeOfBirthUnknown: time.unknown,
      placeOfBirth: place.trim(),
      dominantHand: hand,
    };
    const birthChanged = update.name !== user.name || update.dateOfBirth !== user.dateOfBirth || update.timeOfBirth !== user.timeOfBirth
      || update.timeOfBirthUnknown !== user.timeOfBirthUnknown || update.placeOfBirth !== user.placeOfBirth;
    setBusy(true);
    const result = await saveProfile(update);
    setBusy(false);
    if (result.ok) setSaved(birthChanged ? "birth" : "same");
    else setErrors({ form: result.error });
  }

  return (
    <Card id="details" title="Your details" subtitle="We use these for your readings.">
      <form onSubmit={submit} noValidate className="flex flex-col gap-7">
        <TextField label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold">Birthday</p>
          <BirthDateField initial={user.dateOfBirth} onChange={setDateParts} error={errors.date} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold">Birth time</p>
          <BirthTimeField initial={time} onChange={setTime} error={errors.time} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold">Birth place</p>
          <PlaceField initial={user.placeOfBirth} onChange={setPlace} error={errors.place} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold">The hand you write with</p>
          <HandChoice value={hand} onChange={setHand} label="The hand you write with" />
        </div>
        {errors.form && <Notice tone="error">{errors.form}</Notice>}
        {saved === "same" && <Notice tone="success">Saved.</Notice>}
        {saved === "birth" && (
          <Notice tone="success" title="Saved" action={
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/numbers" variant="secondary">Your Numbers</ButtonLink>
              <ButtonLink href="/stars" variant="secondary">Your Stars</ButtonLink>
            </div>
          }>
            Your old readings still use your old details. Open them and press “Make it again” to use the new ones.
          </Notice>
        )}
        <Button type="submit" size="lg" busy={busy} busyText="Saving…" className="self-start">Save my details</Button>
      </form>
    </Card>
  );
}

function EmailCard() {
  const user = useUser();
  const { saveProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const on = user.notificationPrefs.security_emails;

  async function toggle() {
    setBusy(true);
    setError("");
    const result = await saveProfile({ notificationPrefs: { ...user.notificationPrefs, security_emails: !on } });
    setBusy(false);
    if (!result.ok) setError(result.error);
  }

  return (
    <Card id="emails" title="Emails">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span id="security-email-label" className="text-lg font-semibold">Tell me if my password changes</span>
          <span className="text-base text-ink-2">A safety email, so you know if it wasn’t you.</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-labelledby="security-email-label"
          disabled={busy}
          onClick={toggle}
          className={`relative flex h-10 w-[4.5rem] shrink-0 items-center rounded-full border-2 transition-colors ${on ? "border-good bg-good" : "border-line-2 bg-line"}`}
        >
          <span className={`absolute h-7 w-7 rounded-full bg-white shadow transition-transform ${on ? "translate-x-[2.1rem]" : "translate-x-1"}`} />
          <span className="sr-only">{on ? "On" : "Off"}</span>
        </button>
      </div>
      <p className="text-base font-semibold">{on ? "On" : "Off"}</p>
      {error && <Notice tone="error">{error}</Notice>}
    </Card>
  );
}

function PasswordCard() {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setDone(false);
    if (!current) {
      setError("Please type your current password.");
      return;
    }
    if (passwordProblems(next).length) {
      setError("Your new password needs at least 8 characters, with letters and numbers.");
      return;
    }
    setError("");
    setBusy(true);
    const result = await changePassword(current, next);
    setBusy(false);
    if (result.ok) {
      setDone(true);
      setCurrent("");
      setNext("");
    } else setError(result.error);
  }

  return (
    <Card id="password" title="Change password" subtitle="Changing it signs you out on your other devices.">
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <PasswordField label="Current password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <PasswordField label="New password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        <PasswordRules password={next} />
        {error && <Notice tone="error">{error}</Notice>}
        {done && <Notice tone="success">Your password is changed.</Notice>}
        <Button type="submit" size="lg" variant="secondary" busy={busy} busyText="Saving…" className="self-start">Change my password</Button>
      </form>
    </Card>
  );
}

function DeleteCard() {
  const user = useUser();
  const { deleteAccount } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (confirm.trim().toUpperCase() !== "DELETE") {
      setError("To be sure, please type the word DELETE in the box.");
      return;
    }
    setError("");
    setBusy(true);
    const result = await deleteAccount(password);
    setBusy(false);
    // On success the account is gone and the app returns to the start page by itself.
    if (!result.ok) setError(result.error);
  }

  return (
    <details className="rounded-3xl border-2 border-bad/30 bg-surface">
      <summary className="flex min-h-16 items-center gap-3 px-6 text-xl font-semibold text-bad">
        <Trash2 className="h-6 w-6" aria-hidden="true" />
        Delete my account
      </summary>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5 border-t border-line px-6 py-6">
        <p className="text-lg">This deletes your details, all your readings, your questions and your full story. <strong>It can’t be undone.</strong></p>
        {user.hasPassword && (
          <PasswordField label="Your password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        )}
        <TextField label="Type DELETE to confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
        {error && <Notice tone="error">{error}</Notice>}
        <Button type="submit" variant="danger" size="lg" busy={busy} busyText="Deleting…" className="self-start" icon={<Trash2 className="h-5 w-5" aria-hidden="true" />}>
          Delete my account forever
        </Button>
      </form>
    </details>
  );
}
