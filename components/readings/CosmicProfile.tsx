import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Starfield } from "@/components/brand/Celestial";

export interface ProfileData {
  name: string;
  subtitle?: string;
  numbers?: { moolank: number; bhagyank: number; namank: number; year: number } | null;
  stars?: { sun: string; moon: string; rising: string | null; birthStar: string } | null;
  hand?: { element: string; detail: string } | null;
}

function Missing({ href, children }: { href?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-display text-3xl text-moon-2">Not read yet</p>
      {href && (
        <Link href={href} className="flex min-h-11 w-fit items-center gap-2 text-base font-semibold text-moon underline decoration-moon/40 underline-offset-4 hover:decoration-moon">
          {children}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/**
 * Everything about you on one night-sky card: your four numbers, your signs and birth star, and your hand.
 * Used on Home with real data, and on the welcome page as an example.
 */
export function CosmicProfile({ data, links = true, label = "About you" }: { data: ProfileData; links?: boolean; label?: string }) {
  const { numbers, stars, hand } = data;
  return (
    <section className="night relative overflow-hidden rounded-[2rem]" aria-label={label}>
      <Starfield count={90} seed={11} className="absolute inset-0 h-full w-full opacity-70" />
      <div className="relative flex flex-col gap-8 p-6 sm:p-9">
        <div className="flex flex-col gap-2">
          <p className="eyebrow text-moon-2">{label}</p>
          <h2 className="text-4xl sm:text-5xl">{data.name}</h2>
          {data.subtitle && <p className="eyebrow text-moon-2">{data.subtitle}</p>}
        </div>

        <div className="grid gap-8 border-t border-night-line pt-8 md:grid-cols-[1.2fr_1fr_0.95fr] md:gap-0 md:divide-x md:divide-night-line">
          <div className="flex flex-col gap-4 md:pr-8">
            <p className="eyebrow text-[#e3b56a]">Numbers</p>
            {numbers ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
                {[["Birthday", numbers.moolank], ["Life", numbers.bhagyank], ["Name", numbers.namank], ["This year", numbers.year]].map(([k, v]) => (
                  <div key={k} className="flex flex-col items-start gap-1">
                    <dd className="font-display text-5xl leading-none">{v}</dd>
                    <dt className="text-sm font-semibold text-moon-2">{k}</dt>
                  </div>
                ))}
              </dl>
            ) : <Missing href={links ? "/numbers" : undefined}>Make my Numbers</Missing>}
          </div>

          <div className="flex flex-col gap-4 md:px-8">
            <p className="eyebrow text-[#a9a6f2]">Stars</p>
            {stars ? (
              <dl className="flex flex-col gap-2.5">
                {[["Your sign", stars.moon], ["Sun sign", stars.sun], ["Rising sign", stars.rising ?? "Not known"], ["Birth star", stars.birthStar]].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-3 border-b border-night-line/70 pb-2 last:border-0">
                    <dt className="eyebrow text-moon-2">{k}</dt>
                    <dd className="font-display text-2xl leading-none">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : <Missing href={links ? "/stars" : undefined}>Make my Stars</Missing>}
          </div>

          <div className="flex flex-col gap-4 md:pl-8">
            <p className="eyebrow text-[#8ccaa8]">Hand</p>
            {hand ? (
              <div className="flex flex-col gap-2">
                <p className="font-display text-5xl capitalize leading-none">{hand.element}</p>
                <p className="eyebrow text-moon-2">hand shape</p>
                <p className="text-base text-moon-2">{hand.detail}</p>
              </div>
            ) : <Missing href={links ? "/hand" : undefined}>Read my palm</Missing>}
          </div>
        </div>
      </div>
    </section>
  );
}
