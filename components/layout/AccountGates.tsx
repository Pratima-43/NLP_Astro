"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CloudOff } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center" role="status" aria-live="polite">
      <LogoMark className="h-14 w-14" />
      <div className="flex items-center gap-3 text-lg text-ink-2">
        <Spinner className="h-6 w-6" />
        {label}
      </div>
    </div>
  );
}

function CannotConnect({ problem, onRetry }: { problem: string; onRetry: () => void }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-5 px-4 text-center">
      <CloudOff className="h-14 w-14 text-ink-2" aria-hidden="true" />
      <h1 className="text-3xl font-semibold">We can’t connect right now</h1>
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
