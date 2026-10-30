"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { AuthShell, authInputClass } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useApp();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) { setError("Enter the email you signed up with."); return; }
    setSubmitting(true);
    setError("");
    const result = await requestPasswordReset(email.trim());
    setSubmitting(false);
    if (!result.ok) setError(result.error);
    else setSent(result.message ?? "Check your inbox for the reset link.");
  }

  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your email and we'll send you a link to choose a new one.">
      {sent ? (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#4A7C59]/10 flex items-center justify-center mx-auto"><CheckCircle2 className="w-6 h-6 text-[#4A7C59]" /></div>
          <p className="text-sm text-[#252525]">{sent}</p>
          <p className="text-xs text-[#77736B]">No email after a few minutes? Check spam, or try again.</p>
          <div className="flex justify-center gap-3 pt-2">
            <button onClick={() => setSent(null)} className="px-4 py-2 rounded-lg border border-[#E8DFCF] text-sm text-[#77736B] hover:bg-[#FAF7F0]">Send again</button>
            <Link href="/login" className="px-4 py-2 rounded-lg bg-[#C6A15B] text-white text-sm font-medium hover:bg-[#9E7938]">Back to sign in</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-[#171B2D] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#77736B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input id="email" type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={authInputClass} />
            </div>
          </div>
          {error && <p role="alert" className="text-xs text-[#C45B5B]">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl bg-[#C6A15B] text-white font-semibold text-sm shadow-md hover:bg-[#9E7938] transition-colors disabled:opacity-60">
            {submitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
