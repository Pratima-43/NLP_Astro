"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthCard } from "@/components/layout/AuthCard";
import { RedirectIfSignedIn } from "@/components/layout/AccountGates";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { PasswordField, TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";

export function LoginForm() {
  const { signIn, signedOutReason } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Please type your email and your password.");
      return;
    }
    setError("");
    setBusy(true);
    const result = await signIn(email.trim(), password);
    setBusy(false);
    // On success the page moves on by itself (see RedirectIfSignedIn).
    if (!result.ok) setError(result.error);
  }

  return (
    <RedirectIfSignedIn>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to see your readings."
        footer={<>New here? <Link href="/signup" className="font-semibold text-ink underline underline-offset-4">Create a free account</Link></>}
      >
        {signedOutReason === "expired" && (
          <Notice tone="info" title="Please sign in again">For your safety, you were signed out. Your readings are saved.</Notice>
        )}
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <TextField label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <PasswordField label="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <Notice tone="error">{error}</Notice>}
          <Button type="submit" size="lg" busy={busy} busyText="Signing in…">Sign in</Button>
          <Link href="/forgot-password" className="self-center rounded-lg px-2 py-2 text-lg font-semibold text-ink underline underline-offset-4">
            Forgot your password?
          </Link>
        </form>
      </AuthCard>
    </RedirectIfSignedIn>
  );
}
