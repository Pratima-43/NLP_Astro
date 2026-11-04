import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OrbitArt, Starfield } from "@/components/brand/Celestial";
import { Logo } from "@/components/brand/Logo";
import { TextSizeMenu } from "@/components/ui/TextSizeMenu";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="night relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Starfield count={150} seed={17} className="absolute inset-0 h-full w-full" />
        <Logo tone="moon" className="relative" />
        <OrbitArt className="relative mx-auto w-full max-w-[24rem]" />
        <figure className="relative flex flex-col gap-3">
          <blockquote className="font-display text-4xl leading-tight">“The stars incline us; they do not bind us.”</blockquote>
          <figcaption className="eyebrow text-moon-2">An old saying</figcaption>
        </figure>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="flex h-[4.75rem] items-center gap-2 px-5 sm:px-8">
          <Logo className="lg:hidden" />
          <div className="ml-auto flex items-center gap-1">
            <TextSizeMenu />
            <Link href="/" className="flex min-h-12 items-center gap-2 rounded-full px-4 text-base font-medium text-ink-2 hover:bg-black/[0.04] hover:text-ink">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              Back
            </Link>
          </div>
        </header>
        <main id="main" className="flex flex-1 items-start justify-center px-5 pb-16 pt-6 sm:items-center sm:px-8 sm:pt-0">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
