import Link from "next/link";

/** A sun at the centre of one orbit, with a planet on it. */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="20" cy="20" rx="16" ry="6" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" transform="rotate(-28 20 20)" />
      <circle cx="20" cy="20" r="4.5" fill="#c58a2c" />
      <circle cx="34.1" cy="12.5" r="2.6" fill="currentColor" />
    </svg>
  );
}

export function Logo({ href = "/", className = "", tone = "ink" }: { href?: string; className?: string; tone?: "ink" | "moon" }) {
  return (
    <Link
      href={href}
      className={`flex min-h-12 items-center gap-2.5 rounded-xl pr-2 ${tone === "moon" ? "text-moon" : "text-ink"} ${className}`}
      aria-label="AstroVerse home"
    >
      <LogoMark />
      <span className="font-display text-[1.7rem] leading-none tracking-tight">AstroVerse</span>
    </Link>
  );
}
