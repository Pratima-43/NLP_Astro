"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { BookOpen, KeyRound, MessageCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";

export const DEMO_CODE = "ASTROFREE";

/** Type a code, press Unlock. */
export function UnlockForm({ onUnlocked }: { onUnlocked?: () => void }) {
  const { redeemCode } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!code.trim()) {
      setError("Please type your code.");
      return;
    }
    setError("");
    setBusy(true);
    const result = await redeemCode(code.trim());
    setBusy(false);
    if (result.ok) onUnlocked?.();
    else setError(result.error);
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <TextField
        label="Your code"
        hint={<>Trying AstroVerse? Use the code <strong className="font-bold text-ink">{DEMO_CODE}</strong> for a free year.</>}
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        autoCapitalize="characters"
        autoComplete="off"
        error={error}
        placeholder="e.g. ASTROFREE"
      />
      <Button type="submit" size="lg" busy={busy} busyText="Unlocking…" icon={<KeyRound className="h-5 w-5" aria-hidden="true" />}>
        Unlock Premium
      </Button>
    </form>
  );
}

/** Premium pages show this instead of their content until Premium is on. */
export function PremiumGate({ title, children }: { title: string; children: ReactNode }) {
  const { isPremium } = useAuth();
  if (isPremium) return <>{children}</>;
  return (
    <section className="grid gap-8 rounded-[2rem] border border-line bg-surface p-6 sm:p-10 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <h2 className="text-4xl">{title} is part of Premium</h2>
        <p className="text-lg text-ink-2">Premium puts your three readings together. It adds two things:</p>
        <ul className="flex flex-col gap-3">
          <li className="flex gap-3 text-lg">
            <BookOpen className="mt-1 h-6 w-6 shrink-0 text-story" aria-hidden="true" />
            <span><strong>Your Full Story:</strong> all three readings side by side, topic by topic, with where they agree.</span>
          </li>
          <li className="flex gap-3 text-lg">
            <MessageCircle className="mt-1 h-6 w-6 shrink-0 text-ask" aria-hidden="true" />
            <span><strong>Ask a Question:</strong> ask anything in your own words and get answers from your readings.</span>
          </li>
        </ul>
      </div>
      <div className="flex flex-col gap-4 rounded-2xl bg-paper p-5 sm:p-6">
        <UnlockForm />
        <Notice tone="info">No payment is needed right now. Premium is unlocked with a code.</Notice>
      </div>
    </section>
  );
}
