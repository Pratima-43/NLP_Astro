import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Spinner } from "@/components/ui/Spinner";

type Variant = "primary" | "secondary" | "quiet" | "danger";
type Size = "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2.5 rounded-xl font-semibold text-center leading-tight transition-colors select-none disabled:cursor-not-allowed disabled:opacity-55";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-[#3a3631] active:bg-black",
  secondary: "bg-surface text-ink border-2 border-line-2 hover:border-ink",
  quiet: "text-ink underline-offset-4 hover:bg-black/[0.05]",
  danger: "bg-bad text-white hover:bg-[#991b1b]",
};

const SIZES: Record<Size, string> = {
  md: "min-h-12 px-5 py-2.5 text-base",
  lg: "min-h-14 px-7 py-3 text-lg",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = ""): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner and disables the button. */
  busy?: boolean;
  busyText?: string;
  icon?: ReactNode;
}

export function Button({ variant = "primary", size = "md", busy, busyText, icon, className = "", children, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} disabled={disabled || busy} aria-busy={busy || undefined} {...rest}>
      {busy ? <Spinner className="h-5 w-5" /> : icon}
      <span>{busy && busyText ? busyText : children}</span>
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconAfter?: ReactNode;
}

export function ButtonLink({ variant = "primary", size = "md", icon, iconAfter, className = "", children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      <span>{children}</span>
      {iconAfter}
    </Link>
  );
}
