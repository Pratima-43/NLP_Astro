import type { Metadata } from "next";
import { ArrowRight, Plus } from "lucide-react";
import { Halo, OrbitArt, Starfield } from "@/components/brand/Celestial";
import { CosmicProfile } from "@/components/readings/CosmicProfile";
import { ButtonLink } from "@/components/ui/Button";
import { JOURNEY, TONE } from "@/lib/journey";

export const metadata: Metadata = {
  title: { absolute: "AstroVerse · Your numbers, your stars, your hand" },
};

const READINGS = JOURNEY.filter((s) => s.module);

const STEPS = [
  { title: "Tell us your birthday", text: "Your name, and the date, time and place you were born. One question at a time." },
  { title: "Get three readings", text: "Your numbers, your stars and your hand, in simple words. You can also listen to them." },
  { title: "See the whole picture", text: "See where the three readings agree, and ask questions in your own words." },
];

const FAQ = [
  { q: "Is it free?", a: "Yes. Your three readings are free. Your Full Story and Ask a Question are part of Premium, which you unlock with a code." },
  { q: "Do I need to know anything about astrology?", a: "No. We use everyday words. If you want the proper names, you can find them under “How did we get this?”." },
  { q: "I don’t know my birth time. Can I still use it?", a: "Yes. Your numbers and your hand don’t need it. For your stars we use midday and leave out the parts that need an exact time." },
  { q: "What happens to my palm photo?", a: "It is measured on our server and then deleted. We keep only the measurements, like how long each line is." },
  { q: "Is this science?", a: "No. Numerology, astrology and palmistry are old traditions. AstroVerse shows what they say, for reflection and fun. Please don’t use it for health, money or legal decisions." },
];

export default function WelcomePage() {
  return (
    <>
      {/* Hero: the night sky */}
      <section className="night relative -mt-px overflow-hidden">
        <Starfield count={180} seed={3} className="absolute inset-0 h-full w-full" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 md:grid-cols-[1.15fr_0.85fr] md:pb-28 md:pt-20">
          <div className="flex flex-col gap-8 rise-in">
            <p className="eyebrow text-moon-2">Numbers · Stars · Palm reading</p>
            <h1 className="text-[clamp(3.1rem,8.2vw,6.4rem)] leading-[0.95]">
              Know yourself by your <em className="text-[#e3b56a]">numbers</em>, your <em className="text-[#b4b1f5]">stars</em> &amp; the <em className="text-[#9bd3b4]">lines</em> of your hand.
            </h1>
            <p className="max-w-xl text-xl leading-relaxed text-moon-2 sm:text-2xl">
              Three old traditions, read for you in simple words. Then see where they agree.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/signup" variant="light" size="lg" iconAfter={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>
                Begin — it’s free
              </ButtonLink>
              <ButtonLink href="/login" variant="outline-light" size="lg">I have an account</ButtonLink>
            </div>
            <p className="eyebrow text-moon-2">Free · About 5 minutes · We never keep your photo</p>
          </div>
          <OrbitArt className="mx-auto w-full max-w-[26rem]" />
        </div>
      </section>

      {/* The three readings */}
      <section aria-labelledby="readings-title" className="mx-auto flex max-w-6xl flex-col gap-12 px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
          <h2 id="readings-title" className="text-5xl sm:text-6xl">Three readings,<br /><em>one you.</em></h2>
          <p className="text-xl leading-relaxed text-ink-2">Each tradition looks at you from a different side. Put together, they tell a fuller story than any one of them alone.</p>
        </div>
        <div className="grid border-t border-ink/80 md:grid-cols-3 md:divide-x md:divide-line">
          {READINGS.map((r) => (
            <article key={r.key} className="flex flex-col gap-6 border-b border-line py-10 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0">
              <p className={`eyebrow ${TONE[r.tone].text}`}>{r.tradition}</p>
              <Halo className={`h-40 w-40 ${TONE[r.tone].text}`}>
                {r.key === "numbers" ? (
                  <span className="font-display text-6xl text-ink">7</span>
                ) : (
                  <r.icon className="h-14 w-14 text-ink" strokeWidth={1} aria-hidden="true" />
                )}
              </Halo>
              <h3 className="text-4xl">{r.title.replace("Your ", "")}</h3>
              <p className="text-lg leading-relaxed text-ink-2">{r.what}</p>
              <p className="eyebrow mt-auto text-ink-3">You need: {r.needs.toLowerCase()}</p>
            </article>
          ))}
        </div>
      </section>

      {/* The cosmic profile */}
      <section aria-labelledby="profile-title" className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col gap-6">
            <p className="eyebrow text-ink-3">What you get</p>
            <h2 id="profile-title" className="text-5xl sm:text-6xl">You, on <em>one card.</em></h2>
            <p className="text-xl leading-relaxed text-ink-2">
              Your four numbers, your signs, your birth star and your hand shape, all in one place.
              We show you how we got each one.
            </p>
          </div>
          <CosmicProfile
            links={false}
            label="Example profile"
            data={{
              name: "Ananya",
              subtitle: "Born 19 August 2005 · 7:30 am · Nellore",
              numbers: { moolank: 1, bhagyank: 7, namank: 7, year: 1 },
              stars: { sun: "Leo", moon: "Capricorn", rising: "Leo", birthStar: "Shravana" },
              hand: { element: "Water", detail: "A long palm with long fingers: sensitive and imaginative." },
            }}
          />
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-title" className="mx-auto flex max-w-6xl flex-col gap-12 px-5 py-20 sm:px-8 sm:py-28">
        <h2 id="how-title" className="text-5xl sm:text-6xl">How it works</h2>
        <ol className="grid border-t border-ink/80 md:grid-cols-3 md:divide-x md:divide-line">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-4 border-b border-line py-10 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0">
              <span className="font-display text-7xl leading-none text-ink/25" aria-hidden="true">{i + 1}</span>
              <h3 className="text-3xl">{s.title}</h3>
              <p className="text-lg leading-relaxed text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Trust */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-5 py-20 text-center sm:px-8 sm:py-28">
          <p className="eyebrow text-ink-3">Our promise</p>
          <p className="font-display text-4xl leading-tight sm:text-5xl">
            “Nothing is made up. Every line comes from an old book, and we show you which one.”
          </p>
          <p className="max-w-2xl text-lg leading-relaxed text-ink-2">
            First, the computer does the sums. Then a writing helper puts what the books say into simple words. If it can’t show where something came from, we take it out.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 id="faq-title" className="text-5xl sm:text-6xl">Questions<br /><em>people ask</em></h2>
        <div className="border-t border-ink/80">
          {FAQ.map((item) => (
            <details key={item.q} className="border-b border-line">
              <summary className="flex min-h-20 items-center justify-between gap-6 py-5 text-xl font-semibold">
                {item.q}
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink/70" aria-hidden="true">
                  <Plus className="chevron h-5 w-5 transition-transform duration-300" />
                </span>
              </summary>
              <p className="pb-6 pr-14 text-lg leading-relaxed text-ink-2">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="night relative overflow-hidden">
        <Starfield count={120} seed={21} className="absolute inset-0 h-full w-full" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 py-24 sm:px-8 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl text-5xl leading-[1] sm:text-6xl">The sky you were born under is <em>waiting.</em></h2>
          <ButtonLink href="/signup" variant="light" size="lg" iconAfter={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>
            Begin — it’s free
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
