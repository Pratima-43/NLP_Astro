import type { ReactNode } from "react";

/** Long-form page (About, Privacy, Terms): one readable column, editorial headings, hairlines between sections. */
export function InfoArticle({ title, intro, updated, children }: { title: string; intro: string; updated?: string; children: ReactNode }) {
  return (
    <article className="mx-auto flex max-w-3xl flex-col px-5 py-16 sm:px-8 sm:py-24">
      <header className="flex flex-col gap-6 pb-12">
        {updated && <p className="eyebrow text-ink-3">Last updated {updated}</p>}
        <h1 className="text-6xl sm:text-7xl">{title}</h1>
        <p className="text-2xl leading-relaxed text-ink-2">{intro}</p>
      </header>
      <div className="border-t border-ink/80">{children}</div>
    </article>
  );
}

export function InfoSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="grid gap-4 border-b border-line py-10 md:grid-cols-[0.75fr_1.25fr] md:gap-10">
      <h2 className="text-3xl">{title}</h2>
      <div className="flex flex-col gap-3 text-lg leading-relaxed text-ink-2 [&_a]:font-semibold [&_a]:text-ink [&_a]:underline [&_li]:ml-6 [&_li]:list-disc [&_strong]:text-ink [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2">
        {children}
      </div>
    </section>
  );
}
