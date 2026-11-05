"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Starfield } from "@/components/brand/Celestial";
import { useAuth } from "@/components/providers/AuthProvider";
import { ButtonLink } from "@/components/ui/Button";
import { TextSizeMenu } from "@/components/ui/TextSizeMenu";

/** Header for the public pages; it sits on the night hero. Signed-in visitors get one "My readings" button. */
export function SiteHeader() {
  const { status, user } = useAuth();
  const signedIn = status === "signed-in";
  return (
    <header className="night relative z-30 border-b border-night-line">
      <div className="mx-auto flex h-[4.75rem] max-w-6xl items-center gap-2 px-5 sm:px-8">
        <Logo tone="moon" />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <TextSizeMenu tone="moon" />
          {signedIn ? (
            <ButtonLink href={user?.onboarded ? "/home" : "/setup"} variant="light" className="whitespace-nowrap" iconAfter={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>
              My readings
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="outline-light" className="whitespace-nowrap">Sign in</ButtonLink>
              <span className="hidden sm:block">
                <ButtonLink href="/signup" variant="light" className="whitespace-nowrap">Begin</ButtonLink>
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
    <footer className="night relative overflow-hidden">
      <Starfield count={70} seed={31} className="absolute inset-0 h-full w-full opacity-60" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div className="flex max-w-md flex-col gap-4">
          <Logo tone="moon" />
          <p className="text-base text-moon-2">
            Numerology, Vedic astrology and palmistry, explained simply. Old traditions for reflection and fun, not science or advice.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-2">
          {[["/about", "About"], ["/privacy", "Privacy"], ["/terms", "Terms"], ["/login", "Sign in"]].map(([href, label]) => (
            <Link key={href} href={href} className="eyebrow flex min-h-11 items-center text-moon-2 hover:text-moon">{label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
