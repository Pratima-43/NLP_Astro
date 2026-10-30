"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { apiFetch } from "@/lib/api";
import { supabaseEnabled } from "@/lib/supabase";
import { AuthShell, authInputClass } from "@/components/auth/AuthShell";

type LinkState = { status: "checking" } | { status: "valid"; hint?: string } | { status: "invalid" };

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const { resetPassword } = useApp();
  // Supabase links sign the user in through the URL fragment, so there is no token to pre-check.
  const [link, setLink] = useState<LinkState>(() => (supabaseEnabled ? { status: "valid" } : token ? { status: "checking" } : { status: "invalid" }));
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (supabaseEnabled || !token) return;
    apiFetch<{ valid: boolean; email_hint?: string }>(`/auth/password/reset/${encodeURIComponent(token)}`)
      .then((r) => setLink(r.valid ? { status: "valid", hint: r.email_hint } : { status: "invalid" }))
      .catch(() => setLink({ status: "invalid" }));
  }, [token]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return setError("Use both letters and numbers.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setSubmitting(true);
    setError("");
    const result = await resetPassword(token, password);
    setSubmitting(false);
    if (!result.ok) return setError(result.error);
    router.replace("/dashboard");
  }

  if (link.status === "checking") {
    return <div className="flex justify-center py-6"><div className="w-7 h-7 border-2 border-[#C6A15B] border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (link.status === "invalid") {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-[#252525]">This reset link is invalid or has expired. Links work once and only for a limited time.</p>
        <Link href="/forgot-password" className="inline-block px-5 py-2.5 rounded-lg bg-[#C6A15B] text-white text-sm font-medium hover:bg-[#9E7938]">Request a new link</Link>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {link.hint && <p className="text-xs text-center text-[#77736B]">Resetting the password for <span className="font-semibold text-[#252525]">{link.hint}</span></p>}
      {[["New password", password, setPassword, "new-password"], ["Confirm new password", confirm, setConfirm, "new-password"]].map(([label, value, set, auto]) => (
        <div key={label as string}>
          <label className="block text-xs font-semibold text-[#171B2D] mb-1.5">{label as string}</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#77736B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type={show ? "text" : "password"} autoComplete={auto as string} value={value as string}
              onChange={(e) => (set as (v: string) => void)(e.target.value)} className={`${authInputClass} pr-11`} />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide passwords" : "Show passwords"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77736B] hover:text-[#C6A15B]">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
          </div>
        </div>
      ))}
      <p className="text-[11px] text-[#77736B]">At least 8 characters, with letters and numbers. Other devices will be signed out.</p>
      {error && <p role="alert" className="text-xs text-[#C45B5B]">{error}</p>}
      <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-[#C6A15B] text-white font-semibold text-sm shadow-md hover:bg-[#9E7938] transition-colors disabled:opacity-60">
        {submitting ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password" subtitle="You'll be signed in as soon as it's saved.">
      <Suspense fallback={<div className="h-24" />}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
