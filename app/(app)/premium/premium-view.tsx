"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, CircleCheck, MessageCircle } from "lucide-react";
import { UnlockForm } from "@/components/premium/Unlock";
import { useAuth, useUser } from "@/components/providers/AuthProvider";
import { ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { formatDate } from "@/lib/format";

const INCLUDED = [
  { icon: BookOpen, title: "Your Full Story", text: "All three readings side by side, topic by topic, with where they agree and where they differ." },
  { icon: MessageCircle, title: "Ask a Question", text: "Ask anything in your own words. Every answer comes from your readings and shows which one it used." },
];

export function PremiumView() {
  const user = useUser();
  const { isPremium } = useAuth();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <Link href="/home" className="flex min-h-11 w-fit items-center gap-2 rounded-lg pr-2 text-base font-semibold text-ink-2 hover:text-ink">
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        Back to home
      </Link>
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold">{isPremium ? "Premium is on" : "Unlock Premium"}</h1>
        <p className="text-xl text-ink-2">Your three readings are always free. Premium puts them together.</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {INCLUDED.map((item) => (
          <li key={item.title} className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-6">
            <item.icon className="h-8 w-8 text-story" aria-hidden="true" />
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-lg text-ink-2">{item.text}</p>
          </li>
        ))}
      </ul>

      {isPremium ? (
        <section className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-6 sm:p-8">
          <Notice tone="success" title={`You have ${user.premium.plan}`}>
            {user.premium.expiresAt ? `It lasts until ${formatDate(user.premium.expiresAt)}.` : "Enjoy your readings."}
          </Notice>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/story" size="lg" iconAfter={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>See my full story</ButtonLink>
            <ButtonLink href="/ask" size="lg" variant="secondary">Ask a question</ButtonLink>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold">Have a code?</h2>
            <p className="text-lg text-ink-2">Premium is unlocked with a code. No card or payment is needed.</p>
          </div>
          <UnlockForm />
          <ul className="flex flex-col gap-2 text-base text-ink-2">
            <li className="flex items-center gap-2"><CircleCheck className="h-5 w-5 text-good" aria-hidden="true" />Your readings stay free, with or without Premium</li>
            <li className="flex items-center gap-2"><CircleCheck className="h-5 w-5 text-good" aria-hidden="true" />The code ASTROFREE gives you a free year</li>
          </ul>
        </section>
      )}
    </div>
  );
}
