"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/components/providers/AuthProvider";
import { ButtonLink } from "@/components/ui/Button";
import { TextSizeMenu } from "@/components/ui/TextSizeMenu";

/** Header for the public pages. Signed-in visitors get a single "Open my readings" button. */
export function SiteHeader() {
  const { status, user } = useAuth();
  const signedIn = status === "signed-in";
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex h-18 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Logo />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <TextSizeMenu />
          {signedIn ? (
            <ButtonLink href={user?.onboarded ? "/home" : "/setup"} className="whitespace-nowrap" iconAfter={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>
              My readings
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="secondary" className="whitespace-nowrap">Sign in</ButtonLink>
              <span className="hidden sm:block">
                <ButtonLink href="/signup" className="whitespace-nowrap">Start free</ButtonLink>
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex max-w-md flex-col gap-3">
          <Logo />
          <p className="text-base text-ink-2">
            Numerology, Vedic astrology and palmistry, explained simply. These are old traditions for reflection and fun,
            not science or advice.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-base font-semibold">
          <Link href="/about" className="min-h-11 py-2 underline-offset-4 hover:underline">About</Link>
          <Link href="/privacy" className="min-h-11 py-2 underline-offset-4 hover:underline">Privacy</Link>
          <Link href="/terms" className="min-h-11 py-2 underline-offset-4 hover:underline">Terms</Link>
          <Link href="/login" className="min-h-11 py-2 underline-offset-4 hover:underline">Sign in</Link>
        </nav>
      </div>
    </footer>
  );
}
