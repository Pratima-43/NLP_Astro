"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CloudOff } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

/** A planet circling its orbit, with a short message. */
export function OrbitLoader({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="6" fill="#c58a2c" />
      <g className="orbit-fast">
        <circle cx="58" cy="32" r="3.6" fill="currentColor" />
      </g>
    </svg>
  );
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center text-ink" role="status" aria-live="polite">
      <OrbitLoader />
      <p className="eyebrow text-ink-2">{label}</p>
    </div>
  );
}

function CannotConnect({ problem, onRetry }: { problem: string; onRetry: () => void }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-5 px-4 text-center">
      <CloudOff className="h-14 w-14 text-ink-2" aria-hidden="true" />
      <h1 className="text-5xl">We can’t connect right now</h1>
      <p className="text-lg text-ink-2">{problem}</p>
      <Button size="lg" onClick={onRetry}>Try again</Button>
    </div>
  );
}

/**
 * Shows its children only to a signed-in user.
 * area="app": also sends people who haven't finished setup to /setup.
 * area="setup": the setup wizard itself.
 */
export function RequireAccount({ area, children }: { area: "app" | "setup"; children: ReactNode }) {
  const { status, user, problem, retry, signedOutReason } = useAuth();
  const router = useRouter();
  const target =
    status === "signed-out" ? (signedOutReason === "manual" ? "/" : "/login")
      : status === "signed-in" && area === "app" && !user?.onboarded ? "/setup"
        : null;

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (status === "unavailable") return <CannotConnect problem={problem} onRetry={retry} />;
  if (status !== "signed-in" || target) return <PageLoader label={status === "signed-out" ? (signedOutReason === "manual" ? "Signing you out…" : "Taking you to sign in…") : "Loading…"} />;
  return <>{children}</>;
}

/** Sign-in and sign-up pages: someone already signed in goes straight to their readings. */
export function RedirectIfSignedIn({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const target = status === "signed-in" ? (user?.onboarded ? "/home" : "/setup") : null;

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (target) return <PageLoader label="Opening your readings…" />;
  return <>{children}</>;
}
