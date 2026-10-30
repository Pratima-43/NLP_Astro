import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";

/** Simple long-form page (about, privacy, terms) in the site's ivory/gold style. */
export function InfoPage({ eyebrow, title, intro, updated, children }: {
  eyebrow: string; title: string; intro: string; updated?: string; children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      <header className="border-b border-[#E8DFCF] bg-white/70 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></span>
            <span className="font-extrabold text-[#171B2D]">Astro<span className="text-[#C6A15B]">Verse</span></span>
          </Link>
          <Link href="/" className="text-sm text-[#77736B] hover:text-[#C6A15B] inline-flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" />Home</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-[#C6A15B] font-semibold">{eyebrow}</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#171B2D] mt-2">{title}</h1>
        <p className="mt-4 text-[#77736B] leading-relaxed">{intro}</p>
        {updated && <p className="mt-2 text-xs text-[#77736B]">Last updated {updated}</p>}
        <div className="mt-10 space-y-10">{children}</div>
      </main>
    </div>
  );
}

export function InfoSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-bold text-[#171B2D] mb-3">{title}</h2>
      <div className="space-y-3 text-[15px] text-[#4A4740] leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-[#252525]">{children}</div>
    </section>
  );
}
