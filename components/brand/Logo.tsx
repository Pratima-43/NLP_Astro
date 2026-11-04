import Link from "next/link";

/** Three overlapping circles: numbers, stars and hand, and you in the middle. */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="15" cy="15" r="10" fill="#b45309" fillOpacity="0.85" />
      <circle cx="25" cy="15" r="10" fill="#4338ca" fillOpacity="0.8" style={{ mixBlendMode: "multiply" }} />
      <circle cx="20" cy="24" r="10" fill="#0f766e" fillOpacity="0.8" style={{ mixBlendMode: "multiply" }} />
    </svg>
  );
}

export function Logo({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`flex min-h-12 items-center gap-2.5 rounded-xl pr-2 ${className}`} aria-label="AstroVerse home">
      <LogoMark />
      <span className="font-display text-xl font-semibold tracking-tight text-ink">AstroVerse</span>
    </Link>
  );
}
