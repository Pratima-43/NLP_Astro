import type { ReactNode } from "react";

/** Long-form page (About, Privacy, Terms): one readable column, big headings. */
export function InfoArticle({ title, intro, updated, children }: { title: string; intro: string; updated?: string; children: ReactNode }) {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
        <p className="text-xl text-ink-2">{intro}</p>
        {updated && <p className="text-base text-ink-3">Last updated {updated}</p>}
      </header>
      {children}
    </article>
  );
}

export function InfoSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-3">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="flex flex-col gap-3 text-lg leading-relaxed text-ink-2 [&_li]:ml-6 [&_li]:list-disc [&_strong]:text-ink [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_a]:font-semibold [&_a]:text-ink [&_a]:underline">
        {children}
      </div>
    </section>
  );
}
