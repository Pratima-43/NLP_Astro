// Small formatting helpers that turn API values into plain, friendly words.

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2031-01-12" → "12 January 2031" (no time-zone shifts: the date is read as written). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m) return iso;
  return d ? `${d} ${MONTHS[m - 1]} ${y}` : `${MONTHS[m - 1]} ${y}`;
}

/** "2031-01-12" → "January 2031". */
export function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return "";
  const [y, m] = iso.slice(0, 10).split("-").map(Number);
  return y && m ? `${MONTHS[m - 1]} ${y}` : iso;
}

/** "07:30" → "7:30 am", "19:05" → "7:05 pm". */
export function formatTime(hhmm: string | null | undefined): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

/** ["a", "b", "c"] → "a, b and c". */
export function joinWords(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function firstName(name: string | null | undefined): string {
  return (name ?? "").trim().split(/\s+/)[0] ?? "";
}

/** "snake_case" or "kebab-case" → "Snake case". */
export function humanize(value: string | null | undefined): string {
  if (!value) return "";
  const text = value.replace(/[_-]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Shorten a long geocoder address ("Nellore, Nellore Mandal, …, India") for display. */
export function shortPlace(place: string | null | undefined): string {
  if (!place) return "";
  const parts = place.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 3) return parts.join(", ");
  const country = parts[parts.length - 1];
  const region = parts.slice(1, -1).reverse().find((p) => !/^\d+$/.test(p) && !/mandal|district|taluk|tehsil/i.test(p));
  return [parts[0], region, country].filter(Boolean).join(", ");
}

/** 1 → "1st", 19 → "19th", 22 → "22nd". */
export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}
