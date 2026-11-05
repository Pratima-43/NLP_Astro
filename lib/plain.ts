// Plain, everyday versions of the book sentences, so anyone can follow a reading.
// The original wording is kept and shown in small print under "The book says".
import PLAIN from "@/lib/plain-claims.json";

const MAP = PLAIN as Record<string, string>;

/** The plain version of a book sentence, or the sentence itself if we have none. */
export function plainClaim(text: string): string {
  const key = text.trim();
  return MAP[key] ?? key;
}

/** True when the plain version differs from the book's own words. */
export function hasPlainVersion(text: string): boolean {
  const key = text.trim();
  return key in MAP && MAP[key] !== key;
}
