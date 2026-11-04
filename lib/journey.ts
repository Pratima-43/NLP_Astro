import { BookOpen, Hand, Hash, MessageCircle, Star, type LucideIcon } from "lucide-react";
import type { ModuleKey } from "@/types/readings";

export type Tone = "num" | "star" | "hand" | "story" | "ask";

/** Static Tailwind class names per colour, so the compiler keeps them. */
export const TONE: Record<Tone, { text: string; ink: string; soft: string; solid: string; border: string; top: string; bar: string }> = {
  num: { text: "text-num", ink: "text-num-ink", soft: "bg-num-soft", solid: "bg-num", border: "border-num", top: "border-t-num", bar: "#b45309" },
  star: { text: "text-star", ink: "text-star-ink", soft: "bg-star-soft", solid: "bg-star", border: "border-star", top: "border-t-star", bar: "#4338ca" },
  hand: { text: "text-hand", ink: "text-hand-ink", soft: "bg-hand-soft", solid: "bg-hand", border: "border-hand", top: "border-t-hand", bar: "#0f766e" },
  story: { text: "text-story", ink: "text-story-ink", soft: "bg-story-soft", solid: "bg-story", border: "border-story", top: "border-t-story", bar: "#be185d" },
  ask: { text: "text-ask", ink: "text-ask-ink", soft: "bg-ask-soft", solid: "bg-ask", border: "border-ask", top: "border-t-ask", bar: "#0369a1" },
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
    key: "stars", href: "/stars", short: "Stars", title: "Your Stars", tradition: "Vedic astrology",
    what: "Where the planets were when you were born, and what that means.", needs: "Your birth date, time and place",
    icon: Star, tone: "star", module: "astrology",
  },
  {
    key: "hand", href: "/hand", short: "Hand", title: "Your Hand", tradition: "Palmistry",
    what: "What the lines on your palm say.", needs: "A photo of your palm",
    icon: Hand, tone: "hand", module: "palmistry",
  },
  {
    key: "story", href: "/story", short: "Story", title: "Your Full Story", tradition: "All three together",
    what: "All three readings side by side: where they agree and where they differ.", needs: "At least one reading",
    icon: BookOpen, tone: "story", premium: true,
  },
  {
    key: "ask", href: "/ask", short: "Ask", title: "Ask a Question", tradition: "Your personal guide",
    what: "Ask anything in your own words. Answers come only from your readings.", needs: "At least one reading",
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
