"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthCard } from "@/components/layout/AuthCard";
import { RedirectIfSignedIn } from "@/components/layout/AccountGates";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { PasswordField, TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { PasswordRules, passwordProblems } from "@/components/ui/PasswordRules";

type Errors = Partial<Record<"name" | "email" | "password" | "form", string>>;

export function SignupForm() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found: Errors = {};
    if (!name.trim()) found.name = "Please type your name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) found.email = "Please type a full email address, like name@example.com.";
    if (passwordProblems(password).length) found.password = "Your password needs at least 8 characters, with letters and numbers.";
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    const result = await signUp(name.trim(), email.trim(), password);
    setBusy(false);
    if (!result.ok) setErrors({ form: result.error });
  }

  return (
    <RedirectIfSignedIn>
      <AuthCard
        title="Create your free account"
        subtitle="Three quick boxes, then we’ll ask about your birthday."
        footer={<>Already have an account? <Link href="/login" className="font-semibold text-ink underline underline-offset-4">Sign in</Link></>}
      >
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <TextField label="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="e.g. Priya Sharma" />
          <TextField label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@example.com" />
          <PasswordField label="Choose a password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
          <PasswordRules password={password} />
          {errors.form && <Notice tone="error">{errors.form}</Notice>}
          <Button type="submit" size="lg" busy={busy} busyText="Creating your account…">Create my account</Button>
          <p className="text-base text-ink-2">
            By creating an account you agree to our <Link href="/terms" className="font-semibold text-ink underline">Terms</Link> and{" "}
            <Link href="/privacy" className="font-semibold text-ink underline">Privacy Policy</Link>.
          </p>
        </form>
      </AuthCard>
    </RedirectIfSignedIn>
  );
}
