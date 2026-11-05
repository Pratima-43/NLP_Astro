// Life areas in everyday words, shared by every reading.
import { Briefcase, Brain, HeartHandshake, HeartPulse, Home, Megaphone, Sparkles, Wallet, type LucideIcon } from "lucide-react";
import { plainClaim } from "@/lib/plain";
import { polarityGroup } from "@/lib/readings";
import type { Polarity } from "@/types/readings";

export type AreaKey = "relationships" | "finance" | "career" | "health" | "family" | "education" | "communication" | "spirituality";

export const AREAS: Record<AreaKey, { name: string; icon: LucideIcon }> = {
  relationships: { name: "Love and people", icon: HeartHandshake },
  finance: { name: "Money", icon: Wallet },
  career: { name: "Work", icon: Briefcase },
  health: { name: "Health", icon: HeartPulse },
  family: { name: "Family", icon: Home },
  education: { name: "Mind", icon: Brain },
  communication: { name: "Speaking up", icon: Megaphone },
  spirituality: { name: "Inner peace", icon: Sparkles },
};

/** The order areas are shown in: what most people ask about first. */
export const AREA_ORDER: AreaKey[] = ["relationships", "finance", "career", "health", "family", "education", "communication", "spirituality"];

// Like the backend's THEME_KEYWORDS, but for the plain sentences people actually read.
// Each pattern starts at a word start, so "art" matches "artistic" but not "heart".
const PATTERNS: Partial<Record<AreaKey, RegExp>> = {
  relationships: /\b(?:love|loving|marriage|marry|married|partners?|relationships?|romance|romantic|jealous|people|friends?|others|team|alone|lonely|kind|caring)\b/i,
  finance: /\b(?:money|wealth|income|rich|debt|property|save|saving|spend|spending|buying|selling|trade|cars?|nice things|comfort)\b/i,
  career: /\b(?:work|works|job|business|boss|bosses|lead|leader|leading|success|goals?|status|duty|duties|organis\w*|top job|plans?|planning)\b/i,
  health: /\b(?:health|energy|body|illness|injur\w*|cuts|check-ups|tire|tired|nerves|willpower)\b/i,
  family: /\b(?:family|mother|father|home|children|child|brothers?|sisters?|parents?)\b/i,
  education: /\b(?:mind|think\w*|learn\w*|clever|worry|decide|focus|imagination|ideas|study|school|curious)\b/i,
};

export interface AreaNote {
  key: AreaKey;
  good: string[];
  care: string[];
}

/** Sort book sentences into life areas, in plain words, at most `perSide` good and watch-out lines each. */
export function sortIntoAreas<T extends { claim: string; polarity: Polarity; weight?: number }>(items: T[], perSide = 2): AreaNote[] {
  const sorted = [...items].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  const notes = new Map<AreaKey, AreaNote>();
  const seen = new Set<string>();
  for (const item of sorted) {
    const plain = plainClaim(item.claim);
    // "Your birth date mixes the Sun's and Mars's energy" is background, not about one part of life.
    if (!plain || seen.has(plain) || / mixes /.test(plain)) continue;
    const group = polarityGroup(item.polarity);
    const haystack = plain;
    for (const key of AREA_ORDER) {
      const pattern = PATTERNS[key];
      if (!pattern || !pattern.test(haystack)) continue;
      const note = notes.get(key) ?? { key, good: [], care: [] };
      const side = group === "care" ? note.care : note.good;
      if (side.length < perSide) {
        side.push(plain);
        seen.add(plain);
        notes.set(key, note);
        break;
      }
    }
  }
  return AREA_ORDER.map((k) => notes.get(k)).filter((n): n is AreaNote => Boolean(n));
}
