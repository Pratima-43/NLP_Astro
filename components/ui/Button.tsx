import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Spinner } from "@/components/ui/Spinner";

type Variant = "primary" | "secondary" | "quiet" | "danger" | "light" | "outline-light";
type Size = "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2.5 rounded-full font-semibold text-center leading-tight transition-[background-color,border-color,color,transform] duration-200 select-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-moon hover:bg-[#2b2a27]",
  secondary: "border-[1.5px] border-ink/80 text-ink hover:bg-ink hover:text-moon",
  quiet: "text-ink underline-offset-4 hover:underline",
  danger: "bg-bad text-white hover:bg-[#931c1c]",
  light: "bg-moon text-night hover:bg-white",
  "outline-light": "border-[1.5px] border-moon/60 text-moon hover:bg-moon hover:text-night",
};

const SIZES: Record<Size, string> = {
  md: "min-h-12 px-6 py-2.5 text-base",
  lg: "min-h-14 px-8 py-3 text-lg",
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
      <span className="inline-flex items-center gap-2.5">{busy && busyText ? busyText : children}</span>
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
