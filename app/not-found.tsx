import { House } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-6 px-4 text-center">
      <LogoMark className="h-16 w-16" />
      <h1 className="text-3xl font-semibold">We can’t find that page</h1>
      <p className="text-lg text-ink-2">The link may be old or mistyped. Let’s get you back on track.</p>
      <ButtonLink href="/" size="lg" icon={<House className="h-5 w-5" aria-hidden="true" />}>Go to the start</ButtonLink>
    </main>
  );
}
