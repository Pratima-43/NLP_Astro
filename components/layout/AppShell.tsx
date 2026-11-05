"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { House, Lock, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/components/providers/AuthProvider";
import { TextSizeMenu } from "@/components/ui/TextSizeMenu";
import { JOURNEY } from "@/lib/journey";
import { firstName } from "@/lib/format";

type NavItem = { href: string; label: string; icon: LucideIcon; premium?: boolean };

// The same five places on phones (bottom bar) and computers (top bar).
const NAV: NavItem[] = [
  { href: "/home", label: "Home", icon: House },
  ...JOURNEY.filter((s) => s.key !== "story").map((s) => ({ href: s.href, label: s.short, icon: s.icon, premium: s.premium })),
];

// Pages that aren't in the bar (the full story, premium) belong under Home.
function isActive(pathname: string, href: string): boolean {
  if (href === "/home" && (pathname === "/story" || pathname === "/premium")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MeButton() {
  const { user } = useAuth();
  const pathname = usePathname();
  const active = pathname === "/me";
  const initial = firstName(user?.name).charAt(0).toUpperCase() || "?";
  return (
    <Link
      href="/me"
      aria-current={active ? "page" : undefined}
      className="flex min-h-12 items-center gap-2.5 rounded-full py-1 pl-1 pr-3 text-base font-semibold text-ink hover:bg-black/[0.04]"
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-xl ${active ? "bg-ink text-moon" : "border-[1.5px] border-ink/70"}`}
        aria-hidden="true"
      >
        {initial}
      </span>
      <span>Me</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isPremium } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only z-[60] rounded-full bg-ink px-5 py-3 text-moon focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-[4.75rem] max-w-6xl items-center gap-3 px-5 sm:px-8">
          <Logo href="/home" />
          <nav aria-label="Main" className="ml-6 hidden flex-1 items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-12 items-center gap-2 rounded-full px-4 text-base font-medium transition-colors ${active ? "text-ink" : "text-ink-2 hover:text-ink"}`}
                >
                  {item.label}
                  {item.premium && !isPremium && (
                    <>
                      <Lock className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                      <span className="sr-only">(needs Premium)</span>
                    </>
                  )}
                  {active && <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-ink" aria-hidden="true" />}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <TextSizeMenu />
            <MeButton />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-5 pb-40 pt-8 sm:px-8 sm:pt-12 md:pb-24">
        {children}
      </main>

      <nav aria-label="Main" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-[4.5rem] flex-col items-center justify-center gap-1 text-[0.8125rem] font-semibold ${active ? "text-ink" : "text-ink-3"}`}
                >
                  <span className="relative">
                    <item.icon className="h-6 w-6" strokeWidth={active ? 2 : 1.5} aria-hidden="true" />
                    {item.premium && !isPremium && <Lock className="absolute -right-2.5 -top-1.5 h-3.5 w-3.5" aria-hidden="true" />}
                  </span>
                  {item.label}
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-ink" : "bg-transparent"}`} aria-hidden="true" />
                  {item.premium && !isPremium && <span className="sr-only">(needs Premium)</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
