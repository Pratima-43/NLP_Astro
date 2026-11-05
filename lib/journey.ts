import { BookOpen, Hand, Hash, MessageCircle, Star, type LucideIcon } from "lucide-react";
import type { ModuleKey } from "@/types/readings";

export type Tone = "num" | "star" | "hand" | "story" | "ask";

/** Static Tailwind class names per colour, so the compiler keeps them. */
export const TONE: Record<Tone, { text: string; ink: string; soft: string; solid: string; border: string; top: string; bar: string }> = {
  num: { text: "text-num", ink: "text-num-ink", soft: "bg-num-soft", solid: "bg-num", border: "border-num", top: "border-t-num", bar: "#a8660f" },
  star: { text: "text-star", ink: "text-star-ink", soft: "bg-star-soft", solid: "bg-star", border: "border-star", top: "border-t-star", bar: "#4f4ac4" },
  hand: { text: "text-hand", ink: "text-hand-ink", soft: "bg-hand-soft", solid: "bg-hand", border: "border-hand", top: "border-t-hand", bar: "#2f7356" },
  story: { text: "text-story", ink: "text-story-ink", soft: "bg-story-soft", solid: "bg-story", border: "border-story", top: "border-t-story", bar: "#a83d60" },
  ask: { text: "text-ask", ink: "text-ask-ink", soft: "bg-ask-soft", solid: "bg-ask", border: "border-ask", top: "border-t-ask", bar: "#2a6aa3" },
};

export type StepKey = "numbers" | "stars" | "hand" | "story" | "ask";

export interface JourneyStep {
  key: StepKey;
  href: string;
  /** Short label for navigation. */
  short: string;
  /** Page title. */
  title: string;
  /** The tradition's proper name. */
  tradition: string;
  /** One plain sentence: what you get. */
  what: string;
  /** What we need from you. */
  needs: string;
  icon: LucideIcon;
  tone: Tone;
  module?: ModuleKey;
  premium?: boolean;
}

/** The user's path, in order. Home, the navigation and every "Next step" button read from this list. */
export const JOURNEY: JourneyStep[] = [
  {
    key: "numbers", href: "/numbers", short: "Numbers", title: "Your Numbers", tradition: "Numerology",
    what: "What your name and birthday say about you.", needs: "Your name and birthday",
    icon: Hash, tone: "num", module: "numerology",
  },
  {
    key: "stars", href: "/stars", short: "Stars", title: "Your Stars", tradition: "Indian astrology",
    what: "How the sky looked when you were born, and what it means for you.", needs: "Your birth date, time and place",
    icon: Star, tone: "star", module: "astrology",
  },
  {
    key: "hand", href: "/hand", short: "Hand", title: "Your Hand", tradition: "Palm reading",
    what: "What the lines on your palm say.", needs: "A photo of your palm",
    icon: Hand, tone: "hand", module: "palmistry",
  },
  {
    key: "story", href: "/story", short: "Story", title: "Your Full Story", tradition: "All three together",
    what: "Your three readings put together: where they agree and where they don’t.", needs: "At least one reading",
    icon: BookOpen, tone: "story", premium: true,
  },
  {
    key: "ask", href: "/ask", short: "Ask", title: "Ask a Question", tradition: "Your questions",
    what: "Ask anything in your own words. We answer only from your readings.", needs: "At least one reading",
    icon: MessageCircle, tone: "ask", premium: true,
  },
];

export function step(key: StepKey): JourneyStep {
  return JOURNEY.find((s) => s.key === key)!;
}

export function nextStep(key: StepKey): JourneyStep | null {
  const index = JOURNEY.findIndex((s) => s.key === key);
  return JOURNEY[index + 1] ?? null;
}

/** API module key → the reading's friendly name and colour. */
export const MODULE_STEP: Record<ModuleKey, JourneyStep> = {
  numerology: step("numbers"),
  astrology: step("stars"),
  palmistry: step("hand"),
};
