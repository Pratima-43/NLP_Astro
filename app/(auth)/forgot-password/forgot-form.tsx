"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthCard } from "@/components/layout/AuthCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";

export function ForgotForm() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please type the email address you signed up with.");
      return;
    }
    setError("");
    setBusy(true);
    const result = await requestPasswordReset(email.trim());
    setBusy(false);
    if (result.ok) setSent(result.message ?? "If an account uses that email, a reset link is on its way.");
    else setError(result.error);
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="No problem. We’ll email you a link to choose a new one."
      footer={<Link href="/login" className="font-semibold text-ink underline underline-offset-4">Back to sign in</Link>}
    >
      {sent ? (
        <Notice tone="success" title="Check your email">
          {sent} The link works once. If you don’t see the email, look in your spam folder.
        </Notice>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <TextField label="Your email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} placeholder="you@example.com" />
          <Button type="submit" size="lg" busy={busy} busyText="Sending…">Email me a reset link</Button>
        </form>
      )}
    </AuthCard>
  );
}
