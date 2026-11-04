// Shared helpers that turn reading data into plain words.
import type { Confidence, DomainOutlook, EvidenceItem, NumerologyComponent, Polarity, Relation } from "@/types/readings";

export type Group = "good" | "care" | "other";

/** positive → good; challenge/challenging/negative → care; neutral or mixed → other. */
export function polarityGroup(polarity: Polarity): Group {
  const value = (polarity ?? "").toLowerCase();
  if (value === "positive") return "good";
  if (value.startsWith("challeng") || value === "negative") return "care";
  return "other";
}

/** Group claims by polarity, keeping each claim text once, strongest first. */
export function groupClaims<T extends { claim: string; polarity: Polarity; weight?: number }>(items: T[], perGroup = 6): Record<Group, string[]> {
  const sorted = [...items].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  const groups: Record<Group, string[]> = { good: [], care: [], other: [] };
  const seen = new Set<string>();
  for (const item of sorted) {
    const text = item.claim.trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    const group = polarityGroup(item.polarity);
    if (groups[group].length < perGroup) groups[group].push(text);
  }
  return groups;
}

export const CONFIDENCE_WORDS: Record<Confidence, { label: string; note: string }> = {
  high: { label: "Strong signs", note: "Several parts of your reading point this way." },
  medium: { label: "Some signs", note: "One clear part of your reading points this way." },
  low: { label: "Weak signs", note: "Only a little points this way, or the signs are mixed." },
};

export const DOMAIN_WORDS: Record<DomainOutlook["assessment"], { label: string; color: string }> = {
  strong: { label: "Strong", color: "#15803d" },
  supportive: { label: "Good", color: "#4d7c0f" },
  mixed: { label: "Mixed", color: "#b45309" },
  challenging: { label: "Needs care", color: "#b91c1c" },
};

export const RELATION_WORDS: Record<Relation, { label: string; tone: string }> = {
  agreement: { label: "They agree", tone: "bg-good-soft text-[#14532d]" },
  partial_overlap: { label: "Partly agree", tone: "bg-hand-soft text-hand-ink" },
  difference: { label: "Different sides", tone: "bg-star-soft text-star-ink" },
  contradiction: { label: "They disagree", tone: "bg-care-soft text-[#7c2d12]" },
  single_source: { label: "Only one reading", tone: "bg-line text-ink-2" },
};

/** Plain names for the four numerology numbers. */
export const NUMBER_INFO: Record<NumerologyComponent, { name: string; sanskrit: string; about: string }> = {
  moolank: { name: "Birth-day number", sanskrit: "Moolank", about: "Your inner self. It comes from the day of the month you were born." },
  bhagyank: { name: "Life-path number", sanskrit: "Bhagyank", about: "The direction of your life. It comes from your full date of birth." },
  namank: { name: "Name number", sanskrit: "Namank", about: "How other people see you. It comes from the letters of your name." },
  personal_year: { name: "Year number", sanskrit: "Personal Year", about: "What this year is about for you. It changes every year." },
};

export const NUMBER_ORDER: NumerologyComponent[] = ["moolank", "bhagyank", "namank", "personal_year"];

/** Short meanings for the main chart words, shown under each fact. */
export const CHART_WORDS = {
  lagna: { name: "Rising sign", sanskrit: "Lagna", about: "The sign rising in the east when you were born. It shapes your nature." },
  moon: { name: "Moon sign", sanskrit: "Rashi", about: "Where the Moon was. It describes your mind and feelings." },
  nakshatra: { name: "Birth star", sanskrit: "Nakshatra", about: "One of 27 star groups. Yours sets the order of your life periods." },
  sun: { name: "Sun sign", sanskrit: "Surya rashi", about: "Where the Sun was. It stands for your core self and confidence." },
};

/** Plain names for the palm lines. */
export const LINE_WORDS: Record<string, { name: string; about: string }> = {
  heart: { name: "Heart line", about: "Love and feelings" },
  head: { name: "Head line", about: "How you think" },
  life: { name: "Life line", about: "Energy and big changes (not how long you live)" },
  fate: { name: "Fate line", about: "Work and life path" },
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
    return { title: "Nothing to add here", text: "The traditional books have nothing to say about this part, so we don’t make anything up." };
  }
  if (status === "llm_not_configured") {
    return {
      title: "Showing what the books say",
      text: "The AI writer is switched off on this site, so instead of a written summary you’ll see the traditional statements that apply to you, one by one.",
    };
  }
  return {
    title: "The written summary didn’t finish",
    text: "Our AI writer was too busy just now. Your results and the traditional statements below are complete. You can make the reading again in a minute to get the written summary.",
  };
}
