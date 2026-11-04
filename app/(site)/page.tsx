import type { Metadata } from "next";
import { ArrowRight, BookOpenCheck, ChevronDown, CircleCheck, Eye, ShieldCheck } from "lucide-react";
import { ThreeCircles } from "@/components/brand/ThreeCircles";
import { ButtonLink } from "@/components/ui/Button";
import { IconBadge } from "@/components/ui/IconBadge";
import { JOURNEY, TONE } from "@/lib/journey";

export const metadata: Metadata = {
  title: { absolute: "AstroVerse · Your numbers, your stars, your hand" },
};

const STEPS = [
  { title: "Tell us your birthday", text: "Your name, the date, time and place you were born. It takes about a minute." },
  { title: "Get three readings", text: "Your numbers, your stars and your hand, each explained in plain words." },
  { title: "See how they fit together", text: "Find out where the three agree, and ask questions in your own words." },
];

const READINGS = JOURNEY.filter((s) => s.module);

const TRUST = [
  { icon: BookOpenCheck, title: "Nothing is made up", text: "Every sentence comes from traditional books. If the books say nothing, we say nothing." },
  { icon: Eye, title: "See how it was worked out", text: "Each reading shows its sums and its sources, so you can check them yourself." },
  { icon: ShieldCheck, title: "Your photo stays private", text: "We measure your palm and then throw the photo away. We never sell your data." },
];

const FAQ = [
  { q: "Is it free?", a: "Yes. Your three readings are free. The full story and the question-and-answer guide are part of Premium, which you can unlock with a code." },
  { q: "Do I need to know anything about astrology?", a: "No. Every word is explained. When we use an old Sanskrit name, we say what it means first." },
  { q: "I don't know my birth time. Can I still use it?", a: "Yes. Your numbers and your hand don't need it. For your stars, we use midday and skip the parts that need an exact time." },
  { q: "What happens to my palm photo?", a: "It is measured on our server and then deleted. We keep only the measurements, like how long each line is." },
  { q: "Is this science?", a: "No. Numerology, astrology and palmistry are old traditions. AstroVerse shows what they say, for reflection and fun. Please don't use it for health, money or legal decisions." },
];

export default function WelcomePage() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:py-20">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">Get to know yourself, one simple step at a time.</h1>
          <p className="max-w-2xl text-xl text-ink-2 sm:text-2xl">
            AstroVerse reads your numbers, your stars and the lines on your hand, then shows you where they agree.
            All in plain words.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/signup" size="lg" iconAfter={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>
              Start for free
            </ButtonLink>
            <ButtonLink href="/login" size="lg" variant="secondary">I already have an account</ButtonLink>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-lg text-ink-2">
            {["Free to start", "About 5 minutes", "Your palm photo is never kept"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CircleCheck className="h-5 w-5 text-good" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <ThreeCircles className="mx-auto w-full max-w-sm md:max-w-md" />
      </section>

      <section aria-labelledby="how-title" className="border-y border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6">
          <h2 id="how-title" className="text-3xl font-semibold sm:text-4xl">How it works</h2>
          <ol className="grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4 rounded-2xl border border-line bg-paper p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink font-display text-xl font-semibold text-white" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                  <p className="text-lg text-ink-2">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="readings-title" className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-3">
          <h2 id="readings-title" className="text-3xl font-semibold sm:text-4xl">Three readings, one you</h2>
          <p className="max-w-3xl text-xl text-ink-2">Each tradition looks at you from a different side. Put together, they tell a fuller story.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {READINGS.map((r) => (
            <article key={r.key} className={`flex flex-col gap-4 rounded-2xl border border-line border-t-8 bg-surface p-6 ${TONE[r.tone].top}`}>
              <IconBadge icon={r.icon} tone={r.tone} />
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-semibold">{r.title.replace("Your ", "")}</h3>
                <p className={`text-base font-semibold ${TONE[r.tone].text}`}>{r.tradition}</p>
              </div>
              <p className="text-lg text-ink-2">{r.what}</p>
              <p className="mt-auto rounded-xl bg-paper px-4 py-3 text-base">
                <span className="font-semibold">You need: </span>
                {r.needs.toLowerCase()}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="trust-title" className="border-y border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6">
          <h2 id="trust-title" className="text-3xl font-semibold sm:text-4xl">Why you can trust what you read</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {TRUST.map((t) => (
              <div key={t.title} className="flex flex-col gap-3">
                <t.icon className="h-9 w-9 text-ink" aria-hidden="true" />
                <h3 className="text-xl font-semibold">{t.title}</h3>
                <p className="text-lg text-ink-2">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-14 sm:px-6">
        <h2 id="faq-title" className="text-3xl font-semibold sm:text-4xl">Questions people ask</h2>
        <div className="flex flex-col gap-3">
          {FAQ.map((item) => (
            <details key={item.q} className="rounded-2xl border border-line bg-surface">
              <summary className="flex min-h-16 items-center justify-between gap-4 px-5 py-4 text-lg font-semibold">
                {item.q}
                <ChevronDown className="chevron h-6 w-6 shrink-0 text-ink-2 transition-transform" aria-hidden="true" />
              </summary>
              <p className="px-5 pb-5 text-lg text-ink-2">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-semibold">Ready when you are</h2>
            <p className="text-xl text-white/80">It’s free, and you can stop at any step.</p>
          </div>
          <ButtonLink href="/signup" size="lg" className="bg-white !text-ink hover:bg-white/90" iconAfter={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>
            Start for free
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
