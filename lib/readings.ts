// Shared helpers that turn reading data into plain words.
import { plainClaim } from "@/lib/plain";
import type { Confidence, DomainOutlook, EvidenceItem, NumerologyComponent, Polarity, Relation } from "@/types/readings";

export type Group = "good" | "care" | "other";

/** positive → good; challenge/challenging/negative → care; neutral or mixed → other. */
export function polarityGroup(polarity: Polarity): Group {
  const value = (polarity ?? "").toLowerCase();
  if (value === "positive") return "good";
  if (value.startsWith("challeng") || value === "negative") return "care";
  return "other";
}

/** Group claims by polarity in plain words, keeping each sentence once, strongest first. */
export function groupClaims<T extends { claim: string; polarity: Polarity; weight?: number }>(items: T[], perGroup = 6): Record<Group, string[]> {
  const sorted = [...items].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  const groups: Record<Group, string[]> = { good: [], care: [], other: [] };
  const seen = new Set<string>();
  for (const item of sorted) {
    const text = plainClaim(item.claim);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    const group = polarityGroup(item.polarity);
    if (groups[group].length < perGroup) groups[group].push(text);
  }
  return groups;
}

export const CONFIDENCE_WORDS: Record<Confidence, { label: string; note: string }> = {
  high: { label: "Quite sure", note: "Many parts of your reading say this." },
  medium: { label: "Fairly sure", note: "One clear part of your reading says this." },
  low: { label: "Not very sure", note: "Only a small part says this, or the signs are mixed." },
};

export const DOMAIN_WORDS: Record<DomainOutlook["assessment"], { label: string; color: string }> = {
  strong: { label: "Very good", color: "#15803d" },
  supportive: { label: "Good", color: "#4d7c0f" },
  mixed: { label: "Up and down", color: "#b45309" },
  challenging: { label: "Take care", color: "#b91c1c" },
};

export const RELATION_WORDS: Record<Relation, { label: string; tone: string }> = {
  agreement: { label: "All agree", tone: "bg-good-soft text-[#14532d]" },
  partial_overlap: { label: "Partly agree", tone: "bg-hand-soft text-hand-ink" },
  difference: { label: "Each says something different", tone: "bg-star-soft text-star-ink" },
  contradiction: { label: "They don’t agree", tone: "bg-care-soft text-[#7c2d12]" },
  single_source: { label: "Only one reading says this", tone: "bg-line text-ink-2" },
};

/** Plain names for the four numerology numbers. */
export const NUMBER_INFO: Record<NumerologyComponent, { name: string; sanskrit: string; about: string }> = {
  moolank: { name: "Birthday number", sanskrit: "Moolank", about: "Who you are inside. We add up the day you were born." },
  bhagyank: { name: "Life number", sanskrit: "Bhagyank", about: "Where your life is going. We add up your whole birth date." },
  namank: { name: "Name number", sanskrit: "Namank", about: "How people see you. We turn the letters of your name into numbers." },
  personal_year: { name: "This year’s number", sanskrit: "Personal Year", about: "What this year is about for you. It changes on your birthday each year." },
};

export const NUMBER_ORDER: NumerologyComponent[] = ["moolank", "bhagyank", "namank", "personal_year"];

/** Short meanings for the main chart words, shown under each fact. */
export const CHART_WORDS = {
  lagna: { name: "Rising sign", sanskrit: "Lagna", about: "The sign coming up over the sky at the moment you were born. It shapes how you come across." },
  moon: { name: "Your sign", sanskrit: "Rashi", about: "The sign the Moon was in when you were born. It shows your mind and feelings. This is the sign used in Indian horoscopes." },
  nakshatra: { name: "Birth star", sanskrit: "Nakshatra", about: "The group of stars the Moon was near when you were born. It sets the order of the times in your life." },
  sun: { name: "Sun sign", sanskrit: "Surya rashi", about: "The sign the Sun was in. It shows your confidence and what drives you." },
};

/** Plain names for the palm lines. */
export const LINE_WORDS: Record<string, { name: string; about: string }> = {
  heart: { name: "Heart line", about: "Love and feelings" },
  head: { name: "Head line", about: "How you think" },
  life: { name: "Life line", about: "Energy and big changes (not how long you live)" },
  fate: { name: "Fate line", about: "Your work and where life takes you" },
  sun: { name: "Sun line", about: "Success and recognition" },
};

export const HAND_SHAPES: Record<string, string> = {
  earth: "a square palm with short fingers",
  air: "a square palm with long fingers",
  fire: "a long palm with short fingers",
  water: "a long palm with long fingers",
};

/** Evidence items with the same claim text collapse into one, keeping every reason. */
export function uniqueEvidence(evidence: EvidenceItem[]): Array<EvidenceItem & { reasons: string[] }> {
  const map = new Map<string, EvidenceItem & { reasons: string[] }>();
  for (const item of evidence) {
    const existing = map.get(item.claim);
    if (existing) {
      if (!existing.reasons.includes(item.basis)) existing.reasons.push(item.basis);
    } else {
      map.set(item.claim, { ...item, reasons: [item.basis] });
    }
  }
  return [...map.values()];
}

export function generationMessage(status: string | undefined): { title: string; text: string } | null {
  if (!status || status === "generated") return null;
  if (status === "no_source_records" || status === "no_readings") {
    return { title: "Nothing to add here", text: "The old books say nothing about this part, so we don’t make anything up." };
  }
  if (status === "llm_not_configured") {
    return {
      title: "Showing what the books say",
      text: "The writing helper is switched off right now. So you’ll see, one by one, the lines from the books that fit you.",
    };
  }
  return {
    title: "The short summary didn’t finish",
    text: "Our writing helper was too busy. Everything below is still complete. Try again in a minute to get the summary.",
  };
}
