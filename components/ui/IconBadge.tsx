import type { LucideIcon } from "lucide-react";
import { TONE, type Tone } from "@/lib/journey";

const SIZES = {
  sm: { box: "h-10 w-10 rounded-xl", icon: "h-5 w-5" },
  md: { box: "h-14 w-14 rounded-2xl", icon: "h-7 w-7" },
  lg: { box: "h-16 w-16 rounded-2xl", icon: "h-8 w-8" },
};

/** A reading's icon in its own colour. */
export function IconBadge({ icon: Icon, tone, size = "md" }: { icon: LucideIcon; tone: Tone; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <span className={`flex shrink-0 items-center justify-center ${s.box} ${TONE[tone].soft} ${TONE[tone].text}`} aria-hidden="true">
      <Icon className={s.icon} strokeWidth={2.2} />
    </span>
  );
}
