"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/layout/AuthCard";
import { PageLoader } from "@/components/layout/AccountGates";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { PasswordRules, passwordProblems } from "@/components/ui/PasswordRules";
import { apiFetch } from "@/lib/api";
import { getSupabase, supabaseEnabled } from "@/lib/supabase";

type LinkState = { status: "checking" } | { status: "valid"; hint?: string } | { status: "invalid"; reason?: string };

/** Supabase reports a dead link in the URL fragment, e.g. #error_code=otp_expired&error_description=… */
function fragmentError(): string | null {
  if (typeof window === "undefined" || !window.location.hash.includes("error")) return null;
  const params = new URLSearchParams(window.location.hash.slice(1));
  return params.get("error_description")?.replace(/\+/g, " ") ?? "This reset link has expired or was already used.";
}

export function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  // AstroVerse links carry ?token=; Supabase email-template links carry ?token_hash=.
  const token = params.get("token") ?? params.get("token_hash") ?? "";
  const { resetPassword } = useAuth();
  const [link, setLink] = useState<LinkState>(() => {
    const dead = fragmentError();
    if (dead) return { status: "invalid", reason: dead };
    if (supabaseEnabled) return token ? { status: "valid" } : { status: "checking" };
    return token ? { status: "checking" } : { status: "invalid" };
  });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (link.status !== "checking") return;
    if (supabaseEnabled) {
      // Older Supabase links sign the user in from the URL fragment; without that session the link can't be used.
      const supabase = getSupabase()!;
      let settled = false;
      const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
        if (!settled && session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN")) {
          settled = true;
          setLink({ status: "valid" });
        }
      });
      supabase.auth.getSession().then(({ data }) => {
        if (settled) return;
        settled = true;
        setLink(data.session ? { status: "valid" } : { status: "invalid", reason: "Please open the reset link from your email." });
      });
      return () => subscription.subscription.unsubscribe();
    }
    apiFetch<{ valid: boolean; email_hint?: string }>(`/auth/password/reset/${encodeURIComponent(token)}`)
      .then((r) => setLink(r.valid ? { status: "valid", hint: r.email_hint } : { status: "invalid" }))
      .catch(() => setLink({ status: "invalid" }));
  }, [link.status, token]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (passwordProblems(password).length) {
      setError("Your new password needs at least 8 characters, with letters and numbers.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords are different. Please type the same password twice.");
      return;
    }
    setError("");
    setBusy(true);
    const result = await resetPassword(token, password);
    setBusy(false);
    if (result.ok) router.replace("/home");
    else setError(result.error);
  }

  if (link.status === "checking") return <PageLoader label="Checking your link…" />;

  if (link.status === "invalid") {
    return (
      <AuthCard title="This link doesn’t work any more" subtitle={link.reason ?? "Reset links work once and expire after 30 minutes."}>
        <ButtonLink href="/forgot-password" size="lg">Send me a new link</ButtonLink>
        <Link href="/login" className="self-center text-lg font-semibold text-ink underline underline-offset-4">Back to sign in</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      subtitle={link.hint ? <>For the account <strong className="text-ink">{link.hint}</strong>.</> : "You’ll be signed in straight after."}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <PasswordField label="New password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <PasswordRules password={password} />
        <PasswordField label="Type it again" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {error && <Notice tone="error">{error}</Notice>}
        <Button type="submit" size="lg" busy={busy} busyText="Saving…">Save my new password</Button>
      </form>
    </AuthCard>
  );
}
