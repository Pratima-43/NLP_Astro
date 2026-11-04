import type { LucideIcon } from "lucide-react";
import { TONE, type Tone } from "@/lib/journey";

const SIZES = {
  sm: { box: "h-11 w-11", icon: "h-5 w-5" },
  md: { box: "h-14 w-14", icon: "h-6 w-6" },
  lg: { box: "h-[4.5rem] w-[4.5rem]", icon: "h-8 w-8" },
};

/** A reading's icon: a thin ring in its own colour, like a planet on a chart. */
export function IconBadge({ icon: Icon, tone, size = "md" }: { icon: LucideIcon; tone: Tone; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <span className={`relative flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-current ${s.box} ${TONE[tone].text}`} aria-hidden="true">
      <span className={`absolute inset-1 rounded-full ${TONE[tone].soft}`} />
      <Icon className={`relative ${s.icon}`} strokeWidth={1.6} />
    </span>
  );
}
