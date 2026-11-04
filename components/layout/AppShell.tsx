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
      className={`flex min-h-12 items-center gap-2 rounded-xl px-2 text-base font-semibold hover:bg-black/[0.05] ${active ? "text-ink" : "text-ink-2"}`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-full font-display text-base ${active ? "bg-ink text-white" : "bg-line text-ink"}`} aria-hidden="true">
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
      <a href="#main" className="sr-only z-[60] rounded-xl bg-ink px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Logo href="/home" />
          <nav aria-label="Main" className="ml-4 hidden flex-1 items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-12 items-center gap-2 rounded-xl px-3.5 text-base font-semibold transition-colors ${active ? "bg-ink text-white" : "text-ink-2 hover:bg-black/[0.05] hover:text-ink"}`}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                  {item.premium && !isPremium && (
                    <>
                      <Lock className="h-4 w-4 opacity-70" aria-hidden="true" />
                      <span className="sr-only">(needs Premium)</span>
                    </>
                  )}
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

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-36 pt-6 sm:px-6 sm:pt-10 md:pb-20">
        {children}
      </main>

      <nav aria-label="Main" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex min-h-[4.25rem] flex-col items-center justify-center gap-1 text-sm font-semibold ${active ? "text-ink" : "text-ink-3"}`}
                >
                  {active && <span className="absolute inset-x-4 top-0 h-1 rounded-b-full bg-ink" aria-hidden="true" />}
                  <span className="relative">
                    <item.icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
                    {item.premium && !isPremium && <Lock className="absolute -right-2.5 -top-1.5 h-3.5 w-3.5" aria-hidden="true" />}
                  </span>
                  {item.label}
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
