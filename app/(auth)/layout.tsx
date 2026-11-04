import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { TextSizeMenu } from "@/components/ui/TextSizeMenu";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-18 w-full max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Logo />
        <div className="ml-auto flex items-center gap-1">
          <TextSizeMenu />
          <Link href="/" className="flex min-h-12 items-center gap-2 rounded-xl px-3 text-base font-semibold text-ink-2 hover:bg-black/[0.05] hover:text-ink">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">Back to start</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>
      <main id="main" className="flex flex-1 items-start justify-center px-4 pb-16 pt-4 sm:items-center sm:pt-0">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
